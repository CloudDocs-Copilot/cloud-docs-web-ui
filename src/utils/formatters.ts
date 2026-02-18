/**
 * Utilidades para formatear datos
 */

/**
 * Formatea un tamaño de archivo en bytes a una cadena legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formatea una fecha a una cadena legible
 */
export const formatDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Si es hoy
  if (diffDays === 0 || diffDays === 1) {
    return 'Hoy';
  }
  
  // Si es ayer
  if (diffDays === 2) {
    return 'Ayer';
  }
  
  // Si es esta semana
  if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`;
  }
  
  // Si es este año
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
  
  // Año diferente
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};