import { useRef } from 'react';
import styles from './ProfileHeader.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface ProfileHeaderProps {
  name: string;
  email: string;
  imageUrl?: string | null;
  onImageSelect?: (file: File) => void;
}

export function ProfileHeader({ name, email, imageUrl, onImageSelect }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          ) : (
            <i className={`bi bi-person ${styles.avatarIcon}`}></i>
          )}
        </div>
        <button 
          type="button"
          className={styles.cameraButton}
          onClick={handleCameraClick}
        >
          <i className={`bi bi-camera ${styles.cameraIcon}`}></i>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.email}>{email}</p>
    </div>
  );
}
