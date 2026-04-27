import { useState } from 'react';
import { calcDueDate, RECEIPT_CONDITIONS } from '../lib/utils';

export default function SalesUpload({ onRegister }) {
  const [form, setForm] = useState({ client: '', amount: '', date: new Date().toISOString().split('T')[0], cond: 'month-end', desc: '' });
  const [aiResult, setAiResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const preview = () => {
    if (!form.client || !form.amount) return;
    const due = calcDueDate(form.date, form.cond);
    setAiResult({ ...form, due, condLabel: RECEIPT_CONDITIONS[form.cond] });
  };

  const register = () => {
    if (!form.client || !form.amount) return;
    const due = calcDueDate(form.date, form.cond);
    onRegister({
      type: 'income',
      date: due,
      vendor: form.client,
      desc: form.desc || '売上入金',
      income: parseInt(form.amount) || 0,
      expense: 0,
      status: 'planned',
      account: '売上高',
    });
    setAiResult(null); setConfirmed(true);
    setForm({ client: '', amount: '', date: new Date().toISOString().split('T')[0], cond: 'month-end', desc: '' });
  };

  const s = styles;
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>自社発行請求書の登録</div>
      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>請求先 *</label>
          <input style={s.input} type="text" placeholder="例: B事業所" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>請求金額（税込）*</label>
          <input style={s.input} type="number" placeholder="例: 880000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>請求日</label>
          <input style={s.input} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>入金条件</label>
          <select style={s.input} value={form.cond} onChange={e => setForm(p => ({ ...p, cond: e.target.value }))}>
            {Object.entries(RECEIPT_CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
          <label style={s.label}>摘要</label>
          <input style={s.input} type="text" placeholder="例: 5月分システム保守" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        <button style={s.btn} onClick={preview}>入金予定日を計算</button>
        <button style={s.btnPrimary} onClick={register}>出納帳に登録</button>
      </div>

      {aiResult && (
        <div style={s.resultBox}>
          <div style={s.resultLabel}>入金予定日（自動計算）</div>
          <div style={s.resultGrid}>
            {[
              ['請求先', aiResult.client],
              ['請求金額', '¥' + parseInt(aiResult.amount).toLocaleString()],
              ['請求日', aiResult.date],
              ['入金条件', aiResult.condLabel],
              ['入金予定日', aiResult.due.replace(/-/g, '/')],
              ['摘要', aiResult.desc || '—'],
            ].map(([label, val]) => (
              <div key={label} style={s.resultItem}>
                <div style={s.resultItemLabel}>{label}</div>
                <div style={s.resultItemValue}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmed && <div style={s.successBox}>✓ 入金予定を出納帳に登録しました</div>}
    </div>
  );
}

const styles = {
  card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 500, marginBottom: 12 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#888' },
  input: { padding: '7px 10px', border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff', fontFamily: 'inherit' },
  btn: { padding: '7px 14px', border: '0.5px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnPrimary: { padding: '7px 14px', border: '0.5px solid #1D9E75', borderRadius: 8, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
  resultBox: { background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '12px 16px', marginBottom: 12 },
  resultLabel: { fontSize: 12, fontWeight: 500, color: '#0F6E56', marginBottom: 10 },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  resultItem: { background: '#fff', borderRadius: 6, padding: '8px 10px' },
  resultItemLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  resultItemValue: { fontSize: 13, fontWeight: 500 },
  successBox: { background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#27500A' },
};
