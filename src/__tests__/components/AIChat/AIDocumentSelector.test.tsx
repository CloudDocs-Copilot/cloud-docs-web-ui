import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AIDocumentSelector } from '../../../components/AIChat/AIDocumentSelector';

jest.mock('../../../services/document.service', () => ({
  listDocuments: jest.fn(),
  listSharedDocuments: jest.fn(),
}));

jest.mock('../../../services/search.service', () => ({
  __esModule: true,
  default: {
    autocomplete: jest.fn(),
    search: jest.fn(),
  },
}));

import { listDocuments, listSharedDocuments } from '../../../services/document.service';
import searchService from '../../../services/search.service';

const ownDoc = {
  id: 'doc-1',
  filename: 'Factura_2024.pdf',
  mimeType: 'application/pdf',
  aiProcessingStatus: 'completed',
  uploadedBy: 'user-1',
  folder: 'root',
  path: '/docs/f.pdf',
  size: 1024,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const incompatibleDoc = {
  id: 'doc-2',
  filename: 'Imagen.png',
  mimeType: 'image/png',
  aiProcessingStatus: 'none',
  uploadedBy: 'user-1',
  folder: 'root',
  path: '/docs/i.png',
  size: 2048,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sharedDoc = {
  id: 'doc-3',
  filename: 'Contrato.pdf',
  mimeType: 'application/pdf',
  aiProcessingStatus: 'completed',
  uploadedBy: 'user-2',
  folder: 'root',
  path: '/docs/c.pdf',
  size: 3072,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOwnDocs    = { success: true, count: 2, documents: [ownDoc, incompatibleDoc] };
const mockSharedDocs = { success: true, count: 1, documents: [sharedDoc] };

describe('AIDocumentSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (listDocuments as jest.Mock).mockResolvedValue(mockOwnDocs);
    (listSharedDocuments as jest.Mock).mockResolvedValue(mockSharedDocs);
    (searchService.autocomplete as jest.Mock).mockResolvedValue([]);
    (searchService.search as jest.Mock).mockResolvedValue({ success: true, data: [], total: 0, took: 1, limit: 10, offset: 0 });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renderiza el trigger con el placeholder por defecto', () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    expect(screen.getByText(/Seleccionar documento/i)).toBeInTheDocument();
  });

  it('muestra spinner de carga inicial mientras obtiene documentos', () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('muestra secciones "Mis documentos" y "Compartidos conmigo" tras carga', async () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => {
      expect(screen.getByText('Mis documentos')).toBeInTheDocument();
      expect(screen.getByText('Compartidos conmigo')).toBeInTheDocument();
    });
  });

  it('muestra documentos propios y compartidos, con badge Compartido', async () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => {
      expect(screen.getByText('Factura_2024.pdf')).toBeInTheDocument();
      expect(screen.getByText('Contrato.pdf')).toBeInTheDocument();
      expect(screen.getByText('Compartido')).toBeInTheDocument();
    });
  });

  it('llama a onChange al seleccionar doc compatible', async () => {
    const handleChange = jest.fn();
    render(<AIDocumentSelector value={null} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByText('Factura_2024.pdf'));
    fireEvent.click(screen.getByText('Factura_2024.pdf'));
    expect(handleChange).toHaveBeenCalledWith('doc-1', 'Factura_2024.pdf');
  });

  it('NO llama a onChange en doc incompatible (image/png)', async () => {
    const handleChange = jest.fn();
    render(<AIDocumentSelector value={null} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByText('Imagen.png'));
    fireEvent.click(screen.getByText('Imagen.png'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('muestra el nombre del doc seleccionado en el trigger', async () => {
    render(<AIDocumentSelector value="doc-1" onChange={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Factura_2024.pdf')).toBeInTheDocument();
    });
  });

  it('llama a autocomplete con debounce tras escribir >=2 caracteres', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['Factura_2024.pdf', 'Factura_2023.pdf']);
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByRole('textbox', { name: /Filtrar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrar/i }), { target: { value: 'Fa' } });
    expect(searchService.autocomplete).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(searchService.autocomplete).toHaveBeenCalledWith('Fa');
    await waitFor(() => {
      expect(screen.getByText('Factura_2024.pdf')).toBeInTheDocument();
    });
  });

  it('NO llama a autocomplete si el texto tiene <2 caracteres', async () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByRole('textbox', { name: /Filtrar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrar/i }), { target: { value: 'F' } });
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(searchService.autocomplete).not.toHaveBeenCalled();
  });

  it('ejecuta search al pulsar Enter y muestra resultados', async () => {
    (searchService.search as jest.Mock).mockResolvedValue({ success: true, data: [ownDoc], total: 1, took: 5, limit: 10, offset: 0 });
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByRole('textbox', { name: /Filtrar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrar/i }), { target: { value: 'Factura' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: /Filtrar/i }), { key: 'Enter' });
    await waitFor(() => expect(searchService.search).toHaveBeenCalledWith({ query: 'Factura' }));
    await waitFor(() => {
      expect(screen.getByText(/Resultados para/i)).toBeInTheDocument();
    });
  });

  it('clicking una sugerencia ejecuta search con ese termino', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['Factura_2024.pdf']);
    (searchService.search as jest.Mock).mockResolvedValue({ success: true, data: [ownDoc], total: 1, took: 5, limit: 10, offset: 0 });
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByRole('textbox', { name: /Filtrar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrar/i }), { target: { value: 'Fa' } });
    await act(async () => { jest.advanceTimersByTime(400); });
    await waitFor(() => screen.getByText('Factura_2024.pdf'));
    fireEvent.click(screen.getByText('Factura_2024.pdf'));
    await waitFor(() => expect(searchService.search).toHaveBeenCalledWith({ query: 'Factura_2024.pdf' }));
  });

  it('boton limpiar vuelve a la vista inicial', async () => {
    (searchService.search as jest.Mock).mockResolvedValue({ success: true, data: [ownDoc], total: 1, took: 5, limit: 10, offset: 0 });
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => screen.getByRole('textbox', { name: /Filtrar/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrar/i }), { target: { value: 'Factura' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: /Filtrar/i }), { key: 'Enter' });
    await waitFor(() => screen.getByText(/Resultados para/i));
    fireEvent.click(screen.getByRole('button', { name: /Limpiar b/i }));
    await waitFor(() => expect(screen.getByText('Mis documentos')).toBeInTheDocument());
  });

  it('muestra "Sin documentos" si ambas peticiones fallan', async () => {
    (listDocuments as jest.Mock).mockRejectedValue(new Error('Network'));
    (listSharedDocuments as jest.Mock).mockRejectedValue(new Error('Network'));
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => expect(screen.getByText(/Sin documentos disponibles/i)).toBeInTheDocument());
  });

  it('muestra badge "Procesado" en documentos con status completed', async () => {
    render(<AIDocumentSelector value={null} onChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Selector de documentos/i }));
    await waitFor(() => expect(screen.getAllByText('Procesado').length).toBeGreaterThan(0));
  });
});
