import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import styles from './AIHelpPanel.module.css';

interface AIHelpPanelProps {
  show: boolean;
  onHide: () => void;
}

const SUPPORTED_FORMATS = ['PDF', 'DOCX', 'DOC', 'TXT', 'MD'];

export const AIHelpPanel: React.FC<AIHelpPanelProps> = ({ show, onHide }) => {
  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: 400 }}>
      <Offcanvas.Header closeButton closeVariant="white" className={styles.offcanvasHeader}>
        <Offcanvas.Title className={styles.offcanvasTitle}>
          <span className={styles.titleIcon}>✦</span>
          ¿Cómo funciona la IA?
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className={styles.offcanvasBody}>

        {/* 1. Qué puedes hacer */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💬</span>
            Qué puedes hacer
          </div>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              Hacer preguntas en lenguaje natural sobre el contenido de tus documentos y obtener respuestas con las fuentes exactas.
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span>
                <strong>Buscar en toda la organización</strong> — el sistema revisa todos
                los documentos procesados y devuelve la información más relevante.
              </span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              <span>
                <strong>Buscar en un documento concreto</strong> — respuestas más precisas
                cuando sabes exactamente qué archivo contiene la información.
              </span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              Clasificar documentos automáticamente (factura, contrato, informe…) con etiquetas descriptivas.
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureDot} />
              Generar un resumen y extraer los puntos clave de cualquier documento.
            </li>
          </ul>
        </div>

        {/* 2. Flujo de preparación */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
            Cómo preparar un documento
          </div>
          <div className={styles.stepsFlow}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepLabel}>Extraer texto</div>
              <div className={styles.stepDesc}>El sistema lee el archivo y obtiene el contenido en texto plano.</div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepLabel}>Procesar</div>
              <div className={styles.stepDesc}>Se crean fragmentos y embeddings vectoriales. Puede tardar hasta 30 s.</div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepLabel}>Listo</div>
              <div className={styles.stepDesc}>El documento es consultable. No repitas estos pasos salvo que lo actualices.</div>
            </div>
          </div>
        </div>

        {/* 3. Formatos compatibles */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📄</span>
            Formatos compatibles
          </div>
          <div className={styles.formatsRow}>
            {SUPPORTED_FORMATS.map((f) => (
              <span key={f} className={styles.formatBadge}>{f}</span>
            ))}
          </div>
          <p className={styles.unsupportedNote}>
            No compatibles: JPG, PNG, XLSX, PPTX — ni archivos escaneados sin OCR.
          </p>
        </div>

        {/* 4. Limitaciones */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚠️</span>
            Limitaciones importantes
          </div>
          <div className={styles.limitationItem}>
            <span className={styles.limitationIcon}>⚠</span>
            La IA solo sabe lo que hay en tus documentos procesados. No tiene acceso a internet ni a conocimiento externo.
          </div>
          <div className={styles.limitationItem}>
            <span className={styles.limitationIcon}>⚠</span>
            Los PDFs escaneados (imágenes de texto) pueden dar resultados pobres o no extraer texto en absoluto.
          </div>
          <div className={styles.limitationItem}>
            <span className={styles.limitationIcon}>⚠</span>
            Las respuestas son un punto de partida. Verifica siempre la información en el documento original, especialmente en contextos legales, financieros o médicos.
          </div>
          <div className={styles.limitationItem}>
            <span className={styles.limitationIcon}>⚠</span>
            Solo los miembros activos de tu organización pueden acceder a sus documentos. Ninguna consulta devuelve información de otras organizaciones.
          </div>
        </div>

        {/* 5. Consejos */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💡</span>
            Consejos para mejores resultados
          </div>
          <div className={styles.tipItem}>
            <span className={styles.tipIcon}>✓</span>
            Formula preguntas concretas. <em>"¿Cuánto es el total de la factura 2024-0043?"</em> funciona mejor que <em>"¿Cuánto dinero hay?"</em>.
          </div>
          <div className={styles.tipItem}>
            <span className={styles.tipIcon}>✓</span>
            Añade contexto — nombre del documento, fecha o tema — para encontrar los fragmentos correctos.
          </div>
          <div className={styles.tipItem}>
            <span className={styles.tipIcon}>✓</span>
            Usa la búsqueda por documento cuando sepas exactamente en qué archivo está la información.
          </div>
          <div className={styles.tipItem}>
            <span className={styles.tipIcon}>✓</span>
            Si actualizas un documento, elimina los fragmentos anteriores y vuelve a procesarlo.
          </div>
          <div className={styles.tipItem}>
            <span className={styles.tipIcon}>✓</span>
            Procesa los documentos más importantes primero — solo los procesados son consultables.
          </div>
        </div>

      </Offcanvas.Body>
    </Offcanvas>
  );
};
