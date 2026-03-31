import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { criarDenuncia } from '../../services/denunciaService';
import Header from '../../components/Header';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const CE_CENTER = [-5.2, -39.3];

// Move o mapa quando as coordenadas mudam
function MapSync({ lat, lng, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 16);
  }, [trigger]);
  return null;
}

// Clique no mapa define a posição
function MapClickHandler({ onLocate }) {
  useMapEvents({ click(e) { onLocate(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Geocodificação reversa: coordenadas → endereço
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`
    );
    const data = await res.json();
    if (data && data.display_name) return data.display_name;
  } catch (_) {}
  return '';
}

// Busca de endereço com autocomplete: texto → lista de sugestões
// Usa Nominatim + Photon (Komoot) para melhor precisão de números
async function geocodeSearch(query) {
  try {
    const [nominatimRes, photonRes] = await Promise.allSettled([
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Ceará, Brasil')}&limit=5&countrycodes=br&addressdetails=1&accept-language=pt-BR`
      ).then(r => r.json()),
      fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' Ceará Brasil')}&lang=pt&limit=5&bbox=-41.5,-7.8,-36.5,-2.5`
      ).then(r => r.json()),
    ]);

    const nominatimResults = nominatimRes.status === 'fulfilled' ? (nominatimRes.value || []) : [];

    const photonFeatures = photonRes.status === 'fulfilled' ? (photonRes.value?.features || []) : [];
    const photonConverted = photonFeatures.map((f, i) => {
      const p = f.properties;
      const streetPart = p.street && p.housenumber
        ? `${p.street}, ${p.housenumber}`
        : (p.street || p.name || '');
      const parts = [
        streetPart,
        p.district || p.suburb,
        p.city || p.town || p.village,
        p.state,
        'Brasil',
      ].filter(Boolean);
      return {
        place_id: `photon_${p.osm_id || i}`,
        lat: String(f.geometry.coordinates[1]),
        lon: String(f.geometry.coordinates[0]),
        display_name: parts.join(', '),
      };
    });

    // Junta resultados, removendo duplicatas por proximidade (~50 m)
    const combined = [...nominatimResults];
    for (const ph of photonConverted) {
      const isDup = combined.some(
        n =>
          Math.abs(parseFloat(n.lat) - parseFloat(ph.lat)) < 0.0005 &&
          Math.abs(parseFloat(n.lon) - parseFloat(ph.lon)) < 0.0005
      );
      if (!isDup) combined.push(ph);
    }

    return combined.slice(0, 6);
  } catch (_) {
    return [];
  }
}

const STEPS = ['Localização', 'Detalhes', 'Foto'];

export default function NovaDenuncia() {
  const [step, setStep] = useState(0);

  // Coordenadas selecionadas
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [flyTrigger, setFlyTrigger] = useState(0);

  // Campo de endereço com autocomplete
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  // Outros campos do formulário
  const [descricao, setDescricao] = useState('');
  const [fotos, setFotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [protocolo, setProtocolo] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();
  const addressRef = useRef();

  // Ao abrir a página: obtém GPS → preenche mapa e campo de endereço
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = pos.coords.latitude;
        const lo = pos.coords.longitude;
        setLat(la);
        setLng(lo);
        setFlyTrigger(t => t + 1);
        const addr = await reverseGeocode(la, lo);
        if (addr) setAddressInput(addr.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).join(', '));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Autocomplete: dispara busca com debounce ao digitar
  function handleAddressChange(value) {
    setAddressInput(value);
    setSuggestions([]);
    setShowSuggestions(false);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      const results = await geocodeSearch(value);
      if (results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    }, 400);
  }

  // Usuário clica em uma sugestão
  function pickSuggestion(item) {
    const la = parseFloat(item.lat);
    const lo = parseFloat(item.lon);
    setLat(la);
    setLng(lo);
    setFlyTrigger(t => t + 1);
    setAddressInput(item.display_name.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).join(', '));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  // Clique/drag no mapa: atualiza coordenadas e endereço
  async function handleMapLocate(la, lo) {
    setLat(la);
    setLng(lo);
    const addr = await reverseGeocode(la, lo);
    if (addr) setAddressInput(addr.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).join(', '));
  }

  function handleFotos(files) {
    const arr = Array.from(files).slice(0, 3 - fotos.length);
    setFotos(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  }

  function removePhoto(i) {
    setFotos(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!fotos.length) { setError('Adicione pelo menos uma foto.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('descricao', descricao);
      fd.append('latitude', lat);
      fd.append('longitude', lng);
      if (addressInput) fd.append('endereco_texto', addressInput);
      fotos.forEach(f => fd.append('fotos', f));
      const res = await criarDenuncia(fd);
      setProtocolo(res.denuncia.protocolo);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Erro ao registrar denúncia.');
    } finally {
      setLoading(false);
    }
  }

  if (protocolo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Denúncia registrada!</h2>
            <p className="text-gray-500 mb-2">Protocolo:</p>
            <p className="text-2xl font-mono font-bold text-verde mb-6">{protocolo}</p>
            <p className="text-sm text-gray-500 mb-8">Você receberá atualizações no e-mail cadastrado.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/mapa')} className="bg-verde text-white px-6 py-2.5 rounded-xl hover:bg-verde-dark transition-colors">
                Ver no mapa
              </button>
              <button
                onClick={() => {
                  setProtocolo(''); setStep(0); setLat(null); setLng(null);
                  setDescricao(''); setFotos([]); setPreviews([]);
                  setAddressInput(''); setSuggestions([]);
                }}
                className="border border-verde text-verde px-6 py-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                Nova denúncia
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Denúncia</h1>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${i < step ? 'bg-verde text-white' : i === step ? 'bg-verde text-white ring-4 ring-green-100' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-1 text-xs font-medium mr-2 ${i === step ? 'text-verde' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mr-2 ${i < step ? 'bg-verde' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>}

        {/* Step 0 - Localização */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-visible">
            {/* Cabeçalho */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="font-semibold text-gray-700 mb-4">Onde está o problema?</h2>

              {/* Campo de endereço com autocomplete */}
              <div className="relative" ref={addressRef}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Buscar Endereço
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={e => handleAddressChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Digite o endereço, rua ou bairro..."
                    className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-verde"
                  />
                </div>

                {/* Lista de sugestões */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {suggestions.map(r => {
                      const parts = r.display_name.split(',').map(s => s.trim()).filter(Boolean);
                      const rua = parts.slice(0, 2).join(', ');
                      const local = parts.slice(2, 5).join(', ');
                      return (
                        <li
                          key={r.place_id}
                          onMouseDown={() => pickSuggestion(r)}
                          className="flex items-start gap-2 px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                        >
                          <span className="text-verde mt-0.5 shrink-0">📍</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800 leading-snug">{rua}</p>
                            {local && <p className="text-xs text-gray-400 mt-0.5">{local}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Mapa */}
            <div>
              <div className="px-6 pb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mapa
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  {lat ? 'Arraste o marcador ou clique para ajustar a posição exata' : 'Clique no mapa para marcar o local'}
                </p>
              </div>
              <div className="h-72 border-t border-b border-gray-100">
                <MapContainer center={CE_CENTER} zoom={7} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    maxZoom={19}
                  />
                  <MapClickHandler onLocate={handleMapLocate} />
                  <MapSync lat={lat} lng={lng} trigger={flyTrigger} />
                  {lat && lng && (
                    <Marker
                      position={[lat, lng]}
                      draggable
                      eventHandlers={{
                        dragend(e) {
                          const p = e.target.getLatLng();
                          handleMapLocate(p.lat, p.lng);
                        }
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Rodapé do card */}
            <div className="px-6 py-4 space-y-3">
              {lat && (
                <p className="text-xs text-green-600 text-center">
                  ✅ {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              )}
              <button
                onClick={() => {
                  if (!lat || !lng) { setError('Defina o local: busque o endereço ou clique no mapa.'); return; }
                  setError(''); setStep(1);
                }}
                className="w-full bg-verde text-white py-3 rounded-xl font-semibold hover:bg-verde-dark transition-colors"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Step 1 - Detalhes */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-700">Descreva a ocorrência</h2>
            <div>
              <textarea
                value={descricao} onChange={e => setDescricao(e.target.value)}
                rows={4} maxLength={500}
                placeholder="Ex: Lixo doméstico acumulado na calçada ao lado da padaria, bloqueando a passagem de pedestres."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-verde resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{descricao.length}/500</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={() => { if (descricao.length < 10) { setError('Descrição deve ter ao menos 10 caracteres.'); return; } setError(''); setStep(2); }}
                className="flex-1 bg-verde text-white py-3 rounded-xl font-semibold hover:bg-verde-dark transition-colors"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Fotos */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-700">Adicione fotos <span className="text-red-500">*</span></h2>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-verde hover:bg-green-50 transition-colors"
            >
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-500">Clique para adicionar fotos (até 3)</p>
              <p className="text-xs text-gray-400">JPG, PNG ou WEBP • max 5MB cada</p>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => handleFotos(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                    <img src={src} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50">← Voltar</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-verde text-white py-3 rounded-xl font-semibold hover:bg-verde-dark transition-colors disabled:opacity-60">
                {loading ? 'Enviando...' : 'Registrar Denúncia'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
