# Logo Component - CloudDocs Copilot

Este directorio contiene el diseño final del logo de la aplicación.

## Diseño Final: Sparkles Icon en Folder ⭐

**Archivo:** `Logo.final.tsx` y `Logo.module.final.css`

### Descripción

Logo corporativo que combina un ícono **Sparkles** de lucide-react sobre un **folder de documento** con gradiente vibrante, representando visualmente la gestión documental inteligente con IA.

### Características de Diseño

**Elementos visuales:**
- 📁 **Folder base**: Forma de carpeta de documento con bordes redondeados
- 🎨 **Pestaña 3D**: Tab superior con gradiente propio para efecto tridimensional
- ✨ **Ícono Sparkles**: Símbolo de IA/inteligencia, centrado en color blanco
- 🌈 **Gradiente vibrante**: 3 colores (Indigo → Purple → Pink)
- 💫 **Sombras**: Interna y externa para profundidad

**Paleta de colores:**
- Gradiente principal: `#6366f1` (Indigo) → `#8b5cf6` (Purple) → `#d946ef` (Pink)
- Gradiente pestaña: `#7c3aed` (Purple) → `#6366f1` (Indigo)
- Ícono: `#ffffff` (Blanco) con strokeWidth 1.5

### Props Interface

```typescript
interface LogoProps {
  size?: number;              // Tamaño del contenedor (default: 40)
  variant?: 'default' | 'white' | 'gradient';  // default: 'gradient'
  className?: string;         // Clases CSS adicionales
  onClick?: () => void;       // Handler para clicks
  animated?: boolean;         // Activar animación pulse (default: false)
}
```

### Estilos CSS

**Animaciones:**
- `pulse`: Scale de 1 a 1.05 en 2s (infinite)
- Hover: Scale 1.05 con transición suave

**Layout:**
- Contenedor: `position: relative` con flex centrado
- SVG folder: `position: absolute` como fondo
- Icon wrapper: `z-index: 2` sobre el folder

### Implementación en la Aplicación

El logo está implementado en 3 ubicaciones principales:

#### 1. LoginForm (`/components/LoginForm/LoginForm.tsx`)
```tsx
<Logo size={56} variant="gradient" animated />
```
- Tamaño grande (56px) para impacto visual
- Con animación pulse para dinamismo

#### 2. RegisterForm (`/components/RegisterForm.tsx`)
```tsx
<Logo size={56} variant="gradient" animated />
```
- Consistente con LoginForm
- Refuerza la identidad de marca

#### 3. Header (`/components/Header.tsx`)
```tsx
<Logo 
  size={36} 
  variant="gradient" 
  onClick={() => navigate('/dashboard')} 
/>
```
- Tamaño compacto (36px) para navegación
- Clickeable, navega al dashboard
- Sin animación para mantener la barra estática

### Características Técnicas

**SVG Structure:**
- ViewBox: `0 0 56 56` (escalable)
- Filter: `folder-shadow` con gaussian blur
- Gradientes: 2 definiciones (main y tab)
- Path principal: Folder con border-radius
- Path secundario: Tab con opacity y gradiente propio
- Sombra interna: Black opacity 0.05

**Dependencias:**
- `lucide-react`: Para el componente `<Sparkles>`
- React 19+
- TypeScript 5.x

### Cómo Usar

Para implementar el logo en un nuevo componente:

```tsx
import { Logo } from '../components/Logo';

// Básico
<Logo />

// Personalizado
<Logo 
  size={48} 
  variant="gradient" 
  animated 
  onClick={handleClick}
  className="my-custom-class"
/>
```

### Variantes Disponibles

1. **gradient** (default): Folder con gradiente vibrante de 3 colores
2. **white**: Folder en blanco para fondos oscuros
3. **default**: Folder en color sólido indigo

---

## Historial de Desarrollo

**Versiones previas eliminadas:**
- ~~Opción 1: Varita Mágica~~ (estilo muy fantástico)
- ~~Opción 2: Documento/Cloud~~ (menos distintivo)

**Diseño final seleccionado:** Sparkles Icon en Folder
- ✅ Mayor relación visual con gestión documental (folder)
- ✅ Limpio y profesional
- ✅ Gradiente vibrante y moderno
- ✅ Símbolo claro de IA (sparkles)
- ✅ Efecto 3D sutil y elegante
