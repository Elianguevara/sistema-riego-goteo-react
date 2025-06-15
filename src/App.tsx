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

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} /> {/* <-- Añade la nueva ruta */}
          {/* Aquí podrías añadir más rutas como /farms, etc. */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/Login" />} />
    </Routes>
  );
}

export default App;