import api from './api';

export async function getPontos(params = {}) {
  const res = await api.get('/mapa/pontos', { params });
  return res.data;
}

export async function getIndicadores(params = {}) {
  const res = await api.get('/relatorios/indicadores', { params });
  return res.data;
}

export async function getBairros() {
  const res = await api.get('/bairros');
  return res.data;
}
