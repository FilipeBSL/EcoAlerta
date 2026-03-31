import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarDenuncia, atualizarStatus } from '../../services/denunciaService';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const TRANSITIONS = {
  pendente: ['em_analise', 'invalida'],
  em_analise: ['em_atendimento', 'invalida'],
  em_atendimento: ['resolvida'],
  resolvida: [],
  cancelada: [],
  invalida: []
};

const STATUS_LABELS = {
  em_analise: 'Em Análise', em_atendimento: 'Em Atendimento',
  resolvida: 'Resolvida', invalida: 'Inválida', cancelada: 'Cancelada', pendente: 'Pendente'
};

export default function DenunciaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [denuncia, setDenuncia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novoStatus, setNovoStatus] = useState('');
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function carregar() {
    setLoading(true);
    try {
      const data = await buscarDenuncia(id);
      setDenuncia(data);
    } catch (_) { navigate('/admin'); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    if (!novoStatus) { setError('Selecione um status.'); return; }
    setSaving(true); setError('');
    try {
      await atualizarStatus(id, { status: novoStatus, comentario });
      setSuccess('Status atualizado com sucesso!');
      setNovoStatus(''); setComentario('');
      carregar();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erro ao atualizar.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><LoadingSpinner /></div>;
  if (!denuncia) return null;

  const opcoes = TRANSITIONS[denuncia.status] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/admin')} className="text-sm text-gray-500 hover:text-verde mb-4 flex items-center gap-1">
          ← Voltar ao painel
        </button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800 font-mono">{denuncia.protocolo}</h1>
          <StatusBadge status={denuncia.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Fotos */}
            {denuncia.fotos?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Fotos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {denuncia.fotos.map(f => (
                    <img key={f.id} src={f.url} alt="foto" className="w-full aspect-square object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Detalhes */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Detalhes</h3>
              <p className="text-sm text-gray-600 mb-3">{denuncia.descricao}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>📍 {denuncia.bairro?.nome} {denuncia.endereco_texto ? `— ${denuncia.endereco_texto}` : ''}</p>
                <p>🗓 Registrado em {new Date(denuncia.criado_em).toLocaleString('pt-BR')}</p>
                {denuncia.resolvido_em && <p>✅ Resolvido em {new Date(denuncia.resolvido_em).toLocaleString('pt-BR')}</p>}
                <p>📍 Lat: {denuncia.latitude}, Lng: {denuncia.longitude}</p>
              </div>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Histórico</h3>
              <div className="space-y-3">
                {denuncia.historico?.map(h => (
                  <div key={h.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-verde mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={h.status_novo} />
                        <span className="text-xs text-gray-400">{new Date(h.criado_em).toLocaleString('pt-BR')}</span>
                      </div>
                      {h.comentario && <p className="text-gray-500 text-xs mt-1">{h.comentario}</p>}
                      <p className="text-gray-400 text-xs">por {h.usuario?.nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Atualizar status */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 sticky top-20">
              <h3 className="font-semibold text-gray-700 mb-4 text-sm">Atualizar Status</h3>

              {opcoes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Estado final — sem transições disponíveis.</p>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-3">
                  {error && <p className="text-red-600 text-xs">{error}</p>}
                  {success && <p className="text-green-600 text-xs">{success}</p>}

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Novo status</label>
                    <select value={novoStatus} onChange={e => setNovoStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-verde">
                      <option value="">Selecionar...</option>
                      {opcoes.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Comentário (opcional)</label>
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                      rows={3} placeholder="Informe detalhes ao cidadão..."
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-verde" />
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full bg-verde text-white py-2.5 rounded-xl font-medium text-sm hover:bg-verde-dark transition-colors disabled:opacity-60">
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
