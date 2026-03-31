import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarDenuncias } from '../../services/denunciaService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MinhasDenuncias() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState(null);

  async function carregar(p = 1) {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (filtro) params.status = filtro;
      const data = await listarDenuncias(params);
      setDenuncias(data.data);
      setPagination(data.pagination);
    } catch (_) {}
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(1); setPagina(1); }, [filtro]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Denúncias</h1>
            <p className="text-gray-500 text-sm">Acompanhe o status das suas ocorrências.</p>
          </div>
          <Link to="/denuncia/nova" className="bg-verde text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-verde-dark transition-colors">
            + Nova
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { value: '', label: 'Todas' },
            { value: 'pendente', label: 'Pendentes' },
            { value: 'em_analise,em_atendimento', label: 'Em Andamento' },
            { value: 'resolvida', label: 'Resolvidas' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFiltro(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filtro === opt.value ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-300 hover:border-verde'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : denuncias.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🗑️</div>
            <p className="text-gray-500 mb-6">Você ainda não registrou nenhuma denúncia.</p>
            <Link to="/denuncia/nova" className="bg-verde text-white px-6 py-3 rounded-xl font-medium hover:bg-verde-dark transition-colors">
              Fazer primeira denúncia
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {denuncias.map(d => (
                <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
                  {d.foto_capa ? (
                    <img src={d.foto_capa} alt="foto" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🗑️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-verde">{d.protocolo}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{d.bairro}</p>
                    <p className="text-xs text-gray-400">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button disabled={pagina === 1} onClick={() => { setPagina(p => p - 1); carregar(pagina - 1); }} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">
                  ← Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">{pagina} / {pagination.totalPages}</span>
                <button disabled={pagina >= pagination.totalPages} onClick={() => { setPagina(p => p + 1); carregar(pagina + 1); }} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50">
                  Próximo →
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
