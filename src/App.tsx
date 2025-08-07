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
import AuditLog from './pages/AuditLog'; // Importar el componente AuditLog

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* 2. Modificar la ruta protegida para que solo el ADMIN pueda ver la auditoría */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />} >
        <Route element={<AdminLayout />}>
          <Route path="/audit" element={<AuditLog />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']} />} >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<UserProfile />} /> 
          <Route path="/farms" element={<FarmManagement />} /> 
          <Route path="/farms/:farmId" element={<FarmDetail />} />
          <Route path="/config" element={<Configuration />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
