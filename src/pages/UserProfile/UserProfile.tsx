import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';
import { ProfileHeader } from './ProfileHeader';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SecuritySection } from './SecuritySection';
import { PreferencesSection } from './PreferencesSection';
import { DangerZone } from '../../components/UserProfile/DangerZone';
import { ImageUploadModal } from '../../components/UserProfile/ImageUploadModal';
import { NotificationToast } from '../../components/NotificationToast';
import { Loader } from '../../components/Loader';
import type { User } from '../../types/user.types';
import styles from './UserProfile.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { usePageTitle } from '../../hooks/usePageInfoTitle';

export function UserProfile() {
  console.log('🎯 UserProfile componente montado');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  console.log('🔐 isAuthenticated:', isAuthenticated);
  
  usePageTitle({
    title: 'Perfil de usuario',
    subtitle: 'Perfil',
    documentTitle: 'Perfil de usuario',
    metaDescription: 'Página de perfil de usuario para CloudDocs Copilot'
  });

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Estados para notificaciones
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  // Estados para la imagen de perfil
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estados para datos del perfil
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileError, setIsProfileError] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('🔄 Iniciando carga de perfil...');
        setIsLoadingProfile(true);
        setIsProfileError(false);
        const response = await userService.getProfile();
        console.log('✅ Datos del perfil recibidos:', response);
        // El backend puede devolver { success, user } o directamente el user
        const userData = response.user || response;
        setProfileData(userData as User);
      } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
        setIsProfileError(true);
        setProfileError(error instanceof Error ? error.message : 'Error al cargar perfil');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadProfile();
  }, []);

  // Actualizar estados cuando se carguen los datos del perfil
  useEffect(() => {
    console.log('📝 profileData cambió:', profileData);
    
    if (profileData) {
      console.log('👤 Actualizando campos con:', profileData);
      setName(profileData.name);
      setEmail(profileData.email);
      // Si el backend devuelve una URL de imagen de perfil
      // setProfileImage(profileData.user.profileImage || null);
    }
  }, [profileData]);

  // Validación de formulario
  const {
    errors,
    handleBlur,
    validateAllFields,
    validateEmail,
    validateName
  } = useFormValidation<{ name: string; email: string }>({
    name: (value: string): string => validateName(value) ? '' : 'El nombre debe contener al menos 2 caracteres',
    email: (value: string): string => validateEmail(value) ? '' : 'Ingresa un correo electrónico válido'
  });

  const handleImageSelect = (file: File) => {
    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleSaveImage = async () => {
    if (selectedFile) {
      try {
        const response = await userService.uploadProfileImage(selectedFile);

        if (response.success) {
          setProfileImage(imagePreview);
          setShowImageModal(false);
          setToastMessage('Imagen de perfil actualizada correctamente.');
          setToastVariant('success');
          setShowToast(true);
        }
      } catch (error) {
        setToastMessage('Error al subir la imagen. Inténtalo de nuevo.');
        setToastVariant('danger');
        setShowToast(true);
      }
    }
  };

  const handleCancelImage = () => {
    setShowImageModal(false);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación completa antes de guardar
    if (!validateAllFields({ name, email })) {
      setToastMessage('Por favor corrige los errores antes de guardar.');
      setToastVariant('danger');
      setShowToast(true);
      return;
    }
    
    try {
      setIsUpdating(true);
      console.log('📤 Enviando actualización:', { name, email });
      console.log('👤 Datos completos del usuario:', profileData);
      const response = await userService.updateProfile({ name, email });
      
      console.log('✅ Respuesta del servidor:', response);

      // El backend devuelve { message, user } sin success: true
      if (response && response.message) {
        console.log('🎉 Mostrando toast de éxito');
        setToastMessage('Perfil actualizado correctamente.');
        setToastVariant('success');
        setShowToast(true);
      }
 
    } catch (error) {
      setToastMessage('Error al actualizar el perfil. Inténtalo de nuevo.');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        const response = await userService.deleteAccount();
        
        if (response.success) {
          setToastMessage('Cuenta eliminada correctamente.');
          setToastVariant('success');
          setShowToast(true);
          
          // Redirigir al login después de eliminar la cuenta
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        setToastMessage('Error al eliminar la cuenta. Inténtalo de nuevo.');
        setToastVariant('danger');
        setShowToast(true);
      }
    }
  };

  // Mostrar spinner mientras se carga el perfil
  if (isLoadingProfile) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando perfil...</span>
        </Spinner>
        <p className="mt-3">Cargando perfil...</p>
      </div>
    );
  }

  // Mostrar error si falla la carga del perfil
  if (isProfileError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar el perfil</Alert.Heading>
          <p>{profileError || 'Ocurrió un error inesperado'}</p>
          <Button variant="outline-danger" onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.topHeader}>
          <Container>
            <div className={styles.headerContent}>
            <Button
              variant="light"
              onClick={() => navigate('/dashboard')}
              className={styles.backButton}
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </Button>
            <div className={styles.headerTitleWrapper}>
              <h1 className={styles.pageTitle}>Mi Perfil</h1>
              <p className={styles.pageSubtitle}>Gestiona tu información personal</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container className={styles.mainContentContainer}>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={7}>
            <Card className={styles.profileCard}>
              {/* Profile Header Component */}
              <ProfileHeader 
                name={name} 
                email={email}
                imageUrl={profileImage}
                onImageSelect={handleImageSelect}
              />

              {/* Form */}
              <Card.Body className={styles.formBody}>
                <Form onSubmit={handleSubmit}>
                  {/* Personal Info Component */}
                  <PersonalInfoSection
                    name={name}
                    email={email}
                    onNameChange={setName}
                    onEmailChange={setEmail}
                    errors={errors}
                    onBlur={handleBlur}
                  />

                  <hr className={styles.divider} />

                  {/* Security Component */}
                  <SecuritySection />

                  <hr className={styles.divider} />

                  {/* Preferences Component */}
                  <PreferencesSection />

                  {/* Action Buttons */}
                  <div className={styles.buttonContainer}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/dashboard')}
                      type="button"
                      className={styles.secondaryButton}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-floppy me-2"></i>
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Danger Zone Component - Comentado temporalmente */}
            {/* <DangerZone onDeleteAccount={handleDeleteAccount} /> */}
          </Col>
        </Row>
      </Container>

      {/* Modal de vista previa de imagen */}
      <ImageUploadModal
        show={showImageModal}
        imagePreview={imagePreview}
        onCancel={handleCancelImage}
        onSave={handleSaveImage}
      />
      
      {/* Notificaciones */}
      <NotificationToast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'success' ? 'Éxito' : 'Error'}
      />

      {/* Loader de actualización */}
      {isUpdating && <Loader message="Actualizando perfil..." fullScreen />}
      </div>
    </>
  );
}
