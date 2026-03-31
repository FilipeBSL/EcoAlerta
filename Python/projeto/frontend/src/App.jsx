import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Mapa from './pages/Mapa';
import NovaDenuncia from './pages/NovaDenuncia';
import MinhasDenuncias from './pages/MinhasDenuncias';
import Admin from './pages/Admin';
import DenunciaDetail from './pages/Admin/DenunciaDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/denuncia/nova" element={
            <ProtectedRoute perfis={['cidadao']}>
              <NovaDenuncia />
            </ProtectedRoute>
          } />
          <Route path="/minhas-denuncias" element={
            <ProtectedRoute perfis={['cidadao']}>
              <MinhasDenuncias />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute perfis={['administrador', 'equipe_limpeza']}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/admin/denuncia/:id" element={
            <ProtectedRoute perfis={['administrador', 'equipe_limpeza']}>
              <DenunciaDetail />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
