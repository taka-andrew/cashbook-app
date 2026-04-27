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

export const INITIAL_LEDGER = [
  { id: 1, date: '2025-05-10', type: 'expense', vendor: 'A商事', desc: '5月仕入分', income: 0, expense: 350000, status: 'planned', account: '仕入高' },
  { id: 2, date: '2025-05-15', type: 'income',  vendor: 'B事業所', desc: '売上入金（4月請求）', income: 880000, expense: 0, status: 'planned', account: '売上高' },
  { id: 3, date: '2025-05-25', type: 'expense', vendor: '〇〇ビル管理', desc: '事務所家賃', income: 0, expense: 440000, status: 'confirmed', account: '地代家賃' },
  { id: 4, date: '2025-05-28', type: 'expense', vendor: 'Bメーカー', desc: '資材仕入 4月分', income: 0, expense: 220000, status: 'planned', account: '仕入高' },
  { id: 5, date: '2025-05-31', type: 'expense', vendor: '役員', desc: '役員報酬', income: 0, expense: 500000, status: 'planned', account: '役員報酬' },
  { id: 6, date: '2025-05-31', type: 'income',  vendor: 'C社', desc: '5月売上入金予定', income: 660000, expense: 0, status: 'planned', account: '売上高' },
];

export const INITIAL_PAYMENT_MASTERS = [
  { id: 1, vendor: 'A商事', condition: '月末締め翌月末払い', note: '' },
  { id: 2, vendor: 'Bメーカー', condition: '20日締め翌月10日払い', note: '' },
  { id: 3, vendor: 'C社', condition: '請求後7日以内', note: '振込のみ' },
];

export const INITIAL_RECEIPT_MASTERS = [
  { id: 1, client: 'B事業所', condition: '月末締め翌月末入金', note: '' },
  { id: 2, client: 'C社', condition: '15日締め翌月15日入金', note: '' },
];
