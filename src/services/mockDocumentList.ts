import type { Document } from "../types/document.types";

 
 
 const documents: Document[] = [
    {
      id: '1',
      name: 'Contrato_Comercial_2025.pdf',
      category: 'Legal',
      date: '15 Nov 2025',
      size: '2.4 MB',
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Informe_Financiero_Q3.pdf',
      category: 'Finanzas',
      date: '10 Nov 2025',
      size: '1.8 MB',
      type: 'pdf'
    },
    {
      id: '3',
      name: 'Propuesta_Proyecto_Alpha.pdf',
      category: 'Proyectos',
      date: '8 Nov 2025',
      size: '3.1 MB',
      type: 'pdf'
    },
    {
      id: '4',
      name: 'Acuerdo_Confidencialidad.pdf',
      category: 'Legal',
      date: '5 Nov 2025',
      size: '890 KB',
      type: 'pdf'
    },
    {
      id: '5',
      name: 'Presupuesto_2026.excel',
      category: 'Finanzas',
      date: '3 Nov 2025',
      size: '1.2 MB',
      type: 'excel'
    },
    {
      id: '6',
      name: 'Especificaciones_Tecnicas.word',
      category: 'Técnico',
      date: '1 Nov 2025',
      size: '645 KB',
      type: 'word'
    },
    {
      id: '7',
      name: 'Auditoria_Legal_2025.pdf',
      category: 'Legal',
      date: '28 Oct 2025',
      size: '4.2 MB',
      type: 'pdf'
    },
    {
      id: '8',
      name: 'Plan_Marketing_Digital.pdf',
      category: 'Marketing',
      date: '25 Oct 2025',
      size: '2.9 MB',
      type: 'pdf'
    }
  ];

    export const getMockDocuments = (): Promise<Document[]> => {
        return new Promise((resolve) => {
        setTimeout(() => {
            resolve(documents);
        }, 500);
        });
  };