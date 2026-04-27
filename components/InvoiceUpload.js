import { useState, useRef } from 'react';
import { calcDueDate } from '../lib/utils';

const ACCOUNTS = ['仕入高', '消耗品費', '外注費', '地代家賃', '諸経費', 'その他'];

export default function InvoiceUpload({ onRegister }) {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ vendor: '', date: '', due: '', amount: '', tax: '', bank: '', desc: '', dept: '', account: '仕入高' });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleFile = f => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(f.type)) { setError('PDF・PNG・JPGのみ対応しています'); return; }
    if (f.size > 20 * 1024 * 1024) { setError('20MB以下のファイルをアップロードしてください'); return; }
    setFile(f); setError(''); setAiResult(null); setConfirmed(false);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setProgress(10); setError(''); setAiResult(null);

    const reader = new FileReader();
    reader.onload = async e => {
      const base64 = e.target.result.split(',')[1];
      setProgress(30);
      try {
        const res = await fetch('/api/analyze-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mediaType: file.type }),
        });
        setProgress(80);
        if (!res.ok) throw new Error((await res.json()).error || 'APIエラー');
        const { result } = await res.json();
        setProgress(100);
        setAiResult(result);
        setForm({
          vendor: result.vendor || '',
          date: result.invoice_date?.replace(/\//g, '-') || '',
          due: result.due_date?.replace(/\//g, '-') || '',
          amount: result.amount_with_tax || '',
          tax: result.tax_amount || '',
          bank: result.bank_info || '',
          desc: result.description || '',
          dept: result.department || '',
          account: result.account_suggestion || '仕入高',
        });
      } catch (err) {
        setError('読み取りエラー: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const register = () => {
    if (!form.vendor || !form.amount) { setError('仕入先名と金額は必須です'); return; }
    const dueDate = form.due || form.date || new Date().toISOString().split('T')[0];
    onRegister({
      type: 'expense',
      date: dueDate,
      vendor: form.vendor,
      desc: form.desc || '仕入請求',
      income: 0,
      expense: parseInt(form.amount) || 0,
      status: 'planned',
      account: form.account,
    });
    setFile(null); setAiResult(null); setConfirmed(true);
    setForm({ vendor: '', date: '', due: '', amount: '', tax: '', bank: '', desc: '', dept: '', account: '仕入高' });
  };

  const s = styles;
  const confColor = { high: '#0F6E56', medium: '#854F0B', low: '#A32D2D' };
  const confLabel = { high: '読み取り精度: 高', medium: '読み取り精度: 中（要確認）', low: '読み取り精度: 低（要確認）' };

  return (
    <div>
      <div style={s.card}>
        <div style={s.cardTitle}>仕入先請求書の登録</div>

        {/* アップロードゾーン */}
        <div
          style={{ ...s.uploadZone, ...(drag ? s.uploadZoneDrag : {}) }}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <div style={s.uploadIcon}>📄</div>
          <div style={s.uploadTitle}>{file ? file.name : 'PDFまたは画像をドロップ、またはクリック'}</div>
          <div style={s.uploadSub}>{file ? `${(file.size / 1024).toFixed(0)}KB — AIで読み取る準備ができました` : 'PDF・PNG・JPG 対応 / 最大20MB'}</div>
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
        </div>

        {file && !aiResult && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button style={s.btnPrimary} onClick={analyze} disabled={loading}>
              {loading ? '解析中...' : 'AIで読み取る'}
            </button>
            {loading && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={s.progressBar}><div style={{ ...s.progressFill, width: progress + '%' }} /></div>
                <span style={{ fontSize: 12, color: '#888' }}>{progress}%</span>
              </div>
            )}
          </div>
        )}

        {error && <div style={s.errorBox}>{error}</div>}

        {/* AI確認画面 */}
        {aiResult && (
          <div style={s.aiBox}>
            <div style={s.aiHeader}>
              <span style={s.aiBadge}>AI読み取り完了</span>
              <span style={{ fontSize: 12, color: confColor[aiResult.confidence] || '#888' }}>
                {confLabel[aiResult.confidence] || ''}
              </span>
            </div>
            {aiResult.notes && <div style={s.noteBox}>※ {aiResult.notes}</div>}
          </div>
        )}

        {/* 入力フォーム（AI結果または手入力） */}
        <div style={s.formGrid}>
          {[
            { label: '仕入先名 *', key: 'vendor', type: 'text', placeholder: '例: A商事株式会社' },
            { label: '請求日', key: 'date', type: 'date' },
            { label: '支払期日', key: 'due', type: 'date' },
            { label: '請求金額（税込）*', key: 'amount', type: 'number', placeholder: '例: 385000' },
            { label: '消費税', key: 'tax', type: 'number', placeholder: '例: 35000' },
          ].map(f => (
            <div key={f.key} style={s.formGroup}>
              <label style={s.label}>{f.label}</label>
              <input style={s.input} type={f.type} placeholder={f.placeholder || ''}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div style={s.formGroup}>
            <label style={s.label}>勘定科目</label>
            <select style={s.input} value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))}>
              {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>振込先</label>
            <input style={s.input} type="text" placeholder="例: 三菱UFJ 渋谷支店 普通 1234567" value={form.bank} onChange={e => setForm(p => ({ ...p, bank: e.target.value }))} />
          </div>
          <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>摘要</label>
            <input style={s.input} type="text" placeholder="例: 5月仕入分" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
          </div>
          <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
            <label style={s.label}>部門・店舗</label>
            <input style={s.input} type="text" placeholder="例: EC部門" value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button style={s.btnPrimary} onClick={register}>
            {aiResult ? '✓ 内容を確認して出納帳に登録' : '出納帳に登録'}
          </button>
        </div>

        {confirmed && <div style={s.successBox}>✓ 支払予定を出納帳に登録しました</div>}
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 500, marginBottom: 12 },
  uploadZone: { border: '1.5px dashed #ccc', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 12, transition: 'all .2s' },
  uploadZoneDrag: { borderColor: '#1D9E75', background: '#E1F5EE' },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadTitle: { fontSize: 14, fontWeight: 500, marginBottom: 4 },
  uploadSub: { fontSize: 12, color: '#888' },
  btnPrimary: { padding: '8px 16px', border: '0.5px solid #1D9E75', borderRadius: 8, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
  progressBar: { flex: 1, height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#1D9E75', borderRadius: 2, transition: 'width .3s' },
  errorBox: { background: '#FCEBEB', border: '0.5px solid #F7C1C1', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#791F1F' },
  successBox: { background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#27500A' },
  aiBox: { background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '12px 16px', marginBottom: 12 },
  aiHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiBadge: { background: '#1D9E75', color: '#fff', fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 500 },
  noteBox: { fontSize: 12, color: '#0F6E56', marginTop: 4 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#888' },
  input: { padding: '7px 10px', border: '0.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff', fontFamily: 'inherit' },
};
