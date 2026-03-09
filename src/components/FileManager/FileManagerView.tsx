import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Spinner, Form, Modal, Pagination } from 'react-bootstrap';
import { FolderPlus, FileEarmarkPlus } from 'react-bootstrap-icons';
import { FolderTree } from './FolderTree';
import { FolderCard } from './FolderCard';
import { FolderBreadcrumbs } from './FolderBreadcrumbs';
import { FileUploader } from '../FileUploader/FileUploader';
import DocumentCard from '../DocumentCard';
import treeStyles from './FolderTree.module.css';
import { DocumentPreviewModal } from '../DocumentPreview';
import { folderService } from '../../services/folder.service';
import * as documentService from '../../services/document.service';
import { previewService } from '../../services/preview.service';
import useOrganization from '../../hooks/useOrganization';
import type { Folder } from '../../types/folder.types';
import type { Document } from '../../types/document.types';
import type { PreviewDocument } from '../../types/preview.types';

// Helper function to extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
    return err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
  }
  return 'Unknown error';
};

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
  const [folderTree, setFolderTree] = useState<Folder | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const DOCUMENTS_PER_PAGE = 20;

  // New Folder Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);

  // Rename Folder Modal State
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(false);

  // Rename Document Modal State
  const [showRenameDocModal, setShowRenameDocModal] = useState(false);
  const [documentToRename, setDocumentToRename] = useState<Document | null>(null);
  const [renameDocValue, setRenameDocValue] = useState('');
  const [renamingDoc, setRenamingDoc] = useState(false);

  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Helper to find path in tree (would handle breadcrumbs)
  // For now, simpler breadcrumbs: just Current Folder name, or we rely on Tree selection highlight
  
  const fetchContents = useCallback(async (folderId: string, page: number = 1) => {
    setLoading(true);
    try {
      const data = await folderService.getContents(folderId, page, DOCUMENTS_PER_PAGE);
      setItems({ subfolders: data.subfolders, documents: data.documents });
      // Update current folder details from response
      setCurrentFolder(data.folder);
      // Update pagination info
      if (data.pagination) {
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalDocuments(data.pagination.total);
      }
    } catch (error: unknown) {
      console.error('[FileManagerView] Error al cargar contenido:', error);
      alert(`Error al cargar carpeta: ${getErrorMessage(error)}`);
      // Reset loading even on error
      setItems({ subfolders: [], documents: [] });
    } finally {
      setLoading(false);
    }
  }, [DOCUMENTS_PER_PAGE]);

  // Effect to handle external refresh triggers (e.g. from File Upload in Header)
  useEffect(() => {
    if (externalRefresh > 0 && currentFolder) {
       fetchContents(currentFolder.id, currentPage);
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
    setCurrentPage(1); // Reset to page 1 when changing folders
    fetchContents(folder.id, 1);
  }, [fetchContents]);

  const handleCreateFolder = async () => {
    if (!newFolderName) {
      alert('El nombre de la carpeta es requerido');
      return;
    }
    
    if (!currentFolder?.id) {
      alert('Por favor selecciona una carpeta primero');
      return;
    }
    
    if (!activeOrganization?.id) {
      alert('No hay organización activa');
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
      // Refresh content and tree (reset to page 1 as folder list changed)
      setCurrentPage(1);
      fetchContents(currentFolder.id, 1);
      setRefreshTree(prev => prev + 1);
    } catch (error: unknown) {
      console.error('Error al crear carpeta:', error);
      alert(`Error al crear carpeta: ${getErrorMessage(error)}`);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = (folder: Folder) => {
    setFolderToRename(folder);
    setRenameFolderValue(folder.displayName || folder.name);
    setShowRenameModal(true);
  };

  const handleConfirmRenameFolder = async () => {
    if (!folderToRename || !renameFolderValue.trim()) {
      return;
    }
    
    setRenamingFolder(true);
    try {
      await folderService.rename(folderToRename.id, { 
        displayName: renameFolderValue.trim() 
      });
      setShowRenameModal(false);
      setFolderToRename(null);
      setRenameFolderValue('');
      // Refresh content and tree
      if (currentFolder) {
        fetchContents(currentFolder.id, currentPage);
      }
      setRefreshTree(prev => prev + 1);
    } catch (error: unknown) {
      console.error('Error al renombrar carpeta:', error);
      alert(`Error al renombrar carpeta: ${getErrorMessage(error)}`);
    } finally {
      setRenamingFolder(false);
    }
  };

  const handleRenameDocument = (doc: Document) => {
    setDocumentToRename(doc);
    // Mostrar el nombre original del archivo (no el ID del sistema)
    setRenameDocValue(doc.originalname || doc.filename || '');
    setShowRenameDocModal(true);
  };

  const handleDocumentDeleted = useCallback(() => {
    console.log('[FileManagerView] handleDocumentDeleted ejecutado');
    console.log('[FileManagerView] currentFolder:', currentFolder?.id, currentFolder?.name);
    
    // Refrescar el contenido de la carpeta actual después de eliminar
    if (currentFolder) {
      console.log('[FileManagerView] Llamando a fetchContents para actualizar la lista...');
      fetchContents(currentFolder.id, currentPage);
      // También refrescar el árbol para actualizar los contadores
      setRefreshTree(prev => prev + 1);
    } else {
      console.warn('[FileManagerView] No hay currentFolder, no se puede refrescar');
    }
  }, [currentFolder, currentPage, fetchContents]);

  const handleConfirmRenameDocument = async () => {
    if (!documentToRename || !renameDocValue.trim()) {
      return;
    }
    
    setRenamingDoc(true);
    try {
      await documentService.renameDocument(documentToRename.id, renameDocValue.trim());
      setShowRenameDocModal(false);
      setDocumentToRename(null);
      setRenameDocValue('');
      // Refresh content
      if (currentFolder) {
        fetchContents(currentFolder.id, currentPage);
      }
    } catch (error: unknown) {
      console.error('Error al renombrar documento:', error);
      alert(`Error al renombrar documento: ${getErrorMessage(error)}`);
    } finally {
      setRenamingDoc(false);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    // Convertir Document a PreviewDocument
    const docToPreview: PreviewDocument = {
      id: doc.id,
      filename: doc.filename || doc.originalname || 'unknown',
      originalname: doc.originalname,
      mimeType: doc.mimeType,
      size: doc.size,
      url: doc.url,
      path: doc.path
    };
    
    // Verificar si se puede previsualizar
    if (previewService.canPreview(docToPreview)) {
      setPreviewDocument(docToPreview);
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewDocument(null);
  };

  const handleUploadClick = () => {
    if (!currentFolder?.id) {
      alert('Por favor selecciona una carpeta primero');
      return;
    }
    setShowUploadModal(true);
  };

  const handleUploadComplete = () => {
    // Refrescar contenido después de subir archivos
    if (currentFolder) {
      fetchContents(currentFolder.id, currentPage);
      setRefreshTree(prev => prev + 1);
    }
  };

  // Construir el path completo del breadcrumb buscando en el árbol
  const buildBreadcrumbPath = (folderId: string | undefined, tree: Folder | null): Folder[] => {
    if (!folderId || !tree) return [];
    
    const path: Folder[] = [];
    
    const findPath = (node: Folder, targetId: string): boolean => {
      // Si encontramos el nodo, agregarlo al path
      if (node.id === targetId) {
        path.push(node);
        return true;
      }
      
      // Si tiene hijos, buscar recursivamente
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (findPath(child, targetId)) {
            // Si se encontró en un hijo, agregar este nodo al inicio del path
            path.unshift(node);
            return true;
          }
        }
      }
      
      return false;
    };
    
    findPath(tree, folderId);
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(currentFolder?.id, folderTree);

  /**
   * Maneja el movimiento de documentos desde Drag & Drop
   */
  const handleMoveDocument = async (documentId: string, targetFolderId: string) => {
    try {
      setLoading(true);
      await documentService.moveDocument(documentId, targetFolderId);
      // Refresh current folder view as the document might have moved OUT of it
      if (currentFolder) {
        fetchContents(currentFolder.id, currentPage);
      }
      // Also refresh tree in case counts update (if we implement counts)
      setRefreshTree(prev => prev + 1);
    } catch (error) {
      console.error('Error al mover documento', error);
      // alert('Error al mover documento'); // Opcional: reemplazar con Toast
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el movimiento de carpetas desde Drag & Drop
   */
  const handleMoveFolder = async (sourceFolderId: string, targetFolderId: string) => {
    try {
      setLoading(true);
      await folderService.move(sourceFolderId, { targetFolderId });
      // Refresh current folder view
      if (currentFolder) {
        fetchContents(currentFolder.id, currentPage);
      }
      // Refresh tree to show new structure
      setRefreshTree(prev => prev + 1);
    } catch (error: unknown) {
      console.error('Error al mover carpeta', error);
      alert('Error al mover carpeta: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column overflow-hidden p-0" style={{ backgroundColor: '#f5f6f8' }}>
      {/* Barra de herramientas */}
      <div className="bg-white border-bottom p-2 d-flex justify-content-between align-items-center" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h5 className="m-0 ps-2" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Archivos</h5>
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
            disabled={!currentFolder}
          >
            <FileEarmarkPlus className="me-2" /> 
            Subir Archivo
          </Button>
        </div>
      </div>

      <Row className="flex-grow-1 g-0 overflow-hidden">
        {/* Árbol lateral */}
        <Col md={3} lg={2} className={`border-end h-100 ${treeStyles.treeContainer}`} style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb' }}>
          <div className="p-2">
            <FolderTree 
              onSelectFolder={handleSelectFolder} 
              selectedFolderId={currentFolder?.id}
              refreshTrigger={refreshTree}
              onMoveDocument={handleMoveDocument}
              onDocumentClick={handleDocumentClick}
              onRenameFolder={handleRenameFolder}
              onRenameDocument={handleRenameDocument}
              onTreeLoaded={setFolderTree}
            />
          </div>
        </Col>

        {/* Contenido principal */}
        <Col md={9} lg={10} className="d-flex flex-column h-100 overflow-hidden">
          {/* Área de navegación (breadcrumbs) */}
          <div className="p-2 border-bottom bg-white" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <FolderBreadcrumbs 
              currentFolder={currentFolder} 
              path={breadcrumbPath}
              onNavigate={(id) => {
                setCurrentPage(1);
                fetchContents(id, 1);
              }}
            />
          </div>

          {/* Cuadrícula de archivos */}
          <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#fafbfc' }}>
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
                           <FolderCard 
                              folder={subfolder}
                              onSelect={handleSelectFolder}
                              onMoveDocument={handleMoveDocument}
                              onMoveFolder={handleMoveFolder}
                              onRename={handleRenameFolder}
                           />
                         </Col>
                       ))}
                     </Row>
                  </div>
                 )}

                 {/* Cuadrícula de documentos */}
                 <div>
                    <h6 className="text-muted mb-3">Archivos ({totalDocuments > 0 ? totalDocuments : items.documents.length})</h6>
                    <Row className="g-3">
                      {items.documents.map(doc => (
                        <Col key={doc.id} xs={12} sm={6} md={4} lg={3}>
                          <DocumentCard 
                            document={doc} 
                            onRename={handleRenameDocument}
                            onDeleted={handleDocumentDeleted}
                          />
                        </Col>
                      ))}
                      {items.documents.length === 0 && items.subfolders.length === 0 && (
                        <div className="text-center text-muted py-5">
                          <div className="fs-1 mb-2">📂</div>
                          <p>Esta carpeta está vacía</p>
                        </div>
                      )}
                    </Row>

                    {/* Controles de Paginación */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                          <Pagination.First 
                            onClick={() => currentFolder && fetchContents(currentFolder.id, 1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev 
                            onClick={() => currentFolder && fetchContents(currentFolder.id, currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          
                          {/* Mostrar páginas cercanas */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Mostrar primera, última, actual y 2 cercanas
                              return page === 1 || 
                                     page === totalPages || 
                                     Math.abs(page - currentPage) <= 2;
                            })
                            .map((page, index, array) => {
                              // Agregar puntos suspensivos si hay salto
                              const prevPage = array[index - 1];
                              const showEllipsis = prevPage && page - prevPage > 1;
                              
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <Pagination.Ellipsis disabled />}
                                  <Pagination.Item
                                    active={page === currentPage}
                                    onClick={() => currentFolder && fetchContents(currentFolder.id, page)}
                                  >
                                    {page}
                                  </Pagination.Item>
                                </React.Fragment>
                              );
                            })}
                          
                          <Pagination.Next 
                            onClick={() => currentFolder && fetchContents(currentFolder.id, currentPage + 1)}
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last 
                            onClick={() => currentFolder && fetchContents(currentFolder.id, totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
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

      {/* Modal de renombrar carpeta */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar Carpeta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Nuevo nombre" 
              value={renameFolderValue}
              onChange={e => setRenameFolderValue(e.target.value)}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmRenameFolder();
                }
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmRenameFolder}
            disabled={!renameFolderValue.trim() || renamingFolder}
          >
            {renamingFolder ? <Spinner size="sm" animation="border" /> : 'Renombrar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de renombrar documento */}
      <Modal show={showRenameDocModal} onHide={() => setShowRenameDocModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar Documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre del archivo</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Nuevo nombre con extensión" 
              value={renameDocValue}
              onChange={e => setRenameDocValue(e.target.value)}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmRenameDocument();
                }
              }}
            />
            <Form.Text className="text-muted">
              Incluye la extensión del archivo (ej: documento.pdf)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameDocModal(false)}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmRenameDocument}
            disabled={!renameDocValue.trim() || renamingDoc}
          >
            {renamingDoc ? <Spinner size="sm" animation="border" /> : 'Renombrar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de previsualización de documento */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          show={showPreview}
          onHide={handleClosePreview}
        />
      )}

      {/* Modal de carga múltiple de archivos */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <FileUploader
              folderId={currentFolder?.id}
              onUploadSuccess={handleUploadComplete}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </Container>
  );
};
