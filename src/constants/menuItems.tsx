import React from 'react';
import { BarChart3, Search, HardDrive, Users, Sparkles, Bell, Mail, Trash2 } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  isAiFeature?: boolean; // Para identificar features de IA
}

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, path: '/dashboard' },
  { id: 'search', label: 'Buscar', icon: <Search size={18} />, path: '/search' },
  { id: 'mi-unidad', label: 'Mi Unidad', icon: <HardDrive size={18} />, path: '/my-drive' },
  { id: 'compartido', label: 'Compartido', icon: <Users size={18} />, path: '/shared' },
  { id: 'colecciones', label: 'Colecciones Inteligentes', icon: <Sparkles size={18} />, path: '/collections', isAiFeature: true },
  { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} />, path: '/notifications' },
  { id: 'invitations', label: 'Invitaciones', icon: <Mail size={18} />, path: '/invitations' },
  { id: 'trash', label: 'Papelera', icon: <Trash2 size={18} />, path: '/trash' }
];
