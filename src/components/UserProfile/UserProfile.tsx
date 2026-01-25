import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ProfileHeader } from './ProfileHeader';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SecuritySection } from './SecuritySection';
import { PreferencesSection } from './PreferencesSection';
import { DangerZone } from './DangerZone';
import { ImageUploadModal } from './ImageUploadModal';
import { NotificationToast } from '../NotificationToast';
import styles from './UserProfile.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { usePageTitle } from '../../hooks/usePageInfoTitle';

interface UserProfileProps {
  user: { name: string; email: string };
  onSave: (name: string, email: string, password?: string) => void;
  onBack: () => void;
}

export function UserProfile({ user, onSave, onBack }: UserProfileProps) {

  usePageTitle({
        title: 'Perfil de usuario',
        subtitle: 'Perfil',
        documentTitle: 'Perfil de usuario',
        metaDescription: 'Página de perfil de usuario para CloudDocs Copilot'
      });
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditingPassword] = useState(false);

  // Estados para notificaciones
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

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
  
  // Estados para la imagen de perfil
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [, setSelectedFile] = useState<File | null>(null);

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

  const handleSaveImage = () => {
    if (imagePreview) {
      setProfileImage(imagePreview);
      setShowImageModal(false);
      // Aquí podrías subir la imagen al servidor
    }
  };

  const handleCancelImage = () => {
    setShowImageModal(false);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación completa antes de guardar
    if (!validateAllFields({ name, email })) {
      setToastMessage('Por favor corrige los errores antes de guardar.');
      setToastVariant('danger');
      setShowToast(true);
      return;
    }
    
    if (isEditingPassword) {
      // La lógica de password está ahora en SecuritySection
      // Podrías manejar esto con un callback si lo necesitas
      onSave(name, email);
    } else {
      onSave(name, email);
    }

    setToastMessage('Perfil actualizado correctamente.');
    setToastVariant('success');
    setShowToast(true);
  };

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.topHeader}>
          <Container>
            <div className={styles.headerContent}>
            <Button
              variant="light"
              onClick={onBack}
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
                      onClick={onBack}
                      type="button"
                      className={styles.secondaryButton}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className={styles.primaryButton}
                    >
                      <i className="bi bi-floppy me-2"></i>
                      Guardar cambios
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Danger Zone Component */}
            <DangerZone />
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
      />
      </div>
    </>
  );
}
