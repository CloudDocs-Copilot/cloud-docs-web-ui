import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Spinner, Form } from 'react-bootstrap';
import useOrganization from '../hooks/useOrganization';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { useAuth } from '../hooks/useAuth';
import styles from './OrganizationSettings.module.css';
import InviteMemberModal from '../components/InviteMemberModal';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { apiClient } from '../api';
import { useToast } from '../hooks/useToast';

interface OrgMemberUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

interface OrgMember {
  id: string;
  user?: OrgMemberUser | null;
  organization?: string | null;
  role?: string | null;
  status?: string | null;
  rootFolder?: string | null;
  joinedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Small MD5 implementation (public domain compact version)
function md5(str: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str: string) {
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const wordArray = new Array<number>(lNumberOfWords - 1);
    let bytePosition = 0;
    let byteCount = 0;
    while (byteCount < lMessageLength) {
      const wordCount = (byteCount - (byteCount % 4)) / 4;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordCount] = (wordArray[wordCount] | (str.charCodeAt(byteCount) << bytePosition)) >>> 0;
      byteCount++;
    }
    const wordCount = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition);
    wordArray[lNumberOfWords - 2] = (lMessageLength << 3) >>> 0;
    wordArray[lNumberOfWords - 1] = (lMessageLength >>> 29) >>> 0;
    return wordArray;
  }
  function wordToHex(lValue: number) {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }
  const x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

