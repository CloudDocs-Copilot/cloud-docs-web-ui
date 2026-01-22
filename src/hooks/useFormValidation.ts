import { useState } from 'react';

/**
 * Interfaz que define las reglas de validación para cada campo del formulario
 * Cada clave representa un nombre de campo y su valor es una función que valida ese campo
 */
export interface ValidationRules {
  [key: string]: (value: string) => string;
}

/**
 * Hook personalizado para manejar validación de formularios
 * @template T - Tipo del objeto de datos del formulario que debe extender Record<string, string>
 * @param validationRules - Objeto con las reglas de validación para cada campo
 * @returns Objeto con estado de errores y métodos de validación
 */
export const useFormValidation = <T extends Record<string, string>>(
  validationRules: ValidationRules
) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  /**
   * Valida formato de email
   * @param email - String con el email a validar
   * @returns true si el email es válido, false en caso contrario
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Valida que un nombre contenga solo letras, espacios y acentos (mínimo 2 caracteres)
   * @param name - String con el nombre a validar
   * @returns true si el nombre es válido, false en caso contrario
   */
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    return nameRegex.test(name.trim());
  };

  /**
   * Valida formato de número de teléfono (8-15 dígitos, puede incluir espacios, guiones y paréntesis)
   * @param phone - String con el teléfono a validar
   * @returns true si el teléfono es válido, false en caso contrario
   */
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-()]{8,15}$/;
    return phoneRegex.test(phone.trim());
  };

  /**
   * Valida fortaleza de contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula y número)
   * @param password - String con la contraseña a validar
   * @returns true si la contraseña es válida, false en caso contrario
   */
  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  /**
   * Valida formato de URL
   * @param url - String con la URL a validar
   * @returns true si la URL es válida, false en caso contrario
   */
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Valida que un string contenga solo números
   * @param value - String a validar
   * @returns true si contiene solo números, false en caso contrario
   */
  const validateNumeric = (value: string): boolean => {
    return /^\d+$/.test(value);
  };

  /**
   * Valida que un string contenga solo caracteres alfanuméricos
   * @param value - String a validar
   * @returns true si contiene solo caracteres alfanuméricos, false en caso contrario
   */
  const validateAlphanumeric = (value: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(value);
  };

  /**
   * Valida longitud mínima de un string
   * @param value - String a validar
   * @param minLength - Longitud mínima requerida
   * @returns true si cumple con la longitud mínima, false en caso contrario
   */
  const validateMinLength = (value: string, minLength: number): boolean => {
    return value.trim().length >= minLength;
  };

  /**
   * Valida longitud máxima de un string
   * @param value - String a validar
   * @param maxLength - Longitud máxima permitida
   * @returns true si no excede la longitud máxima, false en caso contrario
   */
  const validateMaxLength = (value: string, maxLength: number): boolean => {
    return value.trim().length <= maxLength;
  };

  /**
   * Valida un campo específico usando las reglas de validación proporcionadas
   * @param fieldName - Nombre del campo a validar
   * @param value - Valor del campo
   * @returns String con el mensaje de error o string vacío si es válido
   */
  const validateField = (fieldName: keyof T, value: string): string => {
    const validator = validationRules[fieldName as string];
    return validator ? validator(value) : '';
  };

  /**
   * Valida todos los campos del formulario
   * @param formData - Objeto con los datos del formulario
   * @returns true si todos los campos son válidos, false si hay errores
   */
  const validateAllFields = (formData: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof T>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  /**
   * Limpia el error de un campo específico
   * @param fieldName - Nombre del campo cuyo error se quiere limpiar
   */
  const clearFieldError = (fieldName: keyof T) => {
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  /**
   * Limpia todos los errores del formulario
   */
  const clearAllErrors = () => {
    setErrors({});
  };

  /**
   * Establece un error manualmente para un campo específico
   * @param fieldName - Nombre del campo
   * @param errorMessage - Mensaje de error a establecer
   */
  const setFieldError = (fieldName: keyof T, errorMessage: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  };

  /**
   * Maneja el evento onBlur de un campo, validándolo automáticamente
   * @param fieldName - Nombre del campo que perdió el foco
   * @param value - Valor actual del campo
   */
  const handleBlur = (fieldName: keyof T, value: string) => {
    const error = validateField(fieldName, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  /**
   * Verifica si hay algún error en el formulario
   * @returns true si hay errores, false en caso contrario
   */
  const hasErrors = (): boolean => {
    return Object.values(errors).some(error => error !== '' && error !== undefined);
  };

  /**
   * Obtiene el mensaje de error de un campo específico
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error o undefined si no hay error
   */
  const getFieldError = (fieldName: keyof T): string | undefined => {
    return errors[fieldName];
  };

  return {
    errors,
    validateEmail,
    validateName,
    validatePhone,
    validatePassword,
    validateUrl,
    validateNumeric,
    validateAlphanumeric,
    validateMinLength,
    validateMaxLength,
    validateField,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
    setFieldError,
    handleBlur,
    hasErrors,
    getFieldError
  };
};
