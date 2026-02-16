import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';

interface ExcelPreviewProps {
  file: File | Blob;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({ file }) => {
  const [data, setData] = useState<string[][]>([]);
  const [sheetName, setSheetName] = useState<string>('');

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      setSheetName(firstSheet);
      const sheet = workbook.Sheets[firstSheet];
      const sheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(sheetData);
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  if (!data.length) return <div>Cargando Excel...</div>;

  return (
    <div>
      <h5>Vista previa: {sheetName}</h5>
      <Table striped bordered hover responsive>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
