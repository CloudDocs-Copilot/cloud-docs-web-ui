import type { Document } from "../types/document.types";

/**
 * Lista de documentos mock para desarrollo y testing
 * Basada en el modelo de Mongoose del backend
 */
const documents: Document[] = [
  {
    id: '1',
    filename: 'contrato_comercial_2025_abc123.pdf',
    originalname: 'Contrato_Comercial_2025.pdf',
    url: '/documents/1/download',
    uploadedBy: 'user001',
    organization: 'org001',
    folder: 'folder_legal',
    path: '/uploads/org001/legal/contrato_comercial_2025_abc123.pdf',
    size: 2516582, // 2.4 MB
    mimeType: 'application/pdf',
    uploadedAt: '2025-11-15T10:30:00Z',
    sharedWith: ['user002', 'user003'],
    createdAt: '2025-11-15T10:30:00Z',
    updatedAt: '2025-11-15T10:30:00Z'
  },
  {
    id: '2',
    filename: 'informe_financiero_q3_def456.pdf',
    originalname: 'Informe_Financiero_Q3.pdf',
    url: '/documents/2/download',
    uploadedBy: 'user002',
    organization: 'org001',
    folder: 'folder_finanzas',
    path: '/uploads/org001/finanzas/informe_financiero_q3_def456.pdf',
    size: 1887436, // 1.8 MB
    mimeType: 'application/pdf',
    uploadedAt: '2025-11-10T14:20:00Z',
    sharedWith: ['user001', 'user004'],
    createdAt: '2025-11-10T14:20:00Z',
    updatedAt: '2025-11-10T14:20:00Z'
  },
  {
    id: '3',
    filename: 'propuesta_proyecto_alpha_ghi789.pdf',
    originalname: 'Propuesta_Proyecto_Alpha.pdf',
    url: '/documents/3/download',
    uploadedBy: 'user003',
    organization: 'org001',
    folder: 'folder_proyectos',
    path: '/uploads/org001/proyectos/propuesta_proyecto_alpha_ghi789.pdf',
    size: 3250585, // 3.1 MB
    mimeType: 'application/pdf',
    uploadedAt: '2025-11-08T09:15:00Z',
    sharedWith: ['user001', 'user002', 'user005'],
    createdAt: '2025-11-08T09:15:00Z',
    updatedAt: '2025-11-08T09:15:00Z'
  },
  {
    id: '4',
    filename: 'acuerdo_confidencialidad_jkl012.pdf',
    originalname: 'Acuerdo_Confidencialidad.pdf',
    url: '/documents/4/download',
    uploadedBy: 'user001',
    organization: 'org001',
    folder: 'folder_legal',
    path: '/uploads/org001/legal/acuerdo_confidencialidad_jkl012.pdf',
    size: 911360, // 890 KB
    mimeType: 'application/pdf',
    uploadedAt: '2025-11-05T16:45:00Z',
    sharedWith: ['user003'],
    createdAt: '2025-11-05T16:45:00Z',
    updatedAt: '2025-11-05T16:45:00Z'
  },
  {
    id: '5',
    filename: 'presupuesto_2026_mno345.xlsx',
    originalname: 'Presupuesto_2026.xlsx',
    url: '/documents/5/download',
    uploadedBy: 'user004',
    organization: 'org001',
    folder: 'folder_finanzas',
    path: '/uploads/org001/finanzas/presupuesto_2026_mno345.xlsx',
    size: 1258291, // 1.2 MB
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedAt: '2025-11-03T11:00:00Z',
    sharedWith: ['user001', 'user002'],
    createdAt: '2025-11-03T11:00:00Z',
    updatedAt: '2025-11-03T11:00:00Z'
  },
  {
    id: '6',
    filename: 'especificaciones_tecnicas_pqr678.docx',
    originalname: 'Especificaciones_Tecnicas.docx',
    url: '/documents/6/download',
    uploadedBy: 'user005',
    organization: 'org001',
    folder: 'folder_tecnico',
    path: '/uploads/org001/tecnico/especificaciones_tecnicas_pqr678.docx',
    size: 660480, // 645 KB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2025-11-01T08:30:00Z',
    sharedWith: ['user003', 'user006'],
    createdAt: '2025-11-01T08:30:00Z',
    updatedAt: '2025-11-01T08:30:00Z'
  },
  {
    id: '7',
    filename: 'auditoria_legal_2025_stu901.pdf',
    originalname: 'Auditoria_Legal_2025.pdf',
    url: '/documents/7/download',
    uploadedBy: 'user002',
    organization: 'org001',
    folder: 'folder_legal',
    path: '/uploads/org001/legal/auditoria_legal_2025_stu901.pdf',
    size: 4404019, // 4.2 MB
    mimeType: 'application/pdf',
    uploadedAt: '2025-10-28T13:10:00Z',
    sharedWith: ['user001'],
    createdAt: '2025-10-28T13:10:00Z',
    updatedAt: '2025-10-28T13:10:00Z'
  },
  {
    id: '8',
    filename: 'plan_marketing_digital_vwx234.pdf',
    originalname: 'Plan_Marketing_Digital.pdf',
    url: '/documents/8/download',
    uploadedBy: 'user006',
    organization: 'org001',
    folder: 'folder_marketing',
    path: '/uploads/org001/marketing/plan_marketing_digital_vwx234.pdf',
    size: 3040870, // 2.9 MB
    mimeType: 'application/pdf',
    uploadedAt: '2025-10-25T15:25:00Z',
    sharedWith: ['user001', 'user003', 'user004'],
    createdAt: '2025-10-25T15:25:00Z',
    updatedAt: '2025-10-25T15:25:00Z'
  }
];

/**
 * Función mock para obtener la lista de documentos
 * Simula una llamada asíncrona a la API con un delay de 500ms
 */
export const getMockDocuments = (): Promise<Document[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(documents);
    }, 500);
  });
};