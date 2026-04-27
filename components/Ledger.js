import { fmt } from '../lib/utils';

const OPENING_BALANCE = 8300000;

export default function Ledger({ data, month, onConfirm, onDelete, onChangeMonth, filter, onFilterChange }) {
  const filtered = data
    .filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === month.year && d.getMonth() + 1 === month.month;
    })
    .filter(r => {
      if (filter === 'income') return r.type === 'income';
      if (filter === 'expense') return r.type === 'expense';
      if (filter === 'planned') return r.status === 'planned';
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthAll = data.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === month.year && d.getMonth() + 1 === month.month;
  });

  let balance = OPENING_BALANCE;
  let totalIncome = 0, totalExpense = 0, countPlanned = 0;
  let minBalance = Infinity, minDate = '';
  monthAll.sort((a, b) => a.date.localeCompare(b.date)).forEach(r => {
    balance += r.income - r.expense;
    totalIncome += r.income;
    totalExpense += r.expense;
    if (r.status === 'planned') countPlanned++;
    if (balance < minBalance) { minBalance = balance; minDate = r.date; }
  });

  let runBalance = OPENING_BALANCE;
  const rows = filtered.map(r => {
    runBalance += r.income - r.expense;
    return { ...r, runBalance };
  });

  const exportCSV = () => {
    const header = ['日付', '区分', '相手先', '内容', '入金', '出金', '残高', '状態', '勘定科目'];
    const csvRows = filtered.map(r => [
      r.date, r.type === 'income' ? '入金' : '出金',
      r.vendor, r.desc, r.income || '', r.expense || '',
      '', r.status === 'planned' ? '予定' : '確定', r.account,
    ]);
    const csv = [header, ...csvRows].map(row =>
      row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${month.year}年${month.month}月_出納帳.csv`;
    a.click();
  };

  const s = styles;
  return (
    <div>
      <div style={s.monthNav}>
        <button style={s.btn} onClick={() => onChangeMonth(-1)}>◀</button>
        <span style={s.monthLabel}>{month.year}年{month.month}月</span>
        <button style={s.btn} onClick={() => onChangeMonth(1)}>▶</button>
        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {['all', 'income', 'expense', 'planned'].map(f => (
            <button key={f} style={filter === f ? s.chipActive : s.chip} onClick={() => onFilterChange(f)}>
              {{ all: 'すべて', income: '入金', expense: '出金', planned: '予定のみ' }[f]}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={s.btnPrimary} onClick={exportCSV}>CSVエクスポート</button>
        </div>
      </div>

      <div style={s.summaryGrid}>
        {[
          { label: '入金予定合計', value: '¥' + totalIncome.toLocaleString(), color: '#1D9E75' },
          { label: '出金予定合計', value: '¥' + totalExpense.toLocaleString(), color: '#D85A30' },
          { label: '月末残高予測', value: '¥' + balance.toLocaleString(), color: '#378ADD' },
          { label: '未確定件数', value: countPlanned + '件', color: '#BA7517' },
        ].map(m => (
          <div key={m.label} style={s.metric}>
            <div style={s.metricLabel}>{m.label}</div>
            <div style={{ ...s.metricValue, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {minBalance < 500000 && minBalance !== Infinity && (
        <div style={s.alert}>
          ⚠ {minDate.replace(/-/g, '/')} 頃に残高が ¥{minBalance.toLocaleString()} まで低下する見込みです。資金手当をご確認ください。
        </div>
      )}

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              {['日付', '区分', '相手先', '内容', '入金', '出金', '残高', '状態', '操作'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>この月のデータはありません</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} style={s.tr}>
                <td style={s.td}>{r.date.replace(/-/g, '/')}</td>
                <td style={s.td}>
                  <span style={r.type === 'income' ? s.badgeIncome : s.badgeExpense}>
                    {r.type === 'income' ? '入金' : '出金'}
                  </span>
                </td>
                <td style={s.td}>{r.vendor}</td>
                <td style={{ ...s.td, color: '#666' }}>{r.desc}</td>
                <td style={{ ...s.td, textAlign: 'right', color: r.income ? '#1D9E75' : '', fontWeight: r.income ? 500 : 400 }}>{fmt(r.income)}</td>
                <td style={{ ...s.td, textAlign: 'right', color: r.expense ? '#D85A30' : '', fontWeight: r.expense ? 500 : 400 }}>{fmt(r.expense)}</td>
                <td style={{ ...s.td, textAlign: 'right', fontWeight: 500 }}>¥{r.runBalance.toLocaleString()}</td>
                <td style={s.td}>
                  <span style={r.status === 'planned' ? s.badgePlanned : s.badgeConfirmed}>
                    {r.status === 'planned' ? '予定' : '確定'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {r.status === 'planned' && (
                      <button style={s.iconBtn} title="確定に変更" onClick={() => onConfirm(r.id)}>✓</button>
                    )}
                    <button style={{ ...s.iconBtn, color: '#D85A30' }} title="削除" onClick={() => onDelete(r.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  monthNav: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  monthLabel: { fontSize: 16, fontWeight: 500 },
  btn: { padding: '5px 10px', border: '0.5px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnPrimary: { padding: '6px 14px', border: '0.5px solid #1D9E75', borderRadius: 6, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
  chip: { padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '0.5px solid #ccc', background: '#fff', color: '#666' },
  chipActive: { padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '0.5px solid #1D9E75', background: '#1D9E75', color: '#fff' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  metric: { background: '#f5f5f3', borderRadius: 8, padding: '12px 14px' },
  metricLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  metricValue: { fontSize: 20, fontWeight: 500 },
  alert: { background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#633806' },
  tableCard: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', fontWeight: 500, fontSize: 11, color: '#888', borderBottom: '0.5px solid #e0e0e0', whiteSpace: 'nowrap' },
  td: { padding: '9px 10px', borderBottom: '0.5px solid #f0f0f0', verticalAlign: 'middle' },
  tr: {},
  badgeIncome: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: '#E1F5EE', color: '#0F6E56' },
  badgeExpense: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: '#FAECE7', color: '#993C1D' },
  badgePlanned: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: '#E6F1FB', color: '#185FA5' },
  badgeConfirmed: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: '#EAF3DE', color: '#3B6D11' },
  iconBtn: { width: 26, height: 26, borderRadius: 6, border: '0.5px solid #e0e0e0', background: 'transparent', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
};
