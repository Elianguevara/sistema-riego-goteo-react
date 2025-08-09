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
import NotificationHistory from './pages/NotificationHistory'; // Nueva página

function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* TODAS LAS RUTAS PROTEGIDAS VIVEN DENTRO DE UN ÚNICO LAYOUT */}
      <Route path="/" element={<AdminLayout />}>
        
        <Route 
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
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

        {/* NUEVA RUTA DE NOTIFICACIONES */}
        <Route 
          path="notifications" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
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
