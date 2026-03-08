# 🎨 CloudDocs Copilot - Brand Guidelines

Sistema centralizado de branding para mantener consistencia visual en toda la aplicación.

---

## 📁 Estructura

```
src/brand/
├── index.ts              # Punto único de importación
├── Logo.tsx              # Componente principal del logo
├── Logo.module.css       # Estilos del logo
├── constants.ts          # Colores, tamaños, configuración
├── types.ts              # TypeScript definitions
├── README.md             # Este archivo
├── assets/               # Assets estáticos
│   ├── favicon.ico
│   ├── logo-192.png
│   ├── logo-512.png
│   └── og-image.png
└── archive/              # Versiones anteriores
    ├── Logo.final.tsx
    ├── Logo.module.final.css
    └── README.md
```

---

## 🚀 Uso Rápido

### Importación básica

```tsx
import { Logo } from '@/brand';

// Uso simple (con valores por defecto)
<Logo />
```

### Con configuración personalizada

```tsx
import { Logo, LOGO_SIZES } from '@/brand';

// Navegación (Header)
<Logo 
  size={LOGO_SIZES.md} 
  variant="gradient" 
  onClick={() => navigate('/dashboard')} 
/>

// Autenticación (Login/Register)
<Logo 
  size={LOGO_SIZES.xl} 
  variant="gradient" 
  animated 
/>

// Footer (fondo oscuro)
<Logo 
  size={LOGO_SIZES.sm} 
  variant="white" 
/>
```

---

## 🎨 Paleta de Colores

### Gradiente Principal (3 colores)

```typescript
BRAND_COLORS.gradient = {
  start: '#6366f1',    // Indigo
  middle: '#8b5cf6',   // Purple
  end: '#d946ef',      // Pink
}
```

**Uso recomendado:**
- Logo principal
- Fondos de hero sections
- Elementos destacados
- Botones principales

### Gradiente Pestaña (efecto 3D)

```typescript
BRAND_COLORS.gradientTab = {
  start: '#7c3aed',    // Purple oscuro
  end: '#6366f1',      // Indigo
}
```

**Uso:** Exclusivo para la pestaña del folder en el logo (efecto de profundidad)

### Colores Sólidos

```typescript
primary: '#6366f1',     // Indigo - Color principal
secondary: '#8b5cf6',   // Purple - Acentos secundarios
accent: '#d946ef',      // Pink - Highlights especiales
```

---

## 📏 Tamaños Predefinidos

```typescript
LOGO_SIZES = {
  xs: 24,    // Extra pequeño (íconos inline)
  sm: 32,    // Pequeño (navegación móvil)
  md: 40,    // Mediano (por defecto)
  lg: 48,    // Grande
  xl: 56,    // Extra grande (autenticación)
  xxl: 72,   // Muy grande (landing page)
}
```

### Guía de uso por contexto

| Contexto | Tamaño | Variante | Animado |
|----------|--------|----------|---------|
| **Header** | `md` (40px) | `gradient` | No |
| **Login/Register** | `xl` (56px) | `gradient` | Sí |
| **Footer** | `sm` (32px) | `white` o `gradient` | No |
| **Mobile Nav** | `sm` (32px) | `gradient` | No |
| **Landing Hero** | `xxl` (72px) | `gradient` | Sí |
| **Inline** | `xs` (24px) | `default` | No |

---

## 🎭 Variantes

### 1. Gradient (Recomendada)

```tsx
<Logo variant="gradient" />
```

- **Uso:** Fondos blancos o claros
- **Apariencia:** Folder con gradiente vibrante de 3 colores
- **Contexto:** Login, Register, Header, Landing

### 2. White

```tsx
<Logo variant="white" />
```

- **Uso:** Fondos oscuros o con color
- **Apariencia:** Folder blanco con ícono coloreado
- **Contexto:** Dark mode, fondos coloridos

### 3. Default

```tsx
<Logo variant="default" />
```

- **Uso:** Contextos específicos
- **Apariencia:** Folder en color sólido indigo
- **Contexto:** Situaciones especiales

---

## ✨ Animaciones

