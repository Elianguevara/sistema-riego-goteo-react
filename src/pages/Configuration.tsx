
import './Configuration.css';

const Configuration = () => {
  return (
    <div className="configuration-page">
      <div className="page-header">
        <h1>Configuración</h1>
      </div>
      <div className="config-card">
        <h3>Ajustes Generales</h3>
        <p>
          Esta sección está actualmente en desarrollo. Próximamente podrás
          configurar las preferencias de la aplicación, notificaciones y otros
          ajustes generales desde aquí.
        </p>
        <div className="placeholder-content">
          <i className="fas fa-cogs placeholder-icon"></i>
          <span>Funcionalidad en construcción</span>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
