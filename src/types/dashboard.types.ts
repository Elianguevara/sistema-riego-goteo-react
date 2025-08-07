
export interface KpiResponse {
  totalUsers: number;
  totalFarms: number;
  activeSectors: number;
  activeAlerts: number;
}
/**
 * NUEVA INTERFAZ
 * Define la estructura de la respuesta del endpoint de estadísticas de usuarios.
 */
export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    ADMIN: number;
    ANALISTA: number;
    OPERARIO: number;
  };
}