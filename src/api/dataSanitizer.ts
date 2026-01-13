/**
 * Sanitiza los datos de entrada para prevenir inyección de código
 * Función exportada separadamente para facilitar el testing
 */
export const sanitizeData = <T>(data: T): T => {
  if (typeof data === 'string') {
    // Remover caracteres peligrosos
    return data.replace(/[<>]/g, '') as T;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item)) as T;
  }
  
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized as T;
  }
  
  return data;
};
