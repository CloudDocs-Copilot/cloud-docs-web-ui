import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ExcelPreviewProps {
  file: File | Blob;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({ file }) => {
  const [sheets, setSheets] = useState<Array<{ name: string; data: string[][] }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetArr: Array<{ name: string; data: string[][] }> = [];
        workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
          sheetArr.push({ name: sheetName, data: sheetData });
        });
        setSheets(sheetArr);
        setError(null);
      } catch (err: unknown) {
        setError(`Error al leer el archivo Excel: ${(err as Error).message}`);
      }
    };
    reader.onerror = () => setError("Error al cargar el archivo Excel");
    reader.readAsArrayBuffer(file);
  }, [file]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (sheets.length === 0) {
    return <div>Procesando archivo Excel...</div>;
  }

  return (
    <div>
      {sheets.map((sheet) => (
        <div key={sheet.name} style={{ marginBottom: 24 }}>
          <h5>{sheet.name}</h5>
          <table className="table table-bordered table-sm">
            <tbody>
              {sheet.data.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cidx) => (
                    <td key={cidx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ExcelPreview;
