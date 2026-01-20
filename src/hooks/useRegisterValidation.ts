import { useState } from 'react';

export function useRegisterValidation() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (email: string, password: string) => {
    const newErrors: { email?: string; password?: string } = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = 'Email no válido';
    }
    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate };
}
