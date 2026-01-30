import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { OrganizationContext } from './OrganizationContext';
import type { OrgContextValue, Organization, Membership, CreateOrganizationPayload, CreateOrganizationResponse, ActiveOrganizationResponse, GetOrganizationResponse, MembershipsListResponse, MembershipWithOrgDTO } from '../types/organization.types';
import { ACTIVE_ORG_STORAGE_KEY } from '../types/organization.types';
import type { AxiosResponse } from 'axios';

type MembershipWithOrg = MembershipWithOrgDTO;

function hasProp<T extends PropertyKey>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && Object.prototype.hasOwnProperty.call(obj, prop as string);
}

function isMembershipWithOrg(obj: unknown): obj is MembershipWithOrgDTO {
  return Boolean(obj && typeof obj === 'object' && (hasProp(obj, 'organization') || hasProp(obj, 'organizationId')));
}

function isWrappedActiveResponse(obj: unknown): obj is { organization?: Organization; membership?: Membership } {
  return Boolean(obj && typeof obj === 'object' && (hasProp(obj, 'organization') || hasProp(obj, 'membership')));
}

function isActiveOrganizationResponse(obj: unknown): obj is ActiveOrganizationResponse {
  return Boolean(obj && typeof obj === 'object' && hasProp(obj, 'organizationId'));
}

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err;
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(String(err));
  }
}

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberships, setMemberships] = useState<MembershipWithOrg[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganizations = useCallback(async (): Promise<void> => {
    console.debug('OrganizationProvider: fetchOrganizations start');
    setLoading(true);
    setError(null);
    try {
      const res: AxiosResponse<MembershipsListResponse | MembershipWithOrg[]> = await apiClient.get('/memberships/my-organizations');
      const membershipsRaw = res?.data ?? { data: [] };
      const rawArray = Array.isArray(membershipsRaw) ? membershipsRaw : (membershipsRaw.data ?? []);
      const memberships: MembershipWithOrg[] = (rawArray as MembershipWithOrgDTO[]).map((m) => ({
        id: m.id,
        userId: m.userId ?? m.user ?? '',
        organizationId: m.organizationId ?? m.organization?.id ?? '',
        role: m.role ?? 'member',
        status: m.status ?? 'active',
        joinedAt: m.joinedAt,
        organization: m.organization,
      }));
      setMemberships(memberships);
      // extract populated organizations
      const orgs: Organization[] = memberships
        .map((m) => m.organization)
        .filter((o): o is Organization => Boolean(o));
      setOrganizations(orgs);
      // if activeOrganization is set, try to set membership for it
      if (activeOrganization) {
        const found = memberships.find((m) => m.organization?.id === activeOrganization.id || m.organizationId === activeOrganization.id);
        if (found) {
          const normalized: Membership = {
            id: found.id,
            userId: found.userId ?? found.user ?? '',
            organizationId: found.organizationId ?? found.organization?.id ?? '',
            role: found.role ?? 'member',
            status: found.status ?? 'active',
            joinedAt: found.joinedAt,
          };
          setMembership(normalized);
        }
      }
    } catch (err: unknown) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [activeOrganization]);
 const fetchActiveOrganization = useCallback(async (): Promise<void> => {
    console.debug('OrganizationProvider: fetchActiveOrganization start');
    setLoading(true);
    setError(null);
    try {
      // Expecting { success: boolean, organizationId?: string }
      const res: AxiosResponse<ActiveOrganizationResponse> = await apiClient.get('/memberships/active-organization');
      console.debug('OrganizationProvider: fetchActiveOrganization response', res?.data);
      const data = res?.data;

      if (data && data.success && data.organizationId) {
        const orgId = data.organizationId;
        const orgRes: AxiosResponse<GetOrganizationResponse> = await apiClient.get(`/organizations/${orgId}`);
        setActiveOrganizationState(orgRes.data.organization as Organization);
        setMembership(null);
        try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId); } catch { console.log('localStorage error'); }
        return;
      }

      // If API didn't return an active organization, try to restore from localStorage
      const stored = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      if (stored) {
        try {
          const orgRes: AxiosResponse<GetOrganizationResponse> = await apiClient.get(`/organizations/${stored}`);
          setActiveOrganizationState(orgRes.data.organization as Organization);
          return;
        } catch  {
          try { localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY); } catch { /* ignore */ }
        }
      }

      // no active org available
      setActiveOrganizationState(null);
      setMembership(null);
    } catch (err: unknown) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, []);
  const validateActiveMembership = useCallback(async (): Promise<void> => {
    if (!activeOrganization) return;
    console.debug('OrganizationProvider: validateActiveMembership for', activeOrganization?.id);

    // if we already have a membership matching the active org and it's active, keep it
    if (membership && String(membership.organizationId) === String(activeOrganization.id) && membership.status === 'active') {
      return;
    }

    // try to find in loaded memberships cache first
    let found = memberships.find((m) => (m.organization?.id === activeOrganization.id || m.organizationId === activeOrganization.id) && m.status === 'active');
    if (found) {
      const normalized: Membership = {
        id: found.id,
        userId: found.userId ?? found.user ?? '',
        organizationId: found.organizationId ?? found.organization?.id ?? '',
        role: found.role ?? 'member',
        status: found.status ?? 'active',
        joinedAt: found.joinedAt,
      };
      setMembership(normalized);
      return;
    }

    // If not found in cache, explicitly query the backend to validate membership.
    try {
      // get the user's memberships and try to find an active membership for the active org
      const listRes = await apiClient.get('/memberships/my-organizations');
      const listRaw = listRes?.data ?? { data: [] };
      const listArray = Array.isArray(listRaw) ? listRaw : (listRaw.data ?? []);
      const remoteMemberships: MembershipWithOrg[] = (listArray as MembershipWithOrgDTO[]).map((m) => ({
        id: m.id,
        userId: m.userId ?? m.user ?? '',
        organizationId: m.organizationId ?? m.organization?.id ?? '',
        role: m.role ?? 'member',
        status: m.status ?? 'active',
        joinedAt: m.joinedAt,
        organization: m.organization,
      }));
      found = remoteMemberships.find((m) => (m.organization?.id === activeOrganization.id || m.organizationId === activeOrganization.id) && m.status === 'active');
      if (found) {
        const userIdFromFound = found.userId ?? (hasProp(found, 'user') ? String(found.user) : '');
        const normalized: Membership = {
          id: found.id,
          userId: userIdFromFound,
          organizationId: found.organizationId ?? found.organization?.id ?? '',
          role: found.role ?? 'member',
          status: found.status ?? 'active',
          joinedAt: found.joinedAt,
        };
        setMembership(normalized);
        // also update cached memberships/state
        setMemberships(remoteMemberships);
        return;
      }

      // as a last resort ask server for the active-organization endpoint (may include membership)
      const activeRes = await apiClient.get<ActiveOrganizationResponse | MembershipWithOrg | Organization | string>('/memberships/active-organization');
      const activeData = activeRes?.data ?? null;
      if (activeData) {
        if (isWrappedActiveResponse(activeData)) {
          const wrapped = activeData as unknown as { organization?: Organization; membership?: Membership };
          if (wrapped.membership && String(wrapped.membership.organizationId) === String(activeOrganization.id) && wrapped.membership.status === 'active') {
            setMembership(wrapped.membership as Membership);
            setActiveOrganizationState(wrapped.organization ?? null);
            try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, wrapped.organization?.id || ''); } catch { /* noop */ }
            return;
          }
        } else if (isMembershipWithOrg(activeData)) {
          const found2 = activeData as MembershipWithOrg;
          if (String(found2.organization?.id) === String(activeOrganization.id) && found2.status === 'active') {
            const normalized: Membership = {
              id: found2.id,
              userId: found2.userId ?? found2.user ?? '',
              organizationId: found2.organizationId ?? found2.organization?.id ?? '',
              role: found2.role ?? 'member',
              status: found2.status ?? 'active',
              joinedAt: found2.joinedAt,
            };
            setMembership(normalized);
            setActiveOrganizationState(found2.organization ?? null);
            try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, found2.organization?.id || ''); } catch { /* noop */ }
            return;
          }
        } else if (typeof activeData === 'string') {
          // server returned organization id as string
          const orgId = activeData as string;
          if (orgId && String(orgId) === String(activeOrganization.id)) {
            const orgRes = await apiClient.get<GetOrganizationResponse>(`/organizations/${orgId}`);
            setActiveOrganizationState(orgRes.data.organization);
            try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId); } catch { /* noop */ }
            return;
          }
        } else if (isActiveOrganizationResponse(activeData)) {
          const orgId = activeData.organizationId;
          if (orgId && String(orgId) === String(activeOrganization.id)) {
            const orgRes = await apiClient.get<GetOrganizationResponse>(`/organizations/${orgId}`);
            setActiveOrganizationState(orgRes.data.organization);
            try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId); } catch { /* noop */ }
            return;
          }
        }
      }

      // still no membership -> clear active org
      console.debug('OrganizationProvider: no active membership found, clearing active org');
      setActiveOrganizationState(null);
      setMembership(null);
      try { localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY); } catch (e) { console.log('OrganizationProvider: localStorage remove failed', e); }
    } catch (err) {
      setError(normalizeError(err));
    }
  }, [activeOrganization, membership, memberships]);

 

  const setActiveOrganization = useCallback(async (orgId: string): Promise<void> => {
    console.debug('OrganizationProvider: setActiveOrganization', orgId);
    setLoading(true);
    // optimistic update: remember previous active org to rollback on failure
    const previousActive = activeOrganization;
    // try to find the organization in the cached list for a nicer optimistic UI
    const cachedOrg = organizations.find((o) => String(o.id) === String(orgId));
    const optimisticOrg: Organization = cachedOrg ?? ({ id: orgId, name: 'Organization' } as Organization);
    try {
      // apply optimistic UI update immediately
      setActiveOrganizationState(optimisticOrg);
      try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId); } catch { console.log('localStorage error'); }

      // request server-side change
      await apiClient.post('/memberships/set-active', { organizationId: orgId });

      // fetch canonical organization data and update
      const res: AxiosResponse<GetOrganizationResponse> = await apiClient.get(`/organizations/${orgId}`);
      const org = res.data.organization as Organization;
      setActiveOrganizationState(org);
      try { localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, org.id); } catch { console.log('localStorage error'); }

      // refresh membership info for the active org (server may return this elsewhere)
      try {
        await fetchActiveOrganization();
      } catch (e) {
        // non-fatal: membership refresh failed, but active org change succeeded
        console.log('OrganizationProvider: fetchActiveOrganization after set-active failed', e);
      }
    } catch (err: unknown) {
      // rollback optimistic update
      setActiveOrganizationState(previousActive ?? null);
      try {
        if (previousActive) {
          localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, previousActive.id);
        } else {
          localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
        }
      } catch { /* ignore localStorage errors */ }

      const e = normalizeError(err);
      // show toast to inform user about rollback/failure
      try {
        showToast({
          title: 'Organization switch failed',
          message: e.message || 'Unable to change active organization. Reverted to previous organization.',
          variant: 'danger',
        });
      } catch (toastErr) {
        // non-fatal if toast fails
        console.log('OrganizationProvider: showToast failed', toastErr);
      }
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, organizations, fetchActiveOrganization, showToast]);

  const createOrganization = useCallback(async (payload: CreateOrganizationPayload): Promise<Organization> => {
    setLoading(true);
    try {
      const res: AxiosResponse<CreateOrganizationResponse> = await apiClient.post('/organizations', payload);
      const data = res.data;
      if (res.status >= 200 && res.status < 300 && data && data.organization) {
        const org = data.organization as Organization;
        // refresh list and set active
        await fetchOrganizations();
        await setActiveOrganization(org.id);
        return org;
      }
      throw new Error(data?.message || 'Unexpected response from server');
    } catch (err: unknown) {
      const e = normalizeError(err);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchOrganizations, setActiveOrganization]);

  const refreshOrganization = useCallback(async (orgId?: string): Promise<void> => {
    setLoading(true);
    try {
      const id = orgId || activeOrganization?.id;
      if (!id) return;
      const res: AxiosResponse<GetOrganizationResponse> = await apiClient.get(`/organizations/${id}`);
      setActiveOrganizationState(res.data.organization as Organization);
    } catch (err: unknown) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [activeOrganization]);

  const clearOrganization = useCallback(() => {
    setActiveOrganizationState(null);
    setMembership(null);
    try {
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
    } catch {console.log('localStorage error');}
  }, []);

  const hasRole = useCallback((roles: string | string[]) => {
    if (!membership) return false;
    const r = Array.isArray(roles) ? roles : [roles];
    return r.includes(String(membership.role));
  }, [membership]);

  const isAdmin = useCallback(() => hasRole(['admin', 'owner']), [hasRole]);
  const isOwner = useCallback(() => hasRole(['owner']), [hasRole]);

  // Initialize when user authenticates
  useEffect(() => {
    if (!isAuthenticated) {
      // clear local state when logged out
      setOrganizations([]);
      setActiveOrganizationState(null);
      setMembership(null);
      setError(null);
      return;
    }
    // fetch organizations and active org in sequence and validate membership
    const init = async () => {
      try {
        await fetchOrganizations();
        await fetchActiveOrganization();
        await validateActiveMembership();
      } catch (e) {
        setError(normalizeError(e));
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = useMemo<OrgContextValue>(
    () => ({
      organizations,
      activeOrganization,
      membership,
      loading,
      error,
      fetchOrganizations,
      fetchActiveOrganization,
      setActiveOrganization,
      createOrganization,
      refreshOrganization,
      clearOrganization,
      hasRole,
      isAdmin,
      isOwner,
    }),
    [organizations, activeOrganization, membership, loading, error, fetchOrganizations, fetchActiveOrganization, setActiveOrganization, createOrganization, refreshOrganization, clearOrganization, hasRole, isAdmin, isOwner]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export default OrganizationProvider;
