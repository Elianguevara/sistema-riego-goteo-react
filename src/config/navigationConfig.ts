/**
 * Configuración de navegación lateral — src/config/navigationConfig.ts
 *
 * Dato puro: sin JSX, sin hooks, sin lógica de routing.
 * Diseñado para reemplazar el switch/case de AdminLayout.tsx (fase posterior).
 * Actualmente NO está importado en ningún archivo existente.
 *
 * Si un nombre de ícono da error de compilación al activar este archivo,
 * reemplazarlo por cualquier otro LucideIcon equivalente.
 */

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ListChecks,
  Droplet,
  FlaskConical,
  Wrench,
  BookOpen,
  Bell,
  TrendingUp,
  CalendarCheck,
  CloudRain,
  Sprout,
  FileBarChart2,
  Users,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = 'OPERARIO' | 'ANALISTA' | 'ADMIN';

export type NavItem = {
  /** Ruta destino del Link */
  to: string;
  /** Etiqueta visible en el sidebar */
  label: string;
  /** Componente de ícono Lucide */
  icon: LucideIcon;
  /**
   * Estrategia para calcular el estado activo:
   * - 'exact'      → location.pathname === to
   * - 'startsWith' → location.pathname.startsWith(to)
   */
  match: 'exact' | 'startsWith';
};

// ── Configuración por rol ─────────────────────────────────────────────────────

export const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  OPERARIO: [
    { to: '/operator/dashboard',     label: 'Panel Principal', icon: LayoutDashboard, match: 'exact' },
    { to: '/tasks',                  label: 'Mis Tareas',      icon: ListChecks,      match: 'startsWith' },
    { to: '/operator/irrigation',    label: 'Registrar Riego', icon: Droplet,         match: 'exact' },
    { to: '/operator/fertilization', label: 'Fertilización',   icon: FlaskConical,    match: 'exact' },
    { to: '/operator/maintenance',   label: 'Mantenimiento',   icon: Wrench,          match: 'exact' },
    { to: '/operator/logbook',       label: 'Bitácora',        icon: BookOpen,        match: 'exact' },
    { to: '/notifications',          label: 'Notificaciones',  icon: Bell,            match: 'exact' },
  ],

  ANALISTA: [
    { to: '/analyst/dashboard',            label: 'Dashboard',      icon: TrendingUp,    match: 'exact' },
    { to: '/analyst/tasks',                label: 'Gestión Tareas', icon: CalendarCheck, match: 'startsWith' },
    { to: '/analyst/irrigation-analysis',  label: 'Análisis Riego', icon: Droplet,       match: 'startsWith' },
    { to: '/analyst/precipitation',        label: 'Lluvias',        icon: CloudRain,     match: 'startsWith' },
    { to: '/farms',                        label: 'Gestión Fincas', icon: Sprout,        match: 'startsWith' },
    { to: '/analyst/reports',              label: 'Reportes',       icon: FileBarChart2, match: 'startsWith' },
    { to: '/notifications',                label: 'Notificaciones', icon: Bell,          match: 'exact' },
  ],

  ADMIN: [
    { to: '/dashboard',     label: 'Principal',      icon: LayoutDashboard,  match: 'exact' },
    { to: '/users',         label: 'Usuarios',       icon: Users,            match: 'exact' },
    { to: '/farms',         label: 'Fincas',         icon: MapPin,           match: 'startsWith' },
    { to: '/audit',         label: 'Auditoría',      icon: ShieldCheck,      match: 'exact' },
    { to: '/notifications', label: 'Notificaciones', icon: Bell,             match: 'exact' },
    { to: '/config',        label: 'Configuración',  icon: SlidersHorizontal,match: 'exact' },
  ],
};

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Devuelve los ítems de navegación para un rol dado.
 * Retorna ADMIN como fallback si el rol es desconocido o undefined.
 */
export function getNavItems(role: string | undefined): NavItem[] {
  if (!role) return NAV_CONFIG.ADMIN;
  return NAV_CONFIG[role as UserRole] ?? NAV_CONFIG.ADMIN;
}
