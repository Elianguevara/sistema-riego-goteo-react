// Archivo: src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login.tsx';
import ProtectedRoute from './components/utils/ProtectedRoute.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import UserManagement from './pages/UserManagement.tsx';
import UserProfile from './pages/UserProfile.tsx';
import FarmManagement from './pages/FarmManagement.tsx';
import FarmDetail from './pages/FarmDetail.tsx';
import Configuration from './pages/Configuration.tsx';
import AuditLog from './pages/AuditLog.tsx';
import NotificationHistory from './pages/NotificationHistory.tsx';
import MyTasks from './pages/operator/MyTasks.tsx';
import TaskManagement from './pages/analyst/TaskManagement.tsx';
import { useAuthData } from './hooks/useAuthData.ts';
import RegisterIrrigation from './pages/operator/RegisterIrrigation.tsx';
import RegisterFertilization from './pages/operator/RegisterFertilization.tsx';
import RegisterMaintenance from './pages/operator/RegisterMaintenance.tsx';
import OperationLogbook from './pages/operator/OperationLogbook.tsx';


// Componente de redirección para la página de inicio según el rol
const DashboardRedirect = () => {
    const authData = useAuthData();

    if (!authData) {
        return null;
    }
    
    if (authData.role === 'OPERARIO') {
        return <Navigate to="/tasks" replace />;
    }
    return <Dashboard />;
};

function App() {
  return (
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
  );
}

export default App;

