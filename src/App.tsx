// Archivo: src/App.tsx

import React, { Suspense } from 'react'; // 1. Importar Suspense
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login.tsx';
import ProtectedRoute from './components/utils/ProtectedRoute.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import { useAuthData } from './hooks/useAuthData.ts';

// 2. Usar React.lazy para importar dinámicamente cada página
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx'));
const UserManagement = React.lazy(() => import('./pages/UserManagement.tsx'));
const UserProfile = React.lazy(() => import('./pages/UserProfile.tsx'));
const FarmManagement = React.lazy(() => import('./pages/FarmManagement.tsx'));
const FarmDetail = React.lazy(() => import('./pages/FarmDetail.tsx'));
const Configuration = React.lazy(() => import('./pages/Configuration.tsx'));
const AuditLog = React.lazy(() => import('./pages/AuditLog.tsx'));
const NotificationHistory = React.lazy(() => import('./pages/NotificationHistory.tsx'));
const MyTasks = React.lazy(() => import('./pages/operator/MyTasks.tsx'));
const TaskManagement = React.lazy(() => import('./pages/analyst/TaskManagement.tsx'));
const RegisterIrrigation = React.lazy(() => import('./pages/operator/RegisterIrrigation.tsx'));
const RegisterFertilization = React.lazy(() => import('./pages/operator/RegisterFertilization.tsx'));
const RegisterMaintenance = React.lazy(() => import('./pages/operator/RegisterMaintenance.tsx'));
const OperationLogbook = React.lazy(() => import('./pages/operator/OperationLogbook.tsx'));


// Componente de redirección para la página de inicio según el rol
const DashboardRedirect = () => {
    const authData = useAuthData();
    if (!authData) return null;
    
    if (authData.role === 'OPERARIO') {
        return <Navigate to="/tasks" replace />;
    }
    return <Dashboard />;
};

// 3. Componente simple para mostrar mientras se carga el código de una página
const PageLoader = () => <div>Cargando página...</div>;

function App() {
  return (
    // 4. Envolver todas las rutas dentro de un componente Suspense
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

          {/* Ruta exclusiva para el Analista */}
          <Route
            path="analyst/tasks"
            element={
              <ProtectedRoute allowedRoles={['ANALISTA']}>
                <TaskManagement />
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