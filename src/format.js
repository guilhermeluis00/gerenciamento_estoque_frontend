const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export const formatCurrency = (value) => currency.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);
export const formatPercent = (value) => percent.format(value);
export const formatDateTime = (value) =>
  new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** "há 5 min", "ontem", ou a data, para listas de atividade recente. */
export function formatRelative(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'ontem';
  return new Date(value).toLocaleDateString('pt-BR');
}

/** CPF 000.000.000-00 / CNPJ 00.000.000/0000-00 (salvo sem pontuação no banco). */
export function formatDocument(doc) {
  if (!doc) return '';
  if (doc.length === 11) return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  if (doc.length === 14) return doc.replace(/^(\w{2})(\w{3})(\w{3})(\w{4})(\w{2})$/, '$1.$2.$3/$4-$5');
  return doc;
}

export const SUBSCRIPTION_LABELS = {
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
};
