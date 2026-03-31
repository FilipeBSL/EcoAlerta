import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch (_) {}
    logout();
    navigate('/');
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-verde text-xl">
          <span className="text-2xl">🌿</span> EcoAlerta
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-verde transition-colors">Início</Link>
          <Link to="/mapa" className="hover:text-verde transition-colors">Mapa</Link>
          {isAuthenticated && user?.perfil === 'cidadao' && (
            <Link to="/minhas-denuncias" className="hover:text-verde transition-colors">Minhas Denúncias</Link>
          )}
          {isAuthenticated && (user?.perfil === 'administrador' || user?.perfil === 'equipe_limpeza') && (
            <Link to="/admin" className="hover:text-verde transition-colors">Painel Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-sm text-gray-500">{user?.nome?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-500 transition-colors">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-verde border border-verde rounded-lg px-4 py-2 hover:bg-verde hover:text-white transition-colors">
                Entrar
              </Link>
              <Link to="/cadastro" className="text-sm font-medium bg-verde text-white rounded-lg px-4 py-2 hover:bg-verde-dark transition-colors">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
