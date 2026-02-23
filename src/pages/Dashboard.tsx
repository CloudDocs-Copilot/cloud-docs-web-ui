import React from 'react';
import MainLayout from '../components/MainLayout';
import { FileManagerView } from '../components/FileManager/FileManagerView';
import { usePageTitle } from '../hooks/usePageInfoTitle';

const Dashboard: React.FC = () => {
    
  usePageTitle({
    title: 'Mis Documentos',
    subtitle: 'Gestión de archivos y carpetas',
    documentTitle: 'Mis Documentos',
    metaDescription: 'Gestiona y organiza tus documentos y carpetas con inteligencia artificial',
  });

  return (
    <MainLayout>
      <FileManagerView />
    </MainLayout>
  );
};

export default Dashboard;
