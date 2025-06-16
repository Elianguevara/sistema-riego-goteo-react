import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/utils/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile'; // <-- 1. Importa el nuevo componente

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ANALISTA', 'OPERARIO']} />} >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          {/* 2. Reemplaza el placeholder por el componente UserProfile */}
          <Route path="/profile" element={<UserProfile />} /> 
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;