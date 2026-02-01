import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useFormValidation } from '../hooks/useFormValidation';
import { useOrganization } from '../hooks/useOrganization';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import type { UserProfileResponse } from '../services/user.service';
import { ProfileHeader } from '../components/UserProfile/ProfileHeader';
import { PersonalInfoSection } from '../components/UserProfile/PersonalInfoSection';
import { SecuritySection } from '../components/UserProfile/SecuritySection';
import { PreferencesSection } from '../components/UserProfile/PreferencesSection';
//import { DangerZone } from '../../components/UserProfile/DangerZone';
import { ImageUploadModal } from '../components/UserProfile/ImageUploadModal';
// NotificationToast is provided by ToastProvider; use `useToast` to trigger toasts
import { Loader } from '../components/Loader';
import type { User } from '../types/user.types';
import styles from './UserProfile.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { usePageTitle } from '../hooks/usePageInfoTitle';

export type UserProfileProps = {
  user?: Partial<User> | null;
  onSave?: (name: string, email: string) => void;
  onBack?: () => void;
};

export function UserProfile(props: UserProfileProps) {
  console.log('🎯 UserProfile componente montado');
  const { user: initialUser, onSave: propsOnSave, onBack: propsOnBack } = props || {};
  const navigate = useNavigate();
  const { activeOrganization } = useOrganization();
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
  const [name, setName] = useState<string>(initialUser?.name ?? '');
  const [email, setEmail] = useState<string>(initialUser?.email ?? '');

  // Toast global (desde ToastProvider)
  const { showToast } = useToast();

  // Estados para la imagen de perfil
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estados para datos del perfil
  const [profileData, setProfileData] = useState<User | null>(initialUser ? (initialUser as User) : null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(initialUser ? false : true);
  const [isProfileError, setIsProfileError] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    // If a `user` prop was provided by tests, skip fetching
    if (initialUser) return;

    const loadProfile = async () => {
      try {
        console.log('🔄 Iniciando carga de perfil...');
        setIsLoadingProfile(true);
        setIsProfileError(false);
        const response = await userService.getProfile();
        console.log('✅ Datos del perfil recibidos:', response);
        // Normalize response: API may return { user } or the user object directly
        let userData: User;
        if (response && typeof response === 'object' && 'user' in response) {
          userData = (response as UserProfileResponse).user;
        } else {
          userData = response as unknown as User;
        }
        setProfileData(userData);
        setName(userData?.name ?? '');
        setEmail(userData?.email ?? '');
      } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
        setIsProfileError(true);
        setProfileError(error instanceof Error ? error.message : 'Error al cargar perfil');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [initialUser]);

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
          showToast({ message: 'Imagen de perfil actualizada correctamente.', variant: 'success', title: 'Éxito' });
        }
      } catch  {
        showToast({ message: 'Error al subir la imagen. Inténtalo de nuevo.', variant: 'danger', title: 'Error' });
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
      showToast({ message: 'Por favor corrige los errores antes de guardar.', variant: 'danger', title: 'Error' });
      return;
    }
    
    try {
      setIsUpdating(true);
      console.log('📤 Enviando actualización:', { name, email });
      console.log('👤 Datos completos del usuario:', profileData);
      const response = await userService.updateProfile({ name, email });

      console.log('✅ Respuesta del servidor:', response);

      // The backend returns an object with `message` and `user`.
      if (response && typeof response === 'object' && 'message' in response) {
        console.log('🎉 Mostrando toast de éxito');
        showToast({ message: 'Perfil actualizado correctamente.', variant: 'success', title: 'Éxito' });
        if (propsOnSave) propsOnSave(name, email);
      }
 
    } catch  {
      showToast({ message: 'Error al actualizar el perfil. Inténtalo de nuevo.', variant: 'danger', title: 'Error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleDeleteAccount = async () => {
  //   if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
  //     try {
  //       const response = await userService.deleteAccount();
        
  //       if (response.success) {
  //         showToast({ message: 'Cuenta eliminada correctamente.', variant: 'success', title: 'Éxito' });

  //         // Redirigir al login después de eliminar la cuenta
  //         setTimeout(() => {
  //           navigate('/login');
  //         }, 2000);
  //       }
  //     } catch  {
  //       showToast({ message: 'Error al eliminar la cuenta. Inténtalo de nuevo.', variant: 'danger', title: 'Error' });
  //     }
  //   }
  // };

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
              <p className={styles.pageSubtitle}>
                Gestiona tu información personal
                {activeOrganization?.name ? ` — ${activeOrganization.name}` : ''}
              </p>
            </div>
            <div className={styles.headerActionsRight}>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Ir al Dashboard
              </Button>
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
                      onClick={() => {
                        if (propsOnBack) return propsOnBack();
                        return navigate('/dashboard');
                      }}
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
      
      {/* Notificaciones: manejadas por ToastProvider */}

      {/* Loader de actualización */}
      {isUpdating && <Loader message="Actualizando perfil..." fullScreen />}
      </div>
    </>
  );
}

export default UserProfile;
