import React, { useEffect, useMemo } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageInfoTitle';

const ConfirmAccount: React.FC = () => {

   usePageTitle({
      title: 'Confirmación de Cuenta',
      subtitle: '¡Tu cuenta ha sido confirmada exitosamente!',
      documentTitle: 'Confirmación de Cuenta',
      metaDescription: 'Página de confirmación de cuenta para usuarios que han verificado su correo electrónico.'
    }); 
  const navigate = useNavigate();
  const location = useLocation();
  // Se espera URL: /auth/confirmed?userId=...&status=confirmed|already_active
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const status = params.get('status');

  const message = useMemo(() => {
    if (status === 'confirmed') return '¡Cuenta confirmada! Bienvenido/a. Ya puedes iniciar sesión.';
    if (status === 'already_active') return 'La cuenta ya estaba confirmada. Redirigiendo...';
    return 'No se pudo verificar el estado de la cuenta. Si el problema persiste, contacta soporte.';
  }, [status]);

  useEffect(() => {
    if (status === 'already_active') {
      navigate('/login', { replace: true });
    }
  }, [status, navigate]);

  return (
    <div
      style={{
        minHeight: '72vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
                borderRadius: 12,
                padding: '36px 28px',
                boxShadow: '0 8px 30px rgba(15,23,42,0.08)',
                border: '1px solid rgba(99,102,241,0.08)'
              }}
            >
              <div className="text-center mb-3">
                <div style={{ fontSize: 56 }}>📄</div>
                <h2 style={{ color: '#4f46e5', marginTop: 8, marginBottom: 6 }}>CloudDocs Copilot</h2>
                <p style={{ marginBottom: 0, color: '#6b7280' }}>Confirmación de cuenta</p>
              </div>

              <div className="text-center mt-3">
                <style>{`
                  .confirm-icon { display:inline-block; }
                  .confirm-icon svg { width:96px; height:96px; display:block; }
                  .confirm-circle { transform-origin: 48px 48px; animation: pop 600ms cubic-bezier(.2,.9,.3,1) both; }
                  .confirm-check { fill: none; stroke: #fff; stroke-width:4; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray: 80; stroke-dashoffset: 80; animation: draw 520ms ease-out 220ms forwards; }
                  @keyframes draw { to { stroke-dashoffset: 0; } }
                  @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
                `}</style>

                <div className="confirm-icon" aria-hidden>
                  <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                    <g>
                      <circle className="confirm-circle" cx="48" cy="48" r="36" fill="#10b981" />
                      <path className="confirm-check" d="M34 50 L44 60 L64 40" />
                    </g>
                  </svg>
                </div>

                <h1 className="mb-3" style={{ color: '#111827' }}>¡Bienvenido/a!</h1>
                <p className="mb-4" style={{ color: '#374151' }}>{message}</p>

                <div className="d-flex justify-content-center gap-2">
                  <Button
                    style={{ background: '#6366f1', borderColor: '#6366f1' }}
                    onClick={() => navigate('/login')}
                  >
                    Ir a Iniciar Sesión
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/')}> 
                    Volver al Inicio
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ConfirmAccount;
