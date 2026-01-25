/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Agrega más variables de entorno aquí si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaración para process.env (para compatibilidad con Jest)
declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_API_BASE_URL?: string;
  }
}

// Declaraciones para CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
