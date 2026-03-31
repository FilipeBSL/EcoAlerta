import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.senha !== form.confirmar) { setError('As senhas não coincidem.'); return; }
    if (form.senha.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { nome: form.nome, email: form.email, senha: form.senha });
      login(res.data.token, res.data.user);
      navigate('/mapa', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erro ao criar conta.');
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
          <p className="text-green-200 text-lg">Junte-se a quem cuida da cidade.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Crie sua conta</h2>
          <p className="text-gray-500 mb-8 text-sm">É rápido e gratuito.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

            {[
              { name: 'nome', label: 'Nome completo', type: 'text', placeholder: 'João da Silva' },
              { name: 'email', label: 'E-mail', type: 'email', placeholder: 'joao@email.com' },
              { name: 'senha', label: 'Senha', type: 'password', placeholder: '••••••••' },
              { name: 'confirmar', label: 'Confirmar senha', type: 'password', placeholder: '••••••••' }
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type} required
                  value={form[field.name]}
                  onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-verde"
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="w-full bg-verde text-white font-semibold py-3 rounded-xl hover:bg-verde-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-verde font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
