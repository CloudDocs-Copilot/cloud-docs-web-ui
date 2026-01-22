
import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { HOME_FEATURES } from '../constants/homeFeatures';
import { HOME_STATS } from '../constants/homeStats';
import ContactForm, { type ContactFormData } from '../components/ContactForm';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  usePageTitle({
    title: 'Inicio',
    subtitle: 'Tu asistente para gestionar documentos con IA',
    documentTitle: 'CloudDocs Copilot - Gestión Inteligente de Documentos',
    metaDescription: 'Bienvenido a CloudDocs Copilot, tu asistente para gestionar documentos con IA'
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = (data: ContactFormData) => {
    // Aquí puedes agregar la lógica para enviar el formulario a tu API
    alert(`Gracias por tu mensaje, ${data.name}. Te contactaremos pronto.`);
  };

  return (
    <div className={styles.homePage}>
      {/* Navigation Header */}
      <Navbar className={styles.navbar} expand="lg">
        <Container fluid className="px-4">
          <Navbar.Brand className={styles.brand}>
            <span className={styles.brandIcon}>📄</span>
            CloudDocs Copilot
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto align-items-center gap-3">
              <Nav.Link 
                className={styles.navLink}
                onClick={() => scrollToSection('features')}
              >
                Características
              </Nav.Link>
              <Nav.Link 
                className={styles.navLink}
                onClick={() => scrollToSection('pricing')}
              >
                Precios
              </Nav.Link>
              <Nav.Link 
                className={styles.navLink}
                onClick={() => scrollToSection('contact')}
              >
                Contacto
              </Nav.Link>
              <Button 
                variant="outline-primary" 
                className={styles.btnLogin}
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                variant="primary" 
                className={styles.btnRegister}
                onClick={() => navigate('/register')}
              >
                Crear Cuenta
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className={styles.mainContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className={styles.heroTitle}>
                Gestiona tus Documentos con{' '}
                <span className={styles.highlight}>Inteligencia Artificial</span>
              </h1>
              <p className={styles.heroSubtitle}>
                CloudDocs Copilot organiza, clasifica y te ayuda a encontrar tus documentos 
                de forma inteligente. Ahorra tiempo y mantén todo ordenado automáticamente.
              </p>
              <div className={styles.heroActions}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className={styles.btnPrimary}
                  onClick={() => navigate('/register')}
                >
                  Comenzar Gratis
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="lg" 
                  className={styles.btnSecondary}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className={styles.heroIllustration}>
                <div className={styles.floatingCard}>📄</div>
                <div className={styles.floatingCard}>📊</div>
                <div className={styles.floatingCard}>📁</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <Row className="g-4">
            {HOME_STATS.map((stat, index) => (
              <Col key={index} xs={6} lg={3}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Features Section */}
        <div id="features" className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Características Principales</h2>
            <p className={styles.sectionSubtitle}>
              Todo lo que necesitas para gestionar tus documentos de forma eficiente
            </p>
          </div>
          
          <Row className="g-4">
            {HOME_FEATURES.map((feature, index) => (
              <Col key={index} xs={12} md={6} lg={4}>
                <Card className={styles.featureCard}>
                  <Card.Body>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className={styles.pricingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Planes y Precios</h2>
            <p className={styles.sectionSubtitle}>
              Elige el plan perfecto para tus necesidades
            </p>
          </div>
          
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={6} lg={4}>
              <Card className={styles.pricingCard}>
                <Card.Body className="text-center">
                  <div className={styles.pricingBadge}>Básico</div>
                  <div className={styles.pricingPrice}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>9</span>
                    <span className={styles.period}>/mes</span>
                  </div>
                  <p className={styles.pricingDescription}>
                    Perfecto para uso personal
                  </p>
                  <ul className={styles.pricingFeatures}>
                    <li>✓ Hasta 100 documentos</li>
                    <li>✓ 5 GB de almacenamiento</li>
                    <li>✓ Búsqueda básica</li>
                    <li>✓ Soporte por email</li>
                    <li>✓ Clasificación automática</li>
                  </ul>
                  <Button 
                    variant="outline-primary" 
                    className={styles.pricingButton}
                    onClick={() => navigate('/register')}
                  >
                    Comenzar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <Card className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                <Card.Body className="text-center">
                  <div className={styles.pricingBadgePopular}>Más Popular</div>
                  <div className={styles.pricingBadge}>Profesional</div>
                  <div className={styles.pricingPrice}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>29</span>
                    <span className={styles.period}>/mes</span>
                  </div>
                  <p className={styles.pricingDescription}>
                    Ideal para equipos pequeños
                  </p>
                  <ul className={styles.pricingFeatures}>
                    <li>✓ Documentos ilimitados</li>
                    <li>✓ 100 GB de almacenamiento</li>
                    <li>✓ Búsqueda avanzada con IA</li>
                    <li>✓ Soporte prioritario</li>
                    <li>✓ Colaboración en equipo</li>
                    <li>✓ Análisis y reportes</li>
                  </ul>
                  <Button 
                    variant="primary" 
                    className={styles.pricingButtonFeatured}
                    onClick={() => navigate('/register')}
                  >
                    Comenzar
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <Card className={styles.pricingCard}>
                <Card.Body className="text-center">
                  <div className={styles.pricingBadge}>Empresarial</div>
                  <div className={styles.pricingPrice}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>99</span>
                    <span className={styles.period}>/mes</span>
                  </div>
                  <p className={styles.pricingDescription}>
                    Para grandes organizaciones
                  </p>
                  <ul className={styles.pricingFeatures}>
                    <li>✓ Todo de Profesional</li>
                    <li>✓ Almacenamiento ilimitado</li>
                    <li>✓ API personalizada</li>
                    <li>✓ Soporte 24/7</li>
                    <li>✓ Seguridad avanzada</li>
                    <li>✓ Integración empresarial</li>
                    <li>✓ Gestor de cuenta dedicado</li>
                  </ul>
                  <Button 
                    variant="outline-primary" 
                    className={styles.pricingButton}
                    onClick={() => navigate('/register')}
                  >
                    Contactar Ventas
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Contact Section */}
        <div id="contact" className={styles.contactSection}>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Contáctanos</h2>
                <p className={styles.sectionSubtitle}>
                  ¿Tienes preguntas? Estamos aquí para ayudarte
                </p>
              </div>
              
              <Card className={styles.contactCard}>
                <Card.Body>
                  <Row className="g-4">
                    <Col md={6}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactIcon}>📧</div>
                        <h5>Email</h5>
                        <p>soporte@cloudsdocs.com</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactIcon}>💬</div>
                        <h5>Chat en Vivo</h5>
                        <p>Disponible 24/7</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactIcon}>📞</div>
                        <h5>Teléfono</h5>
                        <p>+1 (800) 123-4567</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactIcon}>📍</div>
                        <h5>Oficina</h5>
                        <p>Madrid, España</p>
                      </div>
                    </Col>
                  </Row>
                  
                  <div className={styles.contactFormSection}>
                    <h5 className="text-center mb-4">Envíanos un mensaje</h5>
                    <ContactForm onSubmit={handleContactSubmit} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>¿Listo para empezar?</h2>
          <p className={styles.ctaSubtitle}>
            Crea tu cuenta gratis y comienza a organizar tus documentos hoy mismo
          </p>
          <div className={styles.ctaActions}>
            <Button 
              variant="light" 
              size="lg" 
              className={styles.ctaButton}
              onClick={() => navigate('/register')}
            >
              Crear Cuenta Gratis
            </Button>
            <Button 
              variant="outline-light" 
              size="lg" 
              className={styles.ctaButtonSecondary}
              onClick={() => navigate('/login')}
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </Container>

      {/* Footer */}
      <footer className={styles.footer}>
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <h5 className={styles.footerBrand}>
                <span className={styles.brandIcon}>📄</span>
                CloudDocs Copilot
              </h5>
              <p className={styles.footerText}>
                Tu asistente inteligente para la gestión de documentos
              </p>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <h6 className={styles.footerTitle}>Enlaces</h6>
              <ul className={styles.footerLinks}>
                <li><a href="#">Características</a></li>
                <li><a href="#">Precios</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Soporte</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h6 className={styles.footerTitle}>Legal</h6>
              <ul className={styles.footerLinks}>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos</a></li>
                <li><a href="#">Seguridad</a></li>
              </ul>
            </Col>
          </Row>
          <hr className={styles.footerDivider} />
          <div className={styles.footerBottom}>
            <p>&copy; 2026 CloudDocs Copilot. Todos los derechos reservados.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default Home;