const OrganizationSettings: React.FC = () => {
  const { activeOrganization, isAdmin, isOwner } = useOrganization();
  usePageTitle({
    title: 'Configuración de Organización',
    subtitle: 'Gestiona miembros y ajustes',
    documentTitle: 'Configuración de Organización',
    metaDescription: 'Ajustes y gestión de miembros de la organización activa'
  });
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // UI state for search & pagination
  const [query, setQuery] = useState('');
  // pagination removed — backend does not support paged listings
  const [pendingRoleChange, setPendingRoleChange] = useState<{ member: OrgMember; newRole: string } | null>(null);
  const [processingRoleChange, setProcessingRoleChange] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<OrgMember | null>(null);
  const [processingRevoke, setProcessingRevoke] = useState(false);
  const [pendingResend, setPendingResend] = useState<OrgMember | null>(null);
  const [processingResend, setProcessingResend] = useState(false);

  const fetchMembers = async () => {
    if (!activeOrganization) {
      setMembers([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await apiClient.get(`/organizations/${activeOrganization.id}/members`);
      const payload = res?.data;
      let items: OrgMember[] = [];
     
      if (Array.isArray(payload)) {
        items = payload;
        
      } else if (payload && Array.isArray(payload.data)) {
        items = payload.data;
        
      } else if (payload && Array.isArray(payload.members)) {
        items = payload.members;
        
      } else {
        items = [];
      
      }
      setMembers(items);
      // no server-side pagination; client handles filtering only
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Error al cargar miembros';
      showToast({ message: msg, variant: 'danger', title: 'Organización' });
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization]);

  return (
    <MainLayout>
      <Container fluid className={styles.container}>
      <Row className="mb-2">
        <Col>
          <p>Organización activa: <strong>{activeOrganization?.name ?? 'Ninguna'}</strong></p>
          <div className="mt-2">
            {(isAdmin() || isOwner()) ? (
              <Button size="sm" variant="outline-primary" onClick={() => setShowInvite(true)}>
                Invitar miembro
              </Button>
            ) : (
              <small className="text-muted">Necesitas permisos de administrador para invitar miembros.</small>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Miembros</h5>
            <Form.Control
              placeholder="Buscar por nombre o email"
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              style={{ width: 280 }}
              size="sm"
            />
          </div>
          <div className="mt-2 mb-2">{loadingMembers && <Spinner animation="border" size="sm" />}</div>
          <Table hover size="sm">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = members.filter((m) => {
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  return ((m.user?.name ?? '') + ' ' + (m.user?.email ?? '')).toLowerCase().includes(q);
                });
                const pageMembers = filtered;
                return (
                  <>
                    {pageMembers.map((m) => (
                      <tr key={m.id}>
                              <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                  <div style={{width:32, height:32, borderRadius:16, overflow:'hidden', position:'relative'}}>
                                    {/* Image (photoUrl preferred, then Gravatar). Hidden on error to reveal initials fallback */}
                                    {(() => {
                                      const email = (m.user?.email ?? '').trim().toLowerCase();
                                      const gravatar = email ? `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=64` : null;
                                      const src = m.user?.avatar ?? gravatar ?? undefined;
                                      return src ? (
                                        <img
                                          src={src}
                                          alt={m.user?.name ?? m.user?.email ?? 'avatar'}
                                          style={{width:32, height:32, objectFit:'cover', display:'block'}}
                                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                        />
                                      ) : null;
                                    })()}
                                    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#6366f1', color:'#fff', fontWeight:600}}>
                                      {((m.user?.name ?? m.user?.email ?? 'U').trim()[0] || 'U').toUpperCase()}
                                    </div>
                                  </div>
                                  <div>{m.user?.name ?? m.user?.email ?? '—'}</div>
                                </div>
                              </td>
                              <td>{m.user?.email ?? '—'}</td>
                              <td>
                                {(isAdmin() || isOwner()) ? (
                                  (m.role === 'owner') ? (
                                    <strong>owner</strong>
                                  ) : (
                                    <Form.Select
                                      size="sm"
                                      value={m.role ?? 'member'}
                                      onChange={(e) => {
                                        const newRole = e.target.value;
                                        if (!activeOrganization) return;
                                        if (m.user?.id && user && m.user.id === user.id) {
                                          showToast({ message: 'No puedes cambiar tu propio rol', variant: 'warning', title: 'Organización' });
                                          return;
                                        }
                                        setPendingRoleChange({ member: m, newRole });
                                      }}
                                    >
                                      <option value="admin">admin</option>
                                      <option value="member">member</option>
                                      <option value="viewer">viewer</option>
                                    </Form.Select>
                                  )
                                ) : (
                                  <span>{m.role ?? '—'}</span>
                                )}
                              </td>
                              <td>{m.status ?? '—'}</td>
                        <td className="text-end">
                          {(isAdmin() || isOwner()) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                disabled={Boolean(m.user?.id && user && m.user.id === user.id)}
                                onClick={() => {
                                  if (!activeOrganization) return;
                                  if (m.user?.id && user && m.user.id === user.id) {
                                    showToast({ message: 'No puedes revocar tu propia membresía', variant: 'warning', title: 'Organización' });
                                    return;
                                  }
                                  setPendingRevoke(m);
                                }}
                                className="me-2"
                              >
                                Revocar
                              </Button>
                              {m.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => setPendingResend(m)}
                                >
                                  Reenviar
                                </Button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* pagination controls removed — backend does not support paged listings */}
                  </>
                );
              })()}
            </tbody>
          </Table>
        </Col>
      </Row>
      <InviteMemberModal show={showInvite} onHide={() => setShowInvite(false)} onSuccess={() => fetchMembers()} />

      <ConfirmActionModal
        show={!!pendingRoleChange}
        title="Confirmar cambio de rol"
        confirmLabel="Confirmar"
        confirmVariant="primary"
        processing={processingRoleChange}
        onCancel={() => setPendingRoleChange(null)}
        onConfirm={async () => {
          const pending = pendingRoleChange;
          if (!pending || !activeOrganization) return;
          setProcessingRoleChange(true);
          try {
            await apiClient.patch(`/organizations/${activeOrganization.id}/members/${pending.member.id}`, { role: pending.newRole });
            showToast({ message: 'Rol actualizado', variant: 'success', title: 'Organización' });
            setPendingRoleChange(null);
            fetchMembers();
          } catch (err: unknown) {
            const msg = (err as Error)?.message ?? 'Error al actualizar rol';
            showToast({ message: msg, variant: 'danger', title: 'Organización' });
          } finally {
            setProcessingRoleChange(false);
          }
        }}
      >
        <p>
          ¿Confirmas cambiar el rol de <strong>{pendingRoleChange?.member.user?.name ?? pendingRoleChange?.member.user?.email}</strong> a <strong>{pendingRoleChange?.newRole}</strong>?
        </p>
      </ConfirmActionModal>

      <ConfirmActionModal
        show={!!pendingRevoke}
        title="Confirmar revocación"
        confirmLabel="Revocar"
        confirmVariant="danger"
        processing={processingRevoke}
        onCancel={() => setPendingRevoke(null)}
        onConfirm={async () => {
          const target = pendingRevoke;
          if (!target || !activeOrganization) return;
          setProcessingRevoke(true);
          try {
            await apiClient.delete(`/organizations/${activeOrganization.id}/members/${target.id}`);
            showToast({ message: 'Miembro revocado', variant: 'success', title: 'Organización' });
            setPendingRevoke(null);
            fetchMembers();
          } catch (err: unknown) {
            const msg = (err as Error)?.message ?? 'Error al revocar';
            showToast({ message: msg, variant: 'danger', title: 'Organización' });
          } finally {
            setProcessingRevoke(false);
          }
        }}
      >
        <p>¿Confirmas revocar a <strong>{pendingRevoke?.user?.name ?? pendingRevoke?.user?.email}</strong> de la organización?</p>
      </ConfirmActionModal>

      <ConfirmActionModal
        show={!!pendingResend}
        title="Confirmar reenvío"
        confirmLabel="Reenviar"
        confirmVariant="primary"
        processing={processingResend}
        onCancel={() => setPendingResend(null)}
        onConfirm={async () => {
          const target = pendingResend;
          if (!target || !activeOrganization) return;
          setProcessingResend(true);
          try {
            await apiClient.post(`/organizations/${activeOrganization.id}/members/${target.id}/resend`);
            showToast({ message: 'Invitación reenviada', variant: 'success', title: 'Organización' });
            setPendingResend(null);
            fetchMembers();
          } catch (err: unknown) {
            const msg = (err as Error)?.message ?? 'Error al reenviar invitación';
            showToast({ message: msg, variant: 'danger', title: 'Organización' });
          } finally {
            setProcessingResend(false);
          }
        }}
      >
        <p>¿Deseas reenviar la invitación a <strong>{pendingResend?.user?.name ?? pendingResend?.user?.email}</strong>?</p>
      </ConfirmActionModal>
      </Container>
    </MainLayout>
  );
};

export default OrganizationSettings;