### Pulse (para páginas estáticas)

```tsx
<Logo animated />
```

- **Efecto:** Scale suave de 1 a 1.05 en 2s
- **Uso:** Login, Register, Landing page
- **No usar en:** Header, navegación, elementos interactivos

### Hover (automático)

- **Efecto:** Scale 1.05 en 0.2s
- **Activación:** Cuando tiene prop `onClick`
- **Cambio de cursor:** Automático a pointer

---

## 📐 Composición del Logo

### Elementos visuales

```
📁 Folder con gradiente (base)
  ├─ 🏷️ Pestaña superior (gradiente propio para 3D)
  ├─ 🌑 Sombra interna (profundidad)
  ├─ 💫 Sombra externa (elevación)
  └─ ✨ Ícono Sparkles (centrado, blanco)
```

### Proporciones

- **Ícono:** 50% del tamaño del contenedor
- **Margen superior:** 8% (para balance con pestaña)
- **Border radius folder:** Proporcional al tamaño
- **Stroke width ícono:** 1.5px

---

## ✅ Do's - Buenas Prácticas

✅ **Usa la variante `gradient` en fondos claros**  
✅ **Anima solo en páginas estáticas (Login, Register)**  
✅ **Usa tamaños predefinidos (`LOGO_SIZES`)**  
✅ **Mantén espacio breathing alrededor (min 16px)**  
✅ **Usa `onClick` solo cuando navega**  
✅ **Importa desde `@/brand` para consistencia**

---

## ❌ Don'ts - Evitar

❌ **No uses tamaños menores a 24px** (pierde detalle)  
❌ **No animes en Headers** (distrae)  
❌ **No modifiques los colores del gradiente**  
❌ **No apliques filtros CSS externos** (blur, saturate, etc.)  
❌ **No uses variant `white` en fondos blancos** (no se verá)  
❌ **No combines múltiples animaciones** (pulse + custom)

---

## 🔧 Personalización Avanzada

### Acceder a constantes

```tsx
import { BRAND_COLORS, LOGO_SIZES } from '@/brand';

// Usar colores en otros componentes
const myGradient = `linear-gradient(
  135deg, 
  ${BRAND_COLORS.gradient.start}, 
  ${BRAND_COLORS.gradient.end}
)`;

// Sincronizar tamaños
const buttonHeight = LOGO_SIZES.md;
```

### Extender el componente

```tsx
import { Logo, type LogoProps } from '@/brand';

// Wrapper personalizado
export const AnimatedBrandLogo: React.FC<LogoProps> = (props) => {
  return (
    <div className="custom-wrapper">
      <Logo {...props} animated />
    </div>
  );
};
```

---

## 📦 Assets Estáticos

Los assets de marca (favicon, app icons, OG images) se encuentran en:

```
src/brand/assets/
├── favicon.ico          # Favicon del sitio
├── logo-192.png         # PWA icon (192x192)
├── logo-512.png         # PWA icon (512x512)
└── og-image.png         # Social media preview
```

**Pendiente:** Generar estos assets basados en el logo final.

---

## 🔄 Historial de Versiones

### v1.0.0 (Actual) - Sparkles Icon en Folder

**Características:**
- ✅ Folder con gradiente de 3 colores
- ✅ Pestaña 3D con gradiente propio
- ✅ Sombra interna y externa
- ✅ Ícono Sparkles de lucide-react
- ✅ Proporciones balanceadas

**Versiones anteriores** (descartadas):
- ~~Opción 1: Varita Mágica~~ - Estilo muy fantástico
- ~~Opción 2: Documento/Cloud~~ - Menos distintivo

---

## 🤝 Contribuir

Al agregar nuevos elementos de marca:

1. ✅ Agregar constantes en `constants.ts`
2. ✅ Definir types en `types.ts`
3. ✅ Exportar desde `index.ts`
4. ✅ Documentar en este README
5. ✅ Mantener consistencia con branding existente

---

## 📞 Contacto

Para cambios mayores en la identidad de marca, consultar con el equipo de diseño/producto.

**Mantenido por:** Equipo de Frontend  
**Última actualización:** Marzo 2026
