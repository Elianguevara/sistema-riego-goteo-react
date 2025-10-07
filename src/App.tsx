// Archivo: src/App.tsx

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/utils/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { useAuthData } from './hooks/useAuthData';

// Usar React.lazy para importar dinámicamente cada página
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const FarmManagement = React.lazy(() => import('./pages/FarmManagement'));
const FarmDetail = React.lazy(() => import('./pages/FarmDetail'));
const Configuration = React.lazy(() => import('./pages/Configuration'));
const AuditLog = React.lazy(() => import('./pages/AuditLog'));
const NotificationHistory = React.lazy(() => import('./pages/NotificationHistory'));
const MyTasks = React.lazy(() => import('./pages/operator/MyTasks'));
const TaskManagement = React.lazy(() => import('./pages/analyst/TaskManagement'));
const RegisterIrrigation = React.lazy(() => import('./pages/operator/RegisterIrrigation'));
const RegisterFertilization = React.lazy(() => import('./pages/operator/RegisterFertilization'));
const RegisterMaintenance = React.lazy(() => import('./pages/operator/RegisterMaintenance'));
const OperatorDashboard = React.lazy(() => import('./pages/operator/OperatorDashboard'));
const OperationLogbook = React.lazy(() => import('./pages/operator/OperationLogbook'));
const PrecipitationAnalysis = React.lazy(() => import('./pages/analyst/PrecipitationAnalysis'));
// Importamos el nuevo dashboard del analista
const AnalystDashboard = React.lazy(() => import('./pages/analyst/AnalystDashboard'));


// Componente de redirección para la página de inicio según el rol
const DashboardRedirect = () => {
    const authData = useAuthData();
    if (!authData) return null;
    
    // Lógica de redirección actualizada para incluir al analista
    if (authData.role === 'OPERARIO') {
        return <Navigate to="/operator/dashboard" replace />;
    }
    if (authData.role === 'ANALISTA') {
        return <Navigate to="/analyst/dashboard" replace />;
    }
    // El rol ADMIN (y cualquier otro por defecto) irá al dashboard general
    return <Dashboard />;
};

// Componente simple para mostrar mientras se carga el código de una página
const PageLoader = () => <div>Cargando página...</div>;

function App() {
  return (
    // Envolver todas las rutas dentro de un componente Suspense
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/" element={<AdminLayout />}>
          
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          
          {/* --- DASHBOARD DEL OPERARIO --- */}
          <Route
            path="operator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* --- NUEVA RUTA: DASHBOARD DEL ANALISTA --- */}
           <Route
            path="analyst/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ANALISTA']}>
                <AnalystDashboard />
              </ProtectedRoute>
            }
          />

          {/* --- Rutas del Operario --- */}
          <Route
            path="tasks"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="operator/irrigation"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <RegisterIrrigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="operator/fertilization"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <RegisterFertilization />
              </ProtectedRoute>
            }
          />
          <Route
            path="operator/maintenance"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <RegisterMaintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="operator/logbook"
            element={
              <ProtectedRoute allowedRoles={['OPERARIO']}>
                <OperationLogbook />
              </ProtectedRoute>
            }
          />

          {/* Rutas exclusivas para el Analista */}
          <Route
            path="analyst/tasks"
            element={
              <ProtectedRoute allowedRoles={['ANALISTA']}>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="analyst/precipitation"
            element={
              <ProtectedRoute allowedRoles={['ANALISTA']}>
                <PrecipitationAnalysis />
              </ProtectedRoute>
            }
          />
          
          {/* El resto de las rutas con permisos actualizados */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="farms"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
                <FarmManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="farms/:farmId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
                <FarmDetail />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OPERARIO', 'ANALISTA']}>
                <NotificationHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="config"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
                <Configuration />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
