import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, ChevronLeft } from 'react-bootstrap-icons';
import styles from './Legal.module.css';

/**
 * Página de Legal - Términos, Privacidad y Seguridad
 */
const Legal: React.FC = () => {
  const location = useLocation();

  // Manejar el scroll suave a la sección cuando se carga la página con hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      // Si no hay hash, scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className={styles.legalPage}>
      {/* Header */}
      <div className={styles.header}>
        <Container>
          <Link to="/" className={styles.backLink}>
            <ChevronLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className={styles.title}>Información Legal</h1>
          <p className={styles.subtitle}>Última actualización: 11 de marzo de 2026</p>
        </Container>
      </div>

      {/* Contenido */}
      <Container className={styles.content}>
        <Row>
          {/* Índice lateral */}
          <Col lg={3} className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
              <a 
                href="#aviso-legal" 
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('aviso-legal')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <FileText size={18} />
                Aviso Legal
              </a>
              <a 
                href="#terminos" 
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('terminos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <FileText size={18} />
                Términos y Condiciones
              </a>
              <a 
                href="#privacidad" 
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('privacidad')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Lock size={18} />
                Política de Privacidad
              </a>
              <a 
                href="#seguridad" 
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('seguridad')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ShieldCheck size={18} />
                Seguridad y Datos
              </a>
            </nav>
          </Col>

          {/* Contenido principal */}
          <Col lg={9}>
            {/* Aviso Legal */}
            <section id="aviso-legal" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FileText size={28} className={styles.icon} />
                Aviso Legal
              </h2>
              
              <div className={styles.subsection}>
                <h3>1. Datos Identificativos</h3>
                <p>
                  En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos:
                </p>
                <ul>
                  <li><strong>Titular:</strong> CloudDocs Copilot, S.L.</li>
                  <li><strong>Domicilio Social:</strong> [Dirección Completa]</li>
                  <li><strong>CIF:</strong> [Número de Identificación Fiscal]</li>
                  <li><strong>Email:</strong> legal@clouddocs-copilot.com</li>
                  <li><strong>Teléfono:</strong> +34 XXX XXX XXX</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>2. Objeto</h3>
                <p>
                  CloudDocs Copilot es una plataforma de gestión documental inteligente que combina almacenamiento seguro en la nube con capacidades de inteligencia artificial para organizar, clasificar y analizar documentos de manera eficiente.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>3. Propiedad Intelectual e Industrial</h3>
                <p>
                  El diseño del portal, sus códigos fuente, logos, marcas y demás signos distintivos que aparecen en el mismo pertenecen a CloudDocs Copilot, S.L. y están protegidos por los correspondientes derechos de propiedad intelectual e industrial.
                </p>
                <p>
                  Queda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se pueda realizar con los contenidos de la plataforma sin autorización expresa y por escrito de CloudDocs Copilot, S.L.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>4. Responsabilidad</h3>
                <p>
                  CloudDocs Copilot, S.L. no se hace responsable de los daños y perjuicios que pudieran derivarse de interferencias, omisiones, interrupciones, virus informáticos, averías telefónicas o desconexiones en el funcionamiento operativo de este sistema electrónico, motivadas por causas ajenas a su voluntad.
                </p>
              </div>
            </section>

            {/* Términos y Condiciones */}
            <section id="terminos" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FileText size={28} className={styles.icon} />
                Términos y Condiciones de Uso
              </h2>

              <div className={styles.subsection}>
                <h3>1. Aceptación de los Términos</h3>
                <p>
                  Al acceder y utilizar CloudDocs Copilot, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>2. Registro de Usuario</h3>
                <ul>
                  <li>Para utilizar la plataforma, debe crear una cuenta proporcionando información veraz y actualizada</li>
                  <li>Es responsable de mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                  <li>Debe ser mayor de edad o contar con autorización de su tutor legal</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>3. Uso Permitido</h3>
                <p>Se le concede una licencia limitada, no exclusiva e intransferible para:</p>
                <ul>
                  <li>Subir, almacenar y gestionar sus documentos</li>
                  <li>Utilizar las funcionalidades de IA para análisis y clasificación</li>
                  <li>Compartir documentos dentro de su organización</li>
                  <li>Acceder a reportes y estadísticas de uso</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>4. Uso Prohibido</h3>
                <p>Está expresamente prohibido:</p>
                <ul>
                  <li>Subir contenido ilegal, ofensivo, difamatorio o que infrinja derechos de terceros</li>
                  <li>Intentar acceder sin autorización a sistemas, cuentas o datos de otros usuarios</li>
                  <li>Distribuir malware, virus o código malicioso</li>
                  <li>Realizar ingeniería inversa o intentar extraer código fuente</li>
                  <li>Utilizar la plataforma para actividades fraudulentas o ilegales</li>
                  <li>Sobrecargar o interferir con el funcionamiento del servicio</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>5. Planes y Facturación</h3>
                <ul>
                  <li>Ofrecemos diferentes planes de suscripción con características específicas</li>
                  <li>Los precios están sujetos a cambios con previo aviso de 30 días</li>
                  <li>Las renovaciones son automáticas salvo cancelación previa</li>
                  <li>Los reembolsos están sujetos a nuestra política de devoluciones</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>6. Propiedad de los Datos</h3>
                <p>
                  Usted conserva todos los derechos de propiedad sobre sus documentos y contenido. CloudDocs Copilot no reclama ningún derecho de propiedad sobre su contenido, pero requiere ciertos permisos limitados para proporcionar el servicio (almacenamiento, procesamiento de IA, etc.).
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>7. Cancelación y Suspensión</h3>
                <p>
                  Nos reservamos el derecho de suspender o cancelar su cuenta si:
                </p>
                <ul>
                  <li>Incumple estos términos de uso</li>
                  <li>No realiza el pago de su suscripción</li>
                  <li>Utiliza el servicio de manera fraudulenta</li>
                  <li>Su cuenta permanece inactiva por más de 12 meses</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>8. Limitación de Responsabilidad</h3>
                <p>
                  CloudDocs Copilot proporciona el servicio "tal cual" y no garantiza que esté libre de errores o interrupciones. No seremos responsables por pérdidas de datos, beneficios o daños indirectos resultantes del uso del servicio.
                </p>
              </div>
            </section>

            {/* Política de Privacidad */}
            <section id="privacidad" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Lock size={28} className={styles.icon} />
                Política de Privacidad
              </h2>

              <div className={styles.subsection}>
                <h3>1. Responsable del Tratamiento</h3>
                <p>
                  CloudDocs Copilot, S.L. es el responsable del tratamiento de sus datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>2. Datos que Recopilamos</h3>
                <p>Recopilamos los siguientes tipos de información:</p>
                <ul>
                  <li><strong>Datos de cuenta:</strong> nombre, email, teléfono, organización</li>
                  <li><strong>Datos de uso:</strong> documentos subidos, actividad en la plataforma, configuraciones</li>
                  <li><strong>Datos técnicos:</strong> dirección IP, navegador, dispositivo, cookies</li>
                  <li><strong>Datos de facturación:</strong> información de pago (procesada por terceros seguros)</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>3. Finalidad del Tratamiento</h3>
                <p>Utilizamos sus datos para:</p>
                <ul>
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Procesar documentos mediante inteligencia artificial</li>
                  <li>Gestionar su cuenta y suscripción</li>
                  <li>Enviar notificaciones y comunicaciones relevantes</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>4. Base Legal</h3>
                <ul>
                  <li><strong>Ejecución del contrato:</strong> procesamiento necesario para prestar el servicio</li>
                  <li><strong>Obligación legal:</strong> cumplimiento de normativas aplicables</li>
                  <li><strong>Consentimiento:</strong> para comunicaciones de marketing</li>
                  <li><strong>Interés legítimo:</strong> mejora del servicio y prevención de fraude</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>5. Compartir Información</h3>
                <p>No vendemos sus datos personales. Podemos compartir información con:</p>
                <ul>
                  <li><strong>Proveedores de servicios:</strong> hosting, procesamiento de IA, pagos</li>
                  <li><strong>Miembros de su organización:</strong> según los permisos configurados</li>
                  <li><strong>Autoridades:</strong> cuando sea requerido legalmente</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>6. Retención de Datos</h3>
                <p>
                  Conservamos sus datos mientras su cuenta esté activa o según sea necesario para proporcionar servicios. Tras la cancelación, conservamos datos durante el período legalmente requerido (generalmente 5 años para fines contables y fiscales).
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>7. Sus Derechos</h3>
                <p>Tiene derecho a:</p>
                <ul>
                  <li><strong>Acceso:</strong> consultar qué datos tenemos sobre usted</li>
                  <li><strong>Rectificación:</strong> corregir datos inexactos</li>
                  <li><strong>Supresión:</strong> solicitar la eliminación de sus datos</li>
                  <li><strong>Portabilidad:</strong> recibir sus datos en formato estándar</li>
                  <li><strong>Oposición:</strong> objetar ciertos procesamientos</li>
                  <li><strong>Limitación:</strong> restringir el uso de sus datos</li>
                </ul>
                <p>
                  Para ejercer estos derechos, contacte con: <strong>privacy@clouddocs-copilot.com</strong>
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>8. Cookies</h3>
                <p>
                  Utilizamos cookies esenciales para el funcionamiento del servicio y cookies analíticas (con su consentimiento) para mejorar la experiencia. Puede configurar sus preferencias en cualquier momento.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>9. Transferencias Internacionales</h3>
                <p>
                  Sus datos pueden ser procesados en servidores ubicados en la Unión Europea. Cualquier transferencia fuera de la UE se realiza bajo mecanismos de protección adecuados (cláusulas contractuales tipo, Privacy Shield, etc.).
                </p>
              </div>
            </section>

            {/* Seguridad */}
            <section id="seguridad" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ShieldCheck size={28} className={styles.icon} />
                Seguridad y Protección de Datos
              </h2>

              <div className={styles.subsection}>
                <h3>1. Compromiso con la Seguridad</h3>
                <p>
                  La seguridad de sus datos es nuestra máxima prioridad. Implementamos medidas técnicas y organizativas de vanguardia para proteger su información contra accesos no autorizados, pérdida o alteración.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>2. Medidas de Seguridad Técnicas</h3>
                <ul>
                  <li><strong>Encriptación:</strong> SSL/TLS para todas las comunicaciones y AES-256 para datos en reposo</li>
                  <li><strong>Autenticación:</strong> Autenticación multifactor (MFA) disponible</li>
                  <li><strong>Control de acceso:</strong> Permisos granulares basados en roles</li>
                  <li><strong>Backups:</strong> Copias de seguridad automáticas diarias con redundancia geográfica</li>
                  <li><strong>Firewalls:</strong> Protección perimetral y detección de intrusiones</li>
                  <li><strong>Monitoreo:</strong> Supervisión 24/7 de actividades sospechosas</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>3. Infraestructura</h3>
                <ul>
                  <li>Servidores alojados en centros de datos certificados ISO 27001</li>
                  <li>Redundancia y alta disponibilidad (99.9% uptime SLA)</li>
                  <li>Actualizaciones de seguridad automáticas</li>
                  <li>Pruebas de penetración periódicas</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>4. Seguridad Organizativa</h3>
                <ul>
                  <li>Personal capacitado en protección de datos</li>
                  <li>Políticas estrictas de acceso a datos</li>
                  <li>Acuerdos de confidencialidad con todos los empleados</li>
                  <li>Plan de respuesta ante incidentes de seguridad</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>5. Privacidad en el Procesamiento de IA</h3>
                <p>
                  Nuestros modelos de inteligencia artificial:
                </p>
                <ul>
                  <li>Procesan sus documentos de manera confidencial</li>
                  <li>No utilizan sus datos para entrenar modelos públicos</li>
                  <li>Aplican técnicas de anonimización cuando es posible</li>
                  <li>Cumplen con regulaciones de IA y protección de datos</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>6. Notificación de Brechas</h3>
                <p>
                  En el improbable caso de una brecha de seguridad que afecte sus datos, le notificaremos en un plazo máximo de 72 horas, cumpliendo con los requisitos del RGPD.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3>7. Recomendaciones para Usuarios</h3>
                <ul>
                  <li>Utilice contraseñas robustas y únicas</li>
                  <li>Active la autenticación multifactor</li>
                  <li>No comparta sus credenciales de acceso</li>
                  <li>Cierre sesión en dispositivos compartidos</li>
                  <li>Revise periódicamente los permisos de acceso</li>
                  <li>Reporte cualquier actividad sospechosa</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3>8. Certificaciones y Cumplimiento</h3>
                <ul>
                  <li>RGPD (Reglamento General de Protección de Datos)</li>
                  <li>LOPD (Ley Orgánica de Protección de Datos)</li>
                  <li>ISO 27001 (Seguridad de la Información)</li>
                  <li>SOC 2 Type II (en proceso)</li>
                </ul>
              </div>
            </section>

            {/* Contacto */}
            <section className={styles.section}>
              <div className={styles.contactBox}>
                <h3>¿Preguntas sobre nuestras políticas?</h3>
                <p>
                  Si tiene alguna pregunta sobre estos términos, privacidad o seguridad, no dude en contactarnos:
                </p>
                <ul className={styles.contactList}>
                  <li><strong>Email general:</strong> legal@clouddocs-copilot.com</li>
                  <li><strong>Privacidad:</strong> privacy@clouddocs-copilot.com</li>
                  <li><strong>Seguridad:</strong> security@clouddocs-copilot.com</li>
                  <li><strong>DPO (Delegado de Protección de Datos):</strong> dpo@clouddocs-copilot.com</li>
                </ul>
              </div>
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Legal;
