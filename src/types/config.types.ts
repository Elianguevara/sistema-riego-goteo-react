export interface AgronomicConfig {
  effectiveRainCoefficient: number;       // Float 0.0–1.0
  maxIrrigationHoursPerDay: number;       // Int 1–24
  minIrrigationIntervalHours: number;     // Int min 1
  precipitationEffectivenessThresholdMm: number; // Float min 0.0
  reservoirLowThresholdPercent: number;   // Int 0–100
}

export interface OrganizationConfig {
  organizationName: string;    // requerido, max 100
  organizationAddress: string;
  organizationPhone: string;
  organizationEmail: string;
}

export interface SecurityConfig {
  sessionDurationHours: number;           // Int 1–72
  maxFailedLoginAttempts: number;         // Int 1–10
  passwordMinLength: number;              // Int 6–32
  forcePasswordChangeOnFirstLogin: boolean;
}

export interface NotificationConfig {
  globalNotificationsEnabled: boolean;
  channels: {
    push?: { enabled: boolean };
    email?: { enabled: boolean };
    sms?: { enabled: boolean };
    [key: string]: { enabled: boolean } | undefined;
  };
}

export interface ReportConfig {
  reportRetentionDays: number;      // Int 1–365
  maxReportDateRangeMonths: number; // Int 1–24
  defaultReportFormat: string;      // "PDF" | "CSV"
}

export interface WeatherConfig {
  weatherServiceEnabled: boolean;
  weatherApiKey: string;            // El backend envía asteriscos "••••••••" si ya tiene valor
  weatherUpdateIntervalMinutes: number; // Int 5–1440
  weatherProvider: string;
}
