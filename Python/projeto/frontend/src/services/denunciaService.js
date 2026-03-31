import api from './api';

export async function criarDenuncia(formData) {
  const res = await api.post('/denuncias', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function listarDenuncias(params = {}) {
  const res = await api.get('/denuncias', { params });
  return res.data;
}

export async function buscarDenuncia(id) {
  const res = await api.get(`/denuncias/${id}`);
  return res.data;
}

export async function atualizarStatus(id, body) {
  const res = await api.patch(`/denuncias/${id}/status`, body);
  return res.data;
}

export async function cancelarDenuncia(id) {
  const res = await api.delete(`/denuncias/${id}`);
  return res.data;
}
