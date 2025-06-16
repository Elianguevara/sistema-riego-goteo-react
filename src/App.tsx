import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/utils/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement'; // <-- Importa la nueva página

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />} >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          {/* --- AÑADIR ESTA NUEVA RUTA --- */}
          <Route path="/profile" element={<div><h1>Mi Perfil</h1><p>Esta página mostrará los detalles del usuario.</p></div>} />
          {/* Aquí podrías añadir más rutas como /farms, etc. */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;