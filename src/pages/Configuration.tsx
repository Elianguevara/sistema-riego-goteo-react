import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Leaf, Building2, Shield, Bell, FileText, CloudSun, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { configService } from '../services/configService';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

import './Configuration.css';
import type {
  AgronomicConfig,
  OrganizationConfig,
  SecurityConfig,
  NotificationConfig,
  ReportConfig,
  WeatherConfig
} from '../types/config.types';

type TabType = 'agronomic' | 'organization' | 'security' | 'notifications' | 'reports' | 'weather';

const tabs = [
  { id: 'agronomic', label: 'Agronómica', icon: <Leaf size={18} /> },
  { id: 'organization', label: 'Organización', icon: <Building2 size={18} /> },
  { id: 'security', label: 'Seguridad', icon: <Shield size={18} /> },
  { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} /> },
  { id: 'reports', label: 'Reportes', icon: <FileText size={18} /> },
  { id: 'weather', label: 'Servicio Climático', icon: <CloudSun size={18} /> },
];

// --- Sub-Components for each Form ---

function AgronomicForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'agronomic'],
    queryFn: configService.getAgronomic,
  });

  const [formData, setFormData] = useState<AgronomicConfig | null>(null);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: AgronomicConfig) => configService.updateAgronomic(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'agronomic'], updatedData);
      toast.success('Configuración agronómica guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración agronómica..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'agronomic'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Agronómica</h2>
        <p>Configuración de parámetros para el algoritmo de riego.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="config-field">
          <label>Coeficiente de Lluvia Efectiva (0.0 - 1.0)</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            required
            value={formData.effectiveRainCoefficient}
            onChange={(e) => setFormData({ ...formData, effectiveRainCoefficient: parseFloat(e.target.value) })}
          />
        </div>
        <div className="config-field">
          <label>Horas Máximas de Riego por Día (1 - 24)</label>
          <input
            type="number"
            min="1"
            max="24"
            required
            value={formData.maxIrrigationHoursPerDay}
            onChange={(e) => setFormData({ ...formData, maxIrrigationHoursPerDay: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-field">
          <label>Intervalo Mínimo entre Riegos (Horas)</label>
          <input
            type="number"
            min="1"
            required
            value={formData.minIrrigationIntervalHours}
            onChange={(e) => setFormData({ ...formData, minIrrigationIntervalHours: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-field">
          <label>Umbral de Efectividad de Precipitación (mm)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            required
            value={formData.precipitationEffectivenessThresholdMm}
            onChange={(e) => setFormData({ ...formData, precipitationEffectivenessThresholdMm: parseFloat(e.target.value) })}
          />
        </div>
        <div className="config-field">
          <label>Umbral Bajo de Reservorio (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            required
            value={formData.reservoirLowThresholdPercent}
            onChange={(e) => setFormData({ ...formData, reservoirLowThresholdPercent: parseInt(e.target.value, 10) })}
          />
        </div>
        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function OrganizationForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'organization'],
    queryFn: configService.getOrganization,
  });

  const [formData, setFormData] = useState<OrganizationConfig | null>(null);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: OrganizationConfig) => configService.updateOrganization(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'organization'], updatedData);
      toast.success('Configuración de organización guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración de organización..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'organization'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Organización</h2>
        <p>Datos generales de la organización.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="config-field">
          <label>Nombre de la Organización</label>
          <input
            type="text"
            maxLength={100}
            required
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          />
        </div>
        <div className="config-field">
          <label>Dirección</label>
          <input
            type="text"
            value={formData.organizationAddress}
            onChange={(e) => setFormData({ ...formData, organizationAddress: e.target.value })}
          />
        </div>
        <div className="config-field">
          <label>Teléfono</label>
          <input
            type="text"
            value={formData.organizationPhone}
            onChange={(e) => setFormData({ ...formData, organizationPhone: e.target.value })}
          />
        </div>
        <div className="config-field">
          <label>Correo Electrónico</label>
          <input
            type="email"
            value={formData.organizationEmail}
            onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
          />
        </div>
        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function SecurityForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'security'],
    queryFn: configService.getSecurity,
  });

  const [formData, setFormData] = useState<SecurityConfig | null>(null);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: SecurityConfig) => configService.updateSecurity(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'security'], updatedData);
      toast.success('Configuración de seguridad guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración de seguridad..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'security'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Seguridad</h2>
        <p>Políticas de acceso y contraseñas.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="config-field">
          <label>Duración de la Sesión (Horas)</label>
          <input
            type="number"
            min="1"
            max="72"
            required
            value={formData.sessionDurationHours}
            onChange={(e) => setFormData({ ...formData, sessionDurationHours: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-field">
          <label>Máximos Intentos de Login Fallidos</label>
          <input
            type="number"
            min="1"
            max="10"
            required
            value={formData.maxFailedLoginAttempts}
            onChange={(e) => setFormData({ ...formData, maxFailedLoginAttempts: parseInt(e.target.value, 10) })}
          />
        </div>
        <div className="config-field">
          <label>Longitud Mínima de Contraseña</label>
          <input
            type="number"
            min="6"
            max="32"
            required
            value={formData.passwordMinLength}
            onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="config-toggle-row">
          <div className="config-toggle-info">
            <span className="config-toggle-label">Forzar Cambio de Contraseña</span>
            <span className="config-toggle-desc">Exigir a los usuarios que cambien su contraseña en el primer inicio de sesión.</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.forcePasswordChangeOnFirstLogin}
              onChange={(e) => setFormData({ ...formData, forcePasswordChangeOnFirstLogin: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function NotificationsForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'notifications'],
    queryFn: configService.getNotifications,
  });

  const [formData, setFormData] = useState<NotificationConfig | null>(null);

  useEffect(() => {
    // Merge backend data with default channels if they are undefined
    if (data) {
      setFormData({
        globalNotificationsEnabled: data.globalNotificationsEnabled,
        channels: {
          push: { enabled: !!data.channels?.push?.enabled },
          email: { enabled: !!data.channels?.email?.enabled },
          sms: { enabled: !!data.channels?.sms?.enabled },
          ...data.channels,
        }
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: NotificationConfig) => configService.updateNotifications(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'notifications'], updatedData);
      toast.success('Configuración de notificaciones guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración de notificaciones..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'notifications'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChannelToggle = (channel: string, enabled: boolean) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: { enabled }
      }
    });
  };

  const isGlobalEnabled = formData.globalNotificationsEnabled;

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Notificaciones</h2>
        <p>Ajustes de notificaciones y canales habilitados.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">

        <div className="config-toggle-row">
          <div className="config-toggle-info">
            <span className="config-toggle-label">Activar Notificaciones Globales</span>
            <span className="config-toggle-desc">Si se desactiva, silenciará todas las notificaciones del sistema.</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.globalNotificationsEnabled}
              onChange={(e) => setFormData({ ...formData, globalNotificationsEnabled: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className={isGlobalEnabled ? '' : 'disabled-field-group'} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h4>Canales Disponibles</h4>

          <div className="config-toggle-row">
            <div className="config-toggle-info">
              <span className="config-toggle-label">Push Notifications</span>
              <span className="config-toggle-desc">Notificaciones web en el navegador.</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                disabled={!isGlobalEnabled}
                checked={formData.channels.push?.enabled || false}
                onChange={(e) => handleChannelToggle('push', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="config-toggle-row">
            <div className="config-toggle-info">
              <span className="config-toggle-label">Email</span>
              <span className="config-toggle-desc">Notificaciones enviadas por correo electrónico.</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                disabled={!isGlobalEnabled}
                checked={formData.channels.email?.enabled || false}
                onChange={(e) => handleChannelToggle('email', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="config-toggle-row">
            <div className="config-toggle-info">
              <span className="config-toggle-label">SMS</span>
              <span className="config-toggle-desc">Notificaciones enviadas por mensaje de texto.</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                disabled={!isGlobalEnabled}
                checked={formData.channels.sms?.enabled || false}
                onChange={(e) => handleChannelToggle('sms', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function ReportsForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'reports'],
    queryFn: configService.getReports,
  });

  const [formData, setFormData] = useState<ReportConfig | null>(null);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: ReportConfig) => configService.updateReports(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'reports'], updatedData);
      toast.success('Configuración de reportes guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración de reportes..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'reports'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Reportes</h2>
        <p>Configuración de almacenamiento y exportación de reportes.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="config-field">
          <label>Días de Retención de Reportes</label>
          <input
            type="number"
            min="1"
            max="365"
            required
            value={formData.reportRetentionDays}
            onChange={(e) => setFormData({ ...formData, reportRetentionDays: parseInt(e.target.value, 10) })}
          />
          <span className="config-field-hint">Tiempo que los reportes generados se guardarán en el servidor.</span>
        </div>
        <div className="config-field">
          <label>Rango Máximo de Fechas (Meses)</label>
          <input
            type="number"
            min="1"
            max="24"
            required
            value={formData.maxReportDateRangeMonths}
            onChange={(e) => setFormData({ ...formData, maxReportDateRangeMonths: parseInt(e.target.value, 10) })}
          />
          <span className="config-field-hint">Período máximo permitido al consultar históricos.</span>
        </div>
        <div className="config-field">
          <label>Formato de Reporte por Defecto</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="defaultReportFormat"
                value="PDF"
                checked={formData.defaultReportFormat === 'PDF'}
                onChange={(e) => setFormData({ ...formData, defaultReportFormat: e.target.value })}
              />
              PDF
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="defaultReportFormat"
                value="CSV"
                checked={formData.defaultReportFormat === 'CSV'}
                onChange={(e) => setFormData({ ...formData, defaultReportFormat: e.target.value })}
              />
              CSV
            </label>
          </div>
        </div>

        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function WeatherForm() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['config', 'weather'],
    queryFn: configService.getWeather,
  });

  const [formData, setFormData] = useState<WeatherConfig | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  // Guardamos si el apiKey original contenía asteriscos (enmascarada via endpoint)
  const isOriginalMasked = data?.weatherApiKey?.startsWith('•');

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (newData: WeatherConfig) => configService.updateWeather(newData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['config', 'weather'], updatedData);
      toast.success('Configuración de clima guardada.');
    },
    onError: (err: Error) => toast.error(err.message || 'Error al guardar'),
  });

  if (isLoading) return <LoadingState message="Cargando configuración de clima..." />;
  if (error) return <ErrorState message="Error al cargar la configuración" onRetry={() => queryClient.invalidateQueries({ queryKey: ['config', 'weather'] })} />;
  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload. Si el apikey esta enmascarado y no ha sido modificado, lo enviamos vacío para que no lo altere
    const payload = { ...formData };
    if (isOriginalMasked && data && payload.weatherApiKey === data.weatherApiKey) {
      payload.weatherApiKey = ""; // String vacío si no ha tocado una password enmascarada
    }

    mutation.mutate(payload);
  };

  const isWeatherEnabled = formData.weatherServiceEnabled;

  return (
    <div className="config-form">
      <div className="config-panel-header">
        <h2>Servicio Climático</h2>
        <p>Ajustes de la API del proveedor climático.</p>
      </div>
      <form onSubmit={handleSubmit} className="config-form">

        <div className="config-toggle-row">
          <div className="config-toggle-info">
            <span className="config-toggle-label">Habilitar Servicio Climático</span>
            <span className="config-toggle-desc">Obtener datos de precipitaciones automáticamente.</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.weatherServiceEnabled}
              onChange={(e) => setFormData({ ...formData, weatherServiceEnabled: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className={isWeatherEnabled ? '' : 'disabled-field-group'} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <div className="config-field">
            <label>Proveedor Climático</label>
            <input
              type="text"
              required={isWeatherEnabled}
              disabled={!isWeatherEnabled}
              value={formData.weatherProvider}
              onChange={(e) => setFormData({ ...formData, weatherProvider: e.target.value })}
            />
          </div>

          <div className="config-field">
            <label>API Key</label>
            <div className="password-input-wrapper">
              <input
                type={showApiKey ? 'text' : 'password'}
                required={isWeatherEnabled}
                disabled={!isWeatherEnabled}
                value={formData.weatherApiKey}
                onChange={(e) => setFormData({ ...formData, weatherApiKey: e.target.value })}
                placeholder={isOriginalMasked ? "••••••••" : "Tu API Key"}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={!isWeatherEnabled}
                title={showApiKey ? "Ocultar" : "Mostrar"}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="config-field-hint">
              Si el campo muestra asteriscos u oculto y no se modifica, mantendrá su valor actual seguro.
            </span>
          </div>

          <div className="config-field">
            <label>Intervalo de Actualización (Minutos)</label>
            <input
              type="number"
              min="5"
              max="1440"
              required={isWeatherEnabled}
              disabled={!isWeatherEnabled}
              value={formData.weatherUpdateIntervalMinutes}
              onChange={(e) => setFormData({ ...formData, weatherUpdateIntervalMinutes: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>

        <button type="submit" className="config-save-btn" disabled={mutation.isPending}>
          <Save size={18} /> {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

// --- Main Page Component ---

export default function Configuration() {
  const [activeTab, setActiveTab] = useState<TabType>('agronomic');

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'agronomic': return <AgronomicForm />;
      case 'organization': return <OrganizationForm />;
      case 'security': return <SecurityForm />;
      case 'notifications': return <NotificationsForm />;
      case 'reports': return <ReportsForm />;
      case 'weather': return <WeatherForm />;
      default: return null;
    }
  };

  return (
    <div className="configuration-page">
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Administra los parámetros generales, de seguridad y del sistema de riego."
      />

      <div className="config-layout">
        <div className="config-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`config-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="config-panel">
          {renderActiveForm()}
        </div>
      </div>
    </div>
  );
}
