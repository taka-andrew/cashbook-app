import { useState } from 'react';
import { PAYMENT_CONDITIONS, RECEIPT_CONDITIONS } from '../lib/utils';

export default function Master({ paymentMasters, receiptMasters, onAddPayment, onDeletePayment, onAddReceipt, onDeleteReceipt }) {
  const [showPayForm, setShowPayForm] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);
  const [payForm, setPayForm] = useState({ vendor: '', cond: 'month-end', note: '' });
  const [recForm, setRecForm] = useState({ client: '', cond: 'month-end', note: '' });

  const savePayment = () => {
    if (!payForm.vendor) return;
    onAddPayment({ ...payForm, condition: PAYMENT_CONDITIONS[payForm.cond] });
    setPayForm({ vendor: '', cond: 'month-end', note: '' });
    setShowPayForm(false);
  };

  const saveReceipt = () => {
    if (!recForm.client) return;
    onAddReceipt({ ...recForm, condition: RECEIPT_CONDITIONS[recForm.cond] });
    setRecForm({ client: '', cond: 'month-end', note: '' });
    setShowRecForm(false);
  };

  const s = styles;
  return (
    <div>
      {/* 支払条件マスタ */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>支払条件マスタ（仕入先）</div>
          <button style={s.btnPrimary} onClick={() => setShowPayForm(p => !p)}>+ 追加</button>
        </div>
        {showPayForm && (
          <div style={s.addRow}>
            <div style={s.formGroup}>
              <label style={s.label}>仕入先名</label>
              <input style={s.input} type="text" placeholder="仕入先名" value={payForm.vendor} onChange={e => setPayForm(p => ({ ...p, vendor: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>支払条件</label>
              <select style={s.input} value={payForm.cond} onChange={e => setPayForm(p => ({ ...p, cond: e.target.value }))}>
                {Object.entries(PAYMENT_CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>備考</label>
              <input style={s.input} type="text" placeholder="任意" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>&nbsp;</label>
              <button style={s.btnPrimary} onClick={savePayment}>保存</button>
            </div>
          </div>
        )}
        <table style={s.table}>
          <thead><tr>
            {['仕入先名', '支払条件', '備考', '操作'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {paymentMasters.length === 0
              ? <tr><td colSpan={4} style={s.empty}>登録なし</td></tr>
              : paymentMasters.map(m => (
                <tr key={m.id}>
                  <td style={s.td}>{m.vendor}</td>
                  <td style={s.td}>{m.condition}</td>
                  <td style={{ ...s.td, color: '#888' }}>{m.note || '—'}</td>
                  <td style={s.td}><button style={s.iconBtn} onClick={() => onDeletePayment(m.id)}>✕</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 入金条件マスタ */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>入金条件マスタ（請求先）</div>
          <button style={s.btnPrimary} onClick={() => setShowRecForm(p => !p)}>+ 追加</button>
        </div>
        {showRecForm && (
          <div style={s.addRow}>
            <div style={s.formGroup}>
              <label style={s.label}>請求先名</label>
              <input style={s.input} type="text" placeholder="請求先名" value={recForm.client} onChange={e => setRecForm(p => ({ ...p, client: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>入金条件</label>
              <select style={s.input} value={recForm.cond} onChange={e => setRecForm(p => ({ ...p, cond: e.target.value }))}>
                {Object.entries(RECEIPT_CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>備考</label>
              <input style={s.input} type="text" placeholder="任意" value={recForm.note} onChange={e => setRecForm(p => ({ ...p, note: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>&nbsp;</label>
              <button style={s.btnPrimary} onClick={saveReceipt}>保存</button>
            </div>
          </div>
        )}
        <table style={s.table}>
          <thead><tr>
            {['請求先名', '入金条件', '備考', '操作'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {receiptMasters.length === 0
              ? <tr><td colSpan={4} style={s.empty}>登録なし</td></tr>
              : receiptMasters.map(m => (
                <tr key={m.id}>
                  <td style={s.td}>{m.client}</td>
                  <td style={s.td}>{m.condition}</td>
                  <td style={{ ...s.td, color: '#888' }}>{m.note || '—'}</td>
                  <td style={s.td}><button style={s.iconBtn} onClick={() => onDeleteReceipt(m.id)}>✕</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 500 },
  btnPrimary: { padding: '6px 12px', border: '0.5px solid #1D9E75', borderRadius: 8, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 12 },
  addRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 12, background: '#f5f5f3', padding: 12, borderRadius: 8 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 11, color: '#888' },
  input: { padding: '6px 10px', border: '0.5px solid #e0e0e0', borderRadius: 6, fontSize: 13, background: '#fff', fontFamily: 'inherit' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', fontWeight: 500, fontSize: 11, color: '#888', borderBottom: '0.5px solid #e0e0e0' },
  td: { padding: '9px 10px', borderBottom: '0.5px solid #f0f0f0' },
  empty: { textAlign: 'center', padding: 16, color: '#aaa' },
  iconBtn: { width: 26, height: 26, borderRadius: 6, border: '0.5px solid #e0e0e0', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#D85A30' },
};
