import React from 'react';
import styles from './FloatingIcons.module.css';

/**
 * Tarjeta de documento con líneas de texto simuladas
 */
const DocumentCard: React.FC<{ type: 'pdf' | 'doc' | 'xls' }> = ({ type }) => {
  const colors = {
    pdf: { bg: '#fee2e2', accent: '#ef4444', label: 'PDF' },
    doc: { bg: '#dbeafe', accent: '#3b82f6', label: 'DOC' },
    xls: { bg: '#dcfce7', accent: '#22c55e', label: 'XLS' },
  };
  const { bg, accent, label } = colors[type];

  return (
    <div className={styles.documentCard}>
      <div className={styles.docHeader} style={{ backgroundColor: bg }}>
        <span className={styles.docBadge} style={{ backgroundColor: accent }}>
          {label}
        </span>
      </div>
      <div className={styles.docContent}>
        <div className={styles.docLine} style={{ width: '90%' }} />
        <div className={styles.docLine} style={{ width: '75%', opacity: 0.7 }} />
        <div className={styles.docLine} style={{ width: '85%', opacity: 0.5 }} />
      </div>
    </div>
  );
};

/**
 * Nube estilizada
 */
const CloudElement: React.FC = () => (
  <svg viewBox="0 0 64 44" className={styles.cloudSvg}>
    <defs>
      <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M52 32H16c-7.7 0-14-6.3-14-14s6.3-14 14-14c1.4 0 2.8.2 4.1.6C23.3 1.8 27.4 0 32 0c7.2 0 13.3 4.8 15.3 11.3C48.4 11.1 49.7 11 51 11c7.2 0 13 5.8 13 13s-5.8 13-13 13h1z"
      fill="url(#cloudGradient)"
    />
    {/* Flecha de upload */}
    <path
      d="M32 36V22M26 28l6-6 6 6"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Carpeta con archivos
 */
const FolderElement: React.FC = () => (
  <svg viewBox="0 0 56 48" className={styles.folderSvg}>
    <defs>
      <linearGradient id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Pestaña */}
    <path d="M4 12h16l4-8h-16z" fill="#fbbf24" />
    {/* Cuerpo */}
    <rect x="0" y="12" width="56" height="36" rx="4" fill="url(#folderGradient)" />
    {/* Mini archivos asomando */}
    <rect x="10" y="6" width="10" height="14" rx="2" fill="#ef4444" />
    <rect x="23" y="4" width="10" height="16" rx="2" fill="#3b82f6" />
    <rect x="36" y="8" width="10" height="12" rx="2" fill="#22c55e" />
  </svg>
);

/**
 * Cerebro IA
 */
const BrainElement: React.FC = () => (
  <svg viewBox="0 0 48 48" className={styles.brainSvg}>
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    {/* Forma del cerebro */}
    <ellipse cx="24" cy="24" rx="20" ry="18" fill="url(#brainGradient)" />
    {/* Surco central */}
    <path d="M24 6v36" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    {/* Conexiones neuronales */}
    <circle cx="16" cy="16" r="3" fill="rgba(255,255,255,0.8)" />
    <circle cx="32" cy="14" r="2.5" fill="rgba(255,255,255,0.7)" />
    <circle cx="14" cy="28" r="2" fill="rgba(255,255,255,0.6)" />
    <circle cx="34" cy="30" r="2.5" fill="rgba(255,255,255,0.7)" />
    <circle cx="24" cy="24" r="3.5" fill="rgba(255,255,255,0.9)" />
    {/* Líneas de conexión */}
    <path d="M16 16L24 24M32 14L24 24M14 28L24 24M34 30L24 24" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
  </svg>
);

/**
 * Chip de IA con sparkle
 */
const AIChip: React.FC = () => (
  <div className={styles.aiChip}>
    <svg viewBox="0 0 24 24" className={styles.sparkleIcon}>
      <defs>
        <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="url(#sparkleGradient)"
      />
    </svg>
    <span className={styles.aiLabel}>AI</span>
  </div>
);

interface FloatingElement {
  id: string;
  component: React.ReactNode;
  angle: number; // Posición en el círculo (grados)
  floatDelay: number; // Delay para la animación de flotación individual
}

const elements: FloatingElement[] = [
  { id: 'cloud', component: <CloudElement />, angle: 0, floatDelay: 0 },
  { id: 'pdf', component: <DocumentCard type="pdf" />, angle: 60, floatDelay: 0.3 },
  { id: 'brain', component: <BrainElement />, angle: 120, floatDelay: 0.6 },
  { id: 'folder', component: <FolderElement />, angle: 180, floatDelay: 0.9 },
  { id: 'doc', component: <DocumentCard type="doc" />, angle: 240, floatDelay: 1.2 },
  { id: 'ai', component: <AIChip />, angle: 300, floatDelay: 1.5 },
];

/**
 * FloatingIcons - Elementos flotando en círculo con efecto de respiración
 */
export const FloatingIcons: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Círculo contenedor que "respira" */}
      <div className={styles.breathingCircle}>
        {elements.map(({ id, component, angle, floatDelay }) => (
          <div
            key={id}
            className={styles.floatingElement}
            style={{
              '--angle': `${angle}deg`,
              '--float-delay': `${floatDelay}s`,
            } as React.CSSProperties}
          >
            <div className={styles.elementInner}>
              {component}
            </div>
          </div>
        ))}
      </div>
      
      {/* Centro con glow sutil */}
      <div className={styles.centerGlow} />
    </div>
  );
};

export default FloatingIcons;
