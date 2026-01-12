export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
}

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'mi-unidad', label: 'Mi Unidad', icon: '🗄️', path: '/my-drive' },
  { id: 'compartido', label: 'Compartido', icon: '👥', path: '/shared' },
  { id: 'colecciones', label: 'Colecciones Inteligentes', icon: '✨', path: '/collections' }
];
