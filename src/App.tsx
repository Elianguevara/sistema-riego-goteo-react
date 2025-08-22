// Archivo: src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/utils/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import FarmManagement from './pages/FarmManagement';
import FarmDetail from './pages/FarmDetail';
import Configuration from './pages/Configuration';
import AuditLog from './pages/AuditLog';
import NotificationHistory from './pages/NotificationHistory';
import MyTasks from './pages/operator/MyTasks';
// 1. Importar la nueva página de gestión de tareas del analista
import TaskManagement from './pages/analyst/TaskManagement';
import { useAuthData } from './hooks/useAuthData';

// Componente de redirección para la página de inicio según el rol
const DashboardRedirect = () => {
    const authData = useAuthData();

    // Mientras el hook determina el rol, no renderizamos nada para evitar errores.
    if (!authData) {
        return null; 
    }
    
    if (authData.role === 'OPERARIO') {
        return <Navigate to="/tasks" replace />;
    }
    // Los administradores y analistas son redirigidos al Dashboard principal.
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
        
        {/* Ruta exclusiva para el Operario */}
        <Route 
          path="tasks"
          element={
            <ProtectedRoute allowedRoles={['OPERARIO']}>
              <MyTasks />
            </ProtectedRoute>
          } 
        />

        {/* 2. Nueva ruta exclusiva para el Analista */}
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

        {/* 3. Ruta de notificaciones ahora incluye a todos los roles con acceso */}
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
