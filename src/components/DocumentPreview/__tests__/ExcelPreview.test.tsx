import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExcelPreview } from '../ExcelPreview';

// Mock xlsx library
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

import * as XLSX from 'xlsx';

describe('ExcelPreview', () => {
  const mockFileReader = {
    readAsArrayBuffer: jest.fn(),
    onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
    onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
    result: null as ArrayBuffer | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;
  });

  const createMockBlob = (): Blob => {
    return new Blob(['test data'], { type: 'application/vnd.ms-excel' });
  };

  const setupMockWorkbook = (sheets: Array<{ name: string; data: string[][] }>) => {
    const mockWorkbook = {
      SheetNames: sheets.map(s => s.name),
      Sheets: {} as Record<string, unknown>,
    };

    sheets.forEach(sheet => {
      mockWorkbook.Sheets[sheet.name] = {};
    });

    (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
    
    sheets.forEach(sheet => {
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValueOnce(sheet.data);
    });
  };

  it('debe mostrar mensaje de carga inicialmente', () => {
    const mockBlob = createMockBlob();
    render(<ExcelPreview file={mockBlob} />);

    expect(screen.getByText(/procesando archivo excel/i)).toBeInTheDocument();
  });

  it('debe mostrar una sola hoja con datos', async () => {
    const mockBlob = createMockBlob();
    setupMockWorkbook([
      {
        name: 'Hoja1',
        data: [
          ['A1', 'B1', 'C1'],
          ['A2', 'B2', 'C2'],
        ],
      },
    ]);

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga del archivo
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText('Hoja1')).toBeInTheDocument();
      expect(screen.getByText(/1 hoja disponible/i)).toBeInTheDocument();
    });

    // Verificar datos de la tabla
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();

    // Verificar info de filas y columnas
    expect(screen.getByText(/2 filas × 3 columnas/i)).toBeInTheDocument();
  });

  it('debe mostrar múltiples hojas con pestañas de navegación', async () => {
    const mockBlob = createMockBlob();
    setupMockWorkbook([
      {
        name: 'Ventas',
        data: [
          ['Producto', 'Cantidad'],
          ['Laptop', '10'],
        ],
      },
      {
        name: 'Inventario',
        data: [
          ['Item', 'Stock'],
          ['Mouse', '50'],
        ],
      },
      {
        name: 'Clientes',
        data: [
          ['Nombre', 'Ciudad'],
          ['Juan', 'Madrid'],
        ],
      },
    ]);

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga del archivo
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText('Ventas')).toBeInTheDocument();
      expect(screen.getByText('Inventario')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText(/3 hojas disponibles/i)).toBeInTheDocument();
    });

    // Por defecto debe mostrar la primera hoja (Ventas)
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('debe permitir navegar entre hojas usando las pestañas', async () => {
    const user = userEvent.setup();
    const mockBlob = createMockBlob();
    setupMockWorkbook([
      {
        name: 'Hoja1',
        data: [['Dato1', 'Valor1']],
      },
      {
        name: 'Hoja2',
        data: [['Dato2', 'Valor2']],
      },
    ]);

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText('Hoja1')).toBeInTheDocument();
    });

    // Inicialmente debe mostrar datos de Hoja1
    expect(screen.getByText('Dato1')).toBeInTheDocument();
    expect(screen.getByText('Valor1')).toBeInTheDocument();

    // Click en pestaña Hoja2
    const hoja2Tab = screen.getByText('Hoja2');
    await user.click(hoja2Tab);

    // Debe mostrar datos de Hoja2
    await waitFor(() => {
      expect(screen.getByText('Dato2')).toBeInTheDocument();
      expect(screen.getByText('Valor2')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando una hoja está vacía', async () => {
    const mockBlob = createMockBlob();
    setupMockWorkbook([
      {
        name: 'HojaVacia',
        data: [],
      },
    ]);

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText(/esta hoja está vacía/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar error cuando falla la carga del archivo', async () => {
    const mockBlob = createMockBlob();
    (XLSX.read as jest.Mock).mockImplementation(() => {
      throw new Error('Archivo corrupto');
    });

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga con error
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText(/error al cargar excel/i)).toBeInTheDocument();
      expect(screen.getByText(/archivo corrupto/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar error cuando FileReader falla', async () => {
    const mockBlob = createMockBlob();
    render(<ExcelPreview file={mockBlob} />);

    // Simular error en FileReader
    if (mockFileReader.onerror) {
      mockFileReader.onerror({} as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(screen.getByText(/error al cargar el archivo excel/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar badges con el índice de las hojas', async () => {
    const mockBlob = createMockBlob();
    setupMockWorkbook([
      {
        name: 'Primera',
        data: [['A']],
      },
      {
        name: 'Segunda',
        data: [['B']],
      },
    ]);

    render(<ExcelPreview file={mockBlob} />);

    // Simular carga
    if (mockFileReader.onload) {
      mockFileReader.result = new ArrayBuffer(8);
      mockFileReader.onload({
        target: mockFileReader,
      } as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      // Debe mostrar el contador de hojas en los badges
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    });
  });
});
