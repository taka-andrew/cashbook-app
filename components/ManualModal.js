import { useState } from 'react';

const CATEGORIES = ['事務所家賃', '借入返済', 'リース料', '役員報酬', '給与', '税金・社会保険', '保険料', '振込手数料', '臨時支払い', 'その他'];

export default function ManualModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    amount: '',
    category: '事務所家賃',
    desc: '',
  });

  const save = () => {
    if (!form.amount) { alert('金額を入力してください'); return; }
    onSave({
      type: form.type,
      date: form.date,
      vendor: form.vendor || '（未入力）',
      desc: form.desc || form.category,
      income: form.type === 'income' ? parseInt(form.amount) : 0,
      expense: form.type === 'expense' ? parseInt(form.amount) : 0,
      status: 'planned',
      account: form.category,
    });
    onClose();
  };

  const s = styles;
  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        <div style={s.title}>支払・入金予定を手入力</div>
        <div style={s.sub}>請求書がない入出金の予定を登録します</div>
        <div style={s.formGrid}>
          <div style={s.formGroup}>
            <label style={s.label}>区分</label>
            <select style={s.input} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="expense">出金</option>
              <option value="income">入金</option>
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>日付</label>
            <input style={s.input} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>相手先</label>
            <input style={s.input} type="text" placeholder="例: 〇〇ビル管理" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>金額</label>
            <input style={s.input} type="number" placeholder="例: 440000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>内容</label>
            <select style={s.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>摘要（任意）</label>
            <input style={s.input} type="text" placeholder="例: 6月分家賃" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
          </div>
        </div>
        <div style={s.actions}>
          <button style={s.btn} onClick={onClose}>キャンセル</button>
          <button style={s.btnPrimary} onClick={save}>登録する</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 12, padding: 24, width: 480, maxWidth: '90%', border: '0.5px solid #e0e0e0' },
  title: { fontSize: 15, fontWeight: 500, marginBottom: 4 },
  sub: { fontSize: 12, color: '#888', marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#888' },
  input: { padding: '7px 10px', border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff', fontFamily: 'inherit' },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btn: { padding: '7px 14px', border: '0.5px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnPrimary: { padding: '7px 14px', border: '0.5px solid #1D9E75', borderRadius: 8, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
};
