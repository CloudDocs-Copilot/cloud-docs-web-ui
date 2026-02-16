import React, { useState, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import { FileManagerView } from '../components/FileManager/FileManagerView';
import { usePageTitle } from '../hooks/usePageInfoTitle';

const Dashboard: React.FC = () => {
    
  usePageTitle({
    title: 'Mis Documentos',
    subtitle: 'Gestión de archivos y carpetas',
    documentTitle: 'Mis Documentos',
    metaDescription: 'Gestiona y organiza tus documentos y carpetas'
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Callback cuando se suben documentos exitosamente mediante el Header
   */
  const handleDocumentsUploaded = useCallback(() => {
    // Incrementamos el trigger para causar un refresh en el FileManager
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <MainLayout onDocumentsUploaded={handleDocumentsUploaded}>
      <FileManagerView externalRefresh={refreshTrigger} />
    </MainLayout>
  );
};

export default Dashboard;
