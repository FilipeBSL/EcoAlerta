const VALID_TRANSITIONS = {
  pendente: ['em_analise', 'invalida', 'cancelada'],
  em_analise: ['em_atendimento', 'invalida'],
  em_atendimento: ['resolvida'],
  resolvida: [],
  cancelada: [],
  invalida: []
};

function isValidTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function isInsideMunicipio(lat, lng) {
  const latMin = parseFloat(process.env.MUNICIPIO_LAT_MIN || -24.0);
  const latMax = parseFloat(process.env.MUNICIPIO_LAT_MAX || -23.0);
  const lngMin = parseFloat(process.env.MUNICIPIO_LNG_MIN || -47.0);
  const lngMax = parseFloat(process.env.MUNICIPIO_LNG_MAX || -46.0);
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

module.exports = { isValidTransition, isInsideMunicipio, VALID_TRANSITIONS };
