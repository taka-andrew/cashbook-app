export function fmt(n) {
  if (!n || n === 0) return '';
  return '¥' + Math.abs(n).toLocaleString();
}

export function calcDueDate(dateStr, cond) {
  const d = new Date(dateStr);
  if (cond === 'month-end') {
    const next = new Date(d.getFullYear(), d.getMonth() + 2, 0);
    return next.toISOString().split('T')[0];
  }
  if (cond === '15th') {
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 15);
    return next.toISOString().split('T')[0];
  }
  if (cond === '30days') {
    const next = new Date(d);
    next.setDate(next.getDate() + 30);
    return next.toISOString().split('T')[0];
  }
  return dateStr;
}

export const PAYMENT_CONDITIONS = {
  'month-end': '月末締め翌月末払い',
  '20th': '20日締め翌月10日払い',
  '7days': '請求後7日以内',
  '30days': '請求後30日以内',
  'immediate': '即日払い',
};

export const RECEIPT_CONDITIONS = {
  'month-end': '月末締め翌月末入金',
  '15th': '15日締め翌月15日入金',
  '30days': '請求後30日',
  'immediate': '都度入金',
};

export const INITIAL_LEDGER = [];

export const INITIAL_PAYMENT_MASTERS = [];

export const INITIAL_RECEIPT_MASTERS = [];
