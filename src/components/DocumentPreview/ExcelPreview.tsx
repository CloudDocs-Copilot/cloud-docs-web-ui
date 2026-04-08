import React, { useEffect, useState } from "react";
import { Tab, Tabs, Alert, Badge } from "react-bootstrap";
import Excel from "exceljs";

interface ExcelPreviewProps {
  file: File | Blob;
}

interface SheetData {
  name: string;
  data: string[][];
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({ file }) => {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const loadExcelFile = async () => {
      try {
        const workbook = new Excel.Workbook();
        const arrayBuffer = await file.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const sheetArr: SheetData[] = [];

        workbook.worksheets.forEach((worksheet) => {
          const sheetData: string[][] = [];

          worksheet.eachRow((row, _rowNumber) => {
            const rowData: string[] = [];
            row.eachCell((cell, cellNumber) => {
              // Expandir el array si es necesario para que coincida con el índice de celda
              while (rowData.length < cellNumber) {
                rowData.push('');
              }
              rowData[cellNumber - 1] = cell.text || cell.value?.toString() || '';
            });
            sheetData.push(rowData);
          });

          sheetArr.push({ name: worksheet.name, data: sheetData });
        });

        setSheets(sheetArr);
        // Establecer la primera hoja como activa por defecto
        if (sheetArr.length > 0) {
          setActiveKey(sheetArr[0].name);
        }
        setError(null);
      } catch (err: unknown) {
        setError(`Error al leer el archivo Excel: ${(err as Error).message}`);
      }
    };

    loadExcelFile();
  }, [file]);

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error al cargar Excel</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Procesando archivo Excel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Indicador de número de hojas */}
      <div className="bg-light border-bottom p-2">
        <small className="text-muted">
          <i className="bi bi-file-earmark-spreadsheet me-2"></i>
          {sheets.length} {sheets.length === 1 ? 'hoja' : 'hojas'} disponible{sheets.length !== 1 ? 's' : ''}
        </small>
      </div>

      {/* Tabs para navegar entre hojas */}
      <Tabs
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || sheets[0].name)}
        className="mb-0"
        variant="tabs"
      >
        {sheets.map((sheet, index) => (
          <Tab
            key={sheet.name}
            eventKey={sheet.name}
            title={
              <span>
                {sheet.name}
                {index === 0 && sheets.length > 1 && (
                  <Badge bg="primary" className="ms-2" style={{ fontSize: '0.65rem' }}>
                    {index + 1}/{sheets.length}
                  </Badge>
                )}
                {index > 0 && sheets.length > 1 && (
                  <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.65rem' }}>
                    {index + 1}/{sheets.length}
                  </Badge>
                )}
              </span>
            }
          >
            <div style={{ 
              overflowX: 'auto', 
              overflowY: 'auto', 
              maxHeight: 'calc(100vh - 250px)',
              padding: '1rem'
            }}>
              {sheet.data.length === 0 ? (
                <Alert variant="info">
                  Esta hoja está vacía
                </Alert>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-sm table-hover">
                    <tbody>
                      {sheet.data.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cidx) => (
                            <td 
                              key={cidx}
                              style={{
                                whiteSpace: 'nowrap',
                                minWidth: '80px',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={String(cell || '')}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Info de la hoja */}
              <div className="mt-3 text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                {sheet.data.length} filas × {sheet.data[0]?.length || 0} columnas
              </div>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};
