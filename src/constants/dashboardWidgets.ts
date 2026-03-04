import type { MembershipRole } from '../types/organization.types';

export type WidgetId =
  | 'org-context-banner'
  | 'storage'
  | 'members-overview'
  | 'recent-documents'
  | 'quick-actions'
  | 'notifications'
  | 'plan-info';

export interface WidgetConfig {
  id: WidgetId;
  order: number;
  /** Column span on lg breakpoint (1-12). Default: 4 (3 columns). */
  lgCols?: number;
  /** Column span on md breakpoint (1-12). Default: 6 (2 columns). */
  mdCols?: number;
}

export const DASHBOARD_WIDGETS_BY_ROLE: Record<MembershipRole, WidgetConfig[]> = {
  owner: [
    { id: 'org-context-banner', order: 1, lgCols: 12, mdCols: 12 },
    { id: 'storage', order: 2, lgCols: 4, mdCols: 6 },
    { id: 'members-overview', order: 3, lgCols: 4, mdCols: 6 },
    { id: 'plan-info', order: 4, lgCols: 4, mdCols: 6 },
    { id: 'quick-actions', order: 5, lgCols: 6, mdCols: 12 },
    { id: 'notifications', order: 6, lgCols: 6, mdCols: 12 },
    { id: 'recent-documents', order: 7, lgCols: 12, mdCols: 12 },
  ],
  admin: [
    { id: 'org-context-banner', order: 1, lgCols: 12, mdCols: 12 },
    { id: 'storage', order: 2, lgCols: 4, mdCols: 6 },
    { id: 'members-overview', order: 3, lgCols: 4, mdCols: 6 },
    { id: 'quick-actions', order: 4, lgCols: 4, mdCols: 6 },
    { id: 'notifications', order: 5, lgCols: 6, mdCols: 12 },
    { id: 'recent-documents', order: 6, lgCols: 12, mdCols: 12 },
  ],
  member: [
    { id: 'org-context-banner', order: 1, lgCols: 12, mdCols: 12 },
    { id: 'quick-actions', order: 2, lgCols: 4, mdCols: 6 },
    { id: 'notifications', order: 3, lgCols: 8, mdCols: 6 },
    { id: 'recent-documents', order: 4, lgCols: 12, mdCols: 12 },
  ],
  viewer: [
    { id: 'org-context-banner', order: 1, lgCols: 12, mdCols: 12 },
    { id: 'recent-documents', order: 2, lgCols: 12, mdCols: 12 },
  ],
};
