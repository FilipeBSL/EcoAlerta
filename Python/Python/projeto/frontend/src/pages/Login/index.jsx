import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      const redirect = params.get('redirect') || (res.data.user.perfil === 'cidadao' ? '/mapa' : '/admin');
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-verde-dark items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🌿</div>
          <h1 className="text-3xl font-bold mb-3">EcoAlerta</h1>
          <p className="text-green-200 text-lg">"Sua denúncia faz a diferença."</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Bem-vindo(a) de volta</h2>
          <p className="text-gray-500 mb-8 text-sm">Entre com sua conta para continuar.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-verde"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Senha</label>
              </div>
              <input
                type="password" required
                value={form.senha}
                onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-verde"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-verde text-white font-semibold py-3 rounded-xl hover:bg-verde-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-verde font-semibold hover:underline">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
