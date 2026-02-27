
import './Configuration.css';
import { Settings } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

const Configuration = () => {
  return (
    <div className="configuration-page">
      <PageHeader title="Configuración" />
      <div className="config-card">
        <h3>Ajustes Generales</h3>
        <p>
          Esta sección está actualmente en desarrollo. Próximamente podrás
          configurar las preferencias de la aplicación, notificaciones y otros
          ajustes generales desde aquí.
        </p>
        <div className="placeholder-content">
          <Settings size={48} className="placeholder-icon" />
          <span>Funcionalidad en construcción</span>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
