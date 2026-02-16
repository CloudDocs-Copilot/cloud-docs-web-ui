import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, Modal } from 'react-bootstrap';
import { FolderPlus, FileEarmarkPlus } from 'react-bootstrap-icons';
import { FolderTree } from './FolderTree';
import { FolderBreadcrumbs } from './FolderBreadcrumbs';
import DocumentCard from '../DocumentCard';
import { folderService } from '../../services/folder.service';
import * as documentService from '../../services/document.service';
import useOrganization from '../../hooks/useOrganization';
import type { Folder } from '../../types/folder.types';
import type { Document } from '../../types/document.types';

interface FileManagerViewProps {
  /** Trigger numérico para forzar la recarga del contenido desde fuera */
  externalRefresh?: number;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({ externalRefresh = 0 }) => {
  const { activeOrganization } = useOrganization();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [items, setItems] = useState<{ subfolders: Folder[]; documents: Document[] }>({ subfolders: [], documents: [] });
  const [loading, setLoading] = useState(false);
  const [refreshTree, setRefreshTree] = useState(0);

  // New Folder Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper to find path in tree (would handle breadcrumbs)
  // For now, simpler breadcrumbs: just Current Folder name, or we rely on Tree selection highlight
  
  const fetchContents = useCallback(async (folderId: string) => {
    setLoading(true);
    try {
      const data = await folderService.getContents(folderId);
      setItems({ subfolders: data.subfolders, documents: data.documents });
      // Update current folder details from response
      setCurrentFolder(data.folder);
    } catch (error: any) {
      console.error('Error fetching contents:', error);
      alert(`Error al cargar carpeta: ${error.response?.data?.message || error.message}`);
      // Reset loading even on error
      setItems({ subfolders: [], documents: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to handle external refresh triggers (e.g. from File Upload in Header)
  useEffect(() => {
    if (externalRefresh > 0 && currentFolder) {
       fetchContents(currentFolder.id);
       setRefreshTree(prev => prev + 1);
    } else if (externalRefresh > 0 && !currentFolder && activeOrganization) {
       // Refresh root if we are at root (NOTE: fetchContents needs an ID, if null is root we might need logic adjustment)
       // Assuming folders have valid IDs. If root is implicit, we might rely on FolderTree's onLoad.
       // For now, if currentFolder is null, we might not be able to easy refresh without an ID, 
       // but typically we start with a selected folder or root.
       setRefreshTree(prev => prev + 1); // At least refresh the tree
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalRefresh, activeOrganization]);

  const handleSelectFolder = useCallback((folder: Folder) => {
    setCurrentFolder(folder);
    fetchContents(folder.id);
  }, [fetchContents]);

  const handleCreateFolder = async () => {
    if (!newFolderName) {
      alert('Folder name is required');
      return;
    }
    
    if (!currentFolder?.id) {
      alert('Please select a folder first');
      return;
    }
    
    if (!activeOrganization?.id) {
      alert('No active organization');
      return;
    }
    
    setCreatingFolder(true);
    try {
      await folderService.create({
        name: newFolderName,
        parentId: currentFolder.id,
        organizationId: activeOrganization.id
      });
      setShowCreateModal(false);
      setNewFolderName('');
      // Refresh content and tree
      fetchContents(currentFolder.id);
      setRefreshTree(prev => prev + 1);
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error creating folder';
      alert(`Error al crear carpeta: ${errorMessage}`);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!currentFolder?.id) {
      alert('Please select a folder first');
      return;
    }

    console.log('[FileManagerView] Uploading file to folder:', currentFolder.id, 'Folder name:', currentFolder.name);

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const response = await documentService.uploadDocument({
        file,
        folderId: currentFolder.id,
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        },
      });

      console.log('[FileManagerView] Upload successful, document:', response.document);

      // Refresh content
      fetchContents(currentFolder.id);
      setRefreshTree(prev => prev + 1);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error uploading file';
      alert(`Error al subir archivo: ${errorMessage}`);
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // Build Breadcrumbs path (mock based on current folder for now, until we implement tree traversal or backend support)
  // Since we rely on the tree for navigation, the breadcrumb is redundant unless deep linking.
  // We can pass an array with [currentFolder] for now.
  const breadcrumbPath = currentFolder ? [currentFolder] : []; // TODO: Implement full path traversal

  /**
   * Maneja el movimiento de documentos desde Drag & Drop
   */
  const handleMoveDocument = async (documentId: string, targetFolderId: string) => {
    try {
      setLoading(true);
      await documentService.moveDocument(documentId, targetFolderId);
      // Refresh current folder view as the document might have moved OUT of it
      if (currentFolder) {
        fetchContents(currentFolder.id);
      }
      // Also refresh tree in case counts update (if we implement counts)
      setRefreshTree(prev => prev + 1);
    } catch (error) {
      console.error('Failed to move document', error);
      // alert('Error moving document'); // Optional: replace with Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column overflow-hidden p-0">
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploadingFile}
      />

      {/* Barra de herramientas */}
      <div className="bg-white border-bottom p-2 d-flex justify-content-between align-items-center">
        <h5 className="m-0 ps-2">Archivos</h5>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
            disabled={!currentFolder}
          >
            <FolderPlus className="me-2" /> Nueva Carpeta
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleUploadClick}
            disabled={!currentFolder || uploadingFile}
          >
            <FileEarmarkPlus className="me-2" /> 
            {uploadingFile ? `Subiendo... ${uploadProgress}%` : 'Subir Archivo'}
          </Button>
        </div>
      </div>

      <Row className="flex-grow-1 g-0 overflow-hidden">
        {/* Árbol lateral */}
        <Col md={3} lg={2} className="border-end bg-light overflow-auto h-100">
          <FolderTree 
            onSelectFolder={handleSelectFolder} 
            selectedFolderId={currentFolder?.id}
            refreshTrigger={refreshTree}
            onMoveDocument={handleMoveDocument}
          />
        </Col>

        {/* Contenido principal */}
        <Col md={9} lg={10} className="d-flex flex-column h-100 overflow-hidden">
          {/* Área de navegación (breadcrumbs) */}
          <div className="p-2 border-bottom bg-white">
            <FolderBreadcrumbs 
              currentFolder={currentFolder} 
              path={breadcrumbPath} // TODO: Pass full path
              onNavigate={(id) => fetchContents(id)}
            />
          </div>

          {/* Cuadrícula de archivos */}
          <div className="flex-grow-1 overflow-auto p-3 bg-white">
            {loading ? (
              <div className="d-flex justify-content-center pt-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                 {/* Cuadrícula de subcarpetas */}
                 {items.subfolders.length > 0 && (
                  <div className="mb-4">
                     <h6 className="text-muted mb-3">Carpetas ({items.subfolders.length})</h6>
                     <Row className="g-3">
                       {items.subfolders.map(subfolder => (
                         <Col key={subfolder.id} xs={6} sm={4} md={3} lg={2}>
                           <Card 
                              className="h-100 shadow-sm border-0 bg-light text-center p-3"
                              style={{cursor: 'pointer'}}
                              onClick={() => handleSelectFolder(subfolder)}
                            >
                             <div className="fs-1 text-warning mb-2">📁</div>
                             <div className="text-truncate small fw-bold" title={subfolder.displayName || subfolder.name}>
                               {subfolder.displayName || subfolder.name}
                             </div>
                           </Card>
                         </Col>
                       ))}
                     </Row>
                  </div>
                 )}

                 {/* Cuadrícula de documentos */}
                 <div>
                    <h6 className="text-muted mb-3">Archivos ({items.documents.length})</h6>
                    <Row className="g-3">
                      {items.documents.map(doc => (
                        <Col key={doc.id} xs={12} sm={6} md={4} lg={3}>
                          <DocumentCard document={doc} />
                        </Col>
                      ))}
                      {items.documents.length === 0 && items.subfolders.length === 0 && (
                        <div className="text-center text-muted py-5">
                          <div className="fs-1 mb-2">📂</div>
                          <p>Esta carpeta está vacía</p>
                        </div>
                      )}
                    </Row>
                 </div>
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal de crear carpeta */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Carpeta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej: Proyectos 2024" 
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || creatingFolder}
          >
            {creatingFolder ? <Spinner size="sm" animation="border" /> : 'Crear Carpeta'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
