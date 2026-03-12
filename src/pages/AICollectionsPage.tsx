import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiChat } from '../hooks/useAiChat';
import {
  AIChatHistory,
  AIChatInput,
  AIChatMessages,
  AIHelpPanel,
  AIWelcomeBanner,
} from '../components/AIChat';
import styles from './AICollectionsPage.module.css';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';
import { Logo } from '../brand';

const AICollectionsPage: React.FC = () => {
  const chat = useAiChat();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const { activeOrganization  } = useOrganization();
  const hasMessages = chat.messages.length > 0;
  usePageTitle({
        title: `Colecciones IA - ${activeOrganization?.name} | CloudsDocs`,
        subtitle: 'Consulta tus documentos con IA',
        documentTitle: `Colecciones IA | ${activeOrganization?.name} - CloudsDocs`,
        metaDescription: 'Utiliza el asistente de IA para hacer preguntas sobre tus documentos procesados. Obtén respuestas rápidas con fuentes exactas. Solo para tu organización.',
    });

  return (
    <div className={styles.page}>
      {/* ── Panel de historial ── */}
      <div className={styles.historySidebar}>
        <AIChatHistory
          history={chat.history}
          activeConversationId={chat.activeConversationId}
          onSelect={chat.selectConversation}
          onDelete={chat.deleteConversation}
          onNew={chat.newConversation}
        />
      </div>

      {/* ── Área principal ── */}
      <main className={styles.main}>
        {/* Cabecera */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Logo size={32} variant="gradient" animated />
            </div>
            <h1 className={styles.headerTitle}>Colecciones IA</h1>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={() => navigate('/dashboard')}
              aria-label="Volver al Dashboard"
              title="Volver al Dashboard"
            >
              <span aria-hidden="true">←</span>
              <span className={styles.btnLabel}>Dashboard</span>
            </button>
            <button
              className={styles.iconBtn}
              onClick={chat.newConversation}
              aria-label="Nueva conversación"
              title="Nueva conversación"
            >
              <span aria-hidden="true">＋</span>
              <span className={styles.btnLabel}>Nueva</span>
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setShowHelp(true)}
              aria-label="Abrir ayuda"
              title="Ayuda"
            >
              <span aria-hidden="true">❓</span>
              <span className={styles.btnLabel}>Ayuda</span>
            </button>
          </div>
        </header>

        {/* Mensajes o banner de bienvenida */}
        {hasMessages ? (
          <div className={styles.messagesArea}>
            <AIChatMessages
              messages={chat.messages}
              isLoading={chat.isLoading}
              error={chat.error}
            />
          </div>
        ) : (
          <div className={styles.welcomeWrapper}>
            <AIWelcomeBanner
              onSuggestionClick={(text) => {
                chat.setInputValue(text);
              }}
            />
          </div>
        )}

        {/* Input */}
        <div className={styles.inputArea}>
          <AIChatInput
            mode={chat.mode}
            setMode={chat.setMode}
            inputValue={chat.inputValue}
            setInputValue={chat.setInputValue}
            selectedDocumentId={chat.selectedDocumentId}
            selectedDocumentName={chat.selectedDocumentName}
            setSelectedDocument={chat.setSelectedDocument}
            isLoading={chat.isLoading}
            sendQuestion={chat.sendQuestion}
          />
        </div>
      </main>

      {/* Panel de ayuda global */}
      <AIHelpPanel show={showHelp} onHide={() => setShowHelp(false)} />
    </div>
  );
};

export default AICollectionsPage;
