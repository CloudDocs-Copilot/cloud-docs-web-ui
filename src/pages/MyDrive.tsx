import React from 'react';
import MainLayout from '../components/MainLayout';
import { FileManagerView } from '../components/FileManager/FileManagerView';
import { usePageTitle } from '../hooks/usePageInfoTitle';

const MyDrive: React.FC = () => {
  usePageTitle({
    title: 'Mi Unidad',
    subtitle: 'Gestión de archivos y carpetas',
    documentTitle: 'Mi Unidad',
    metaDescription: 'Gestiona y organiza tus documentos y carpetas con inteligencia artificial',
  });

  return (
    <MainLayout>
      <FileManagerView />
    </MainLayout>
  );
};

export default MyDrive;
