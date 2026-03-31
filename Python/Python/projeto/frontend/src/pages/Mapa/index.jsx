import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPontos } from '../../services/mapaService';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';

const STATUS_COLORS = {
  pendente: '#F9A825',
  em_analise: '#1565C0',
  em_atendimento: '#EF6C00',
  resolvida: '#2E7D32',
  cancelada: '#9E9E9E',
  invalida: '#9E9E9E'
};

// Centro do Ceará como padrão
const CE_CENTER = [-5.2, -39.3];
const CE_ZOOM = 7;

function AutoLocate() {
  const map = useMap();
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 13, { animate: false });
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);
  return null;
}

function LocationButton() {
  const map = useMap();
  function go() {
    navigator.geolocation.getCurrentPosition(pos =>
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 15)
    );
  }
  return (
    <button
      onClick={go}
      className="absolute bottom-24 right-4 z-[1000] bg-white rounded-full p-3 shadow-lg hover:bg-gray-50"
      title="Minha localização"
    >
      🎯
    </button>
  );
}

export default function Mapa() {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDias, setFiltroDias] = useState('30');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroStatus) params.status = filtroStatus;
      if (filtroDias) params.dias = filtroDias;
      const data = await getPontos(params);
      setPontos(data.pontos || []);
    } catch (_) {
      setPontos([]);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, filtroDias]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Filtros */}
      <div className="bg-white border-b shadow-sm px-4 py-2 flex flex-wrap gap-2 items-center z-10">
        <span className="text-sm text-gray-500 font-medium">Filtros:</span>
        {[
          { value: '', label: 'Todos' },
          { value: 'pendente', label: 'Pendentes' },
          { value: 'em_analise', label: 'Em Análise' },
          { value: 'em_atendimento', label: 'Em Atendimento' },
          { value: 'resolvida', label: 'Resolvidas' }
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFiltroStatus(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filtroStatus === opt.value ? 'bg-verde text-white border-verde' : 'bg-white text-gray-600 border-gray-300 hover:border-verde hover:text-verde'}`}
          >
            {opt.label}
          </button>
        ))}
        <select
          value={filtroDias}
          onChange={e => setFiltroDias(e.target.value)}
          className="ml-auto text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-verde"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="">Todos os tempos</option>
        </select>
        {loading && <span className="text-xs text-gray-400">Carregando...</span>}
        <span className="text-xs text-gray-400">{pontos.length} ponto(s)</span>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <MapContainer center={CE_CENTER} zoom={CE_ZOOM} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
          />
          <AutoLocate />
          <LocationButton />
          {pontos.map(p => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={10}
              fillColor={STATUS_COLORS[p.status] || '#9E9E9E'}
              color={STATUS_COLORS[p.status] || '#9E9E9E'}
              fillOpacity={0.8}
              weight={2}
            >
              <Popup minWidth={240}>
                <div className="text-sm">
                  {p.foto_capa && <img src={p.foto_capa} alt="foto" className="w-full h-32 object-cover rounded mb-2" />}
                  <div className="mb-1"><StatusBadge status={p.status} /></div>
                  <p className="font-medium text-gray-700 mb-1">{p.bairro}</p>
                  <p className="text-gray-500 text-xs mb-2">{p.descricao_curta}</p>
                  <p className="text-gray-400 text-xs">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* FAB Denunciar */}
        <button
          onClick={() => isAuthenticated && user?.perfil === 'cidadao' ? navigate('/denuncia/nova') : navigate('/login?redirect=/denuncia/nova')}
          className="absolute bottom-6 right-4 z-[1000] bg-verde text-white rounded-full px-5 py-3 shadow-xl flex items-center gap-2 hover:bg-verde-dark transition-colors font-semibold"
        >
          <span className="text-xl">+</span> Denunciar
        </button>

        {/* Legenda */}
        <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg p-3 text-xs space-y-1">
          {Object.entries(STATUS_COLORS).filter(([k]) => !['cancelada','invalida'].includes(k)).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
              <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
