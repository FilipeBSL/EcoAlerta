import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarDenuncias } from '../../services/denunciaService';
import { getIndicadores, getBairros } from '../../services/mapaService';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

export default function Admin() {
  const [denuncias, setDenuncias] = useState([]);
  const [indicadores, setIndicadores] = useState(null);
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroBairro, setFiltroBairro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    getIndicadores().then(setIndicadores).catch(() => {});
    getBairros().then(d => setBairros(d.data || [])).catch(() => {});
  }, []);

  async function carregar(p = 1) {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (filtroStatus) params.status = filtroStatus;
      if (filtroBairro) params.bairro_id = filtroBairro;
      const data = await listarDenuncias(params);
      setDenuncias(data.data);
      setPagination(data.pagination);
    } catch (_) {}
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(1); setPagina(1); }, [filtroStatus, filtroBairro]);

  async function exportarCSV() {
    const params = new URLSearchParams();
    if (filtroStatus) params.set('status', filtroStatus);
    if (filtroBairro) params.set('bairro_id', filtroBairro);
    const token = localStorage.getItem('eco_token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/relatorios/exportar?${params}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ecoalerta_relatorio.csv';
    a.click();
  }

  const cards = indicadores ? [
    { label: 'Total do mês', value: indicadores.totais?.geral || 0, icon: '📊' },
    { label: 'Pendentes', value: indicadores.totais?.pendente || 0, icon: '⏳', color: 'text-yellow-600' },
    { label: 'Em Atendimento', value: indicadores.totais?.em_atendimento || 0, icon: '🚛', color: 'text-orange-600' },
    { label: 'Resolvidas', value: indicadores.totais?.resolvida || 0, icon: '✅', color: 'text-green-600' }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>

        {/* Cards de indicadores */}
        {indicadores && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className={`text-3xl font-bold ${card.color || 'text-gray-800'}`}>{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros e tabela */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <h2 className="font-semibold text-gray-700 mr-2">Ocorrências</h2>

            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-verde">
              <option value="">Todos os status</option>
              {['pendente','em_analise','em_atendimento','resolvida','cancelada','invalida'].map(s => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>

            <select value={filtroBairro} onChange={e => setFiltroBairro(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-verde">
              <option value="">Todos os bairros</option>
              {bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>

            <button onClick={exportarCSV} className="ml-auto text-sm border border-verde text-verde px-4 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
              ⬇ Exportar CSV
            </button>
          </div>

          {loading ? <LoadingSpinner /> : denuncias.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhuma denúncia encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase">
                    <th className="pb-3 pr-4">Protocolo</th>
                    <th className="pb-3 pr-4">Bairro</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Data</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {denuncias.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-verde">{d.protocolo}</td>
                      <td className="py-3 pr-4 text-gray-600">{d.bairro || '—'}</td>
                      <td className="py-3 pr-4"><StatusBadge status={d.status} /></td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3">
                        <Link to={`/admin/denuncia/${d.id}`} className="text-verde hover:underline text-xs font-medium">
                          Ver detalhes →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={pagina === 1} onClick={() => { setPagina(p => p - 1); carregar(pagina - 1); }} className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50">
                    ← Anterior
                  </button>
                  <span className="px-3 py-1.5 text-xs text-gray-500">{pagina}/{pagination.totalPages}</span>
                  <button disabled={pagina >= pagination.totalPages} onClick={() => { setPagina(p => p + 1); carregar(pagina + 1); }} className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50">
                    Próximo →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
