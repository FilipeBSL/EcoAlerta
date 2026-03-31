const STATUS_CONFIG = {
  pendente: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
  em_analise: { label: 'Em Análise', class: 'bg-blue-100 text-blue-800' },
  em_atendimento: { label: 'Em Atendimento', class: 'bg-orange-100 text-orange-800' },
  resolvida: { label: 'Resolvida', class: 'bg-green-100 text-green-800' },
  cancelada: { label: 'Cancelada', class: 'bg-gray-100 text-gray-600' },
  invalida: { label: 'Inválida', class: 'bg-red-100 text-red-700' }
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}
