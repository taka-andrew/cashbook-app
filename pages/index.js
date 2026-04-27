import { useState } from 'react';
import Head from 'next/head';
import Ledger from '../components/Ledger';
import InvoiceUpload from '../components/InvoiceUpload';
import SalesUpload from '../components/SalesUpload';
import ManualModal from '../components/ManualModal';
import Master from '../components/Master';
import { INITIAL_LEDGER, INITIAL_PAYMENT_MASTERS, INITIAL_RECEIPT_MASTERS } from '../lib/utils';

const TABS = [
  { id: 'ledger', label: '月次出納帳' },
  { id: 'invoice', label: '仕入先請求書' },
  { id: 'sales', label: '自社請求書' },
  { id: 'master', label: '取引先マスタ' },
];

export default function Home() {
  const [tab, setTab] = useState('ledger');
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [nextId, setNextId] = useState(10);
  const [month, setMonth] = useState({ year: 2025, month: 5 });
  const [filter, setFilter] = useState('all');
  const [showManual, setShowManual] = useState(false);
  const [paymentMasters, setPaymentMasters] = useState(INITIAL_PAYMENT_MASTERS);
  const [receiptMasters, setReceiptMasters] = useState(INITIAL_RECEIPT_MASTERS);
  const [pmNextId, setPmNextId] = useState(4);
  const [rmNextId, setRmNextId] = useState(3);

  const addEntry = entry => {
    const id = nextId;
    setNextId(p => p + 1);
    setLedger(p => [...p, { ...entry, id }]);
    const d = new Date(entry.date);
    setMonth({ year: d.getFullYear(), month: d.getMonth() + 1 });
    setTab('ledger');
  };

  const changeMonth = dir => {
    setMonth(p => {
      let m = p.month + dir;
      let y = p.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  };

  const s = styles;
  return (
    <>
      <Head>
        <title>AI出納予定管理</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.app}>
        {/* ヘッダー */}
        <div style={s.header}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            AI出納予定管理
          </div>
          <button style={s.btnPrimary} onClick={() => setShowManual(true)}>+ 手入力登録</button>
        </div>

        {/* タブ */}
        <div style={s.tabBar}>
          {TABS.map(t => (
            <button key={t.id} style={tab === t.id ? s.tabActive : s.tab} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div style={s.content}>
          {tab === 'ledger' && (
            <Ledger
              data={ledger}
              month={month}
              filter={filter}
              onFilterChange={setFilter}
              onChangeMonth={changeMonth}
              onConfirm={id => setLedger(p => p.map(r => r.id === id ? { ...r, status: 'confirmed' } : r))}
              onDelete={id => setLedger(p => p.filter(r => r.id !== id))}
            />
          )}
          {tab === 'invoice' && <InvoiceUpload onRegister={addEntry} />}
          {tab === 'sales' && <SalesUpload onRegister={addEntry} />}
          {tab === 'master' && (
            <Master
              paymentMasters={paymentMasters}
              receiptMasters={receiptMasters}
              onAddPayment={m => { setPaymentMasters(p => [...p, { ...m, id: pmNextId }]); setPmNextId(p => p + 1); }}
              onDeletePayment={id => setPaymentMasters(p => p.filter(m => m.id !== id))}
              onAddReceipt={m => { setReceiptMasters(p => [...p, { ...m, id: rmNextId }]); setRmNextId(p => p + 1); }}
              onDeleteReceipt={id => setReceiptMasters(p => p.filter(m => m.id !== id))}
            />
          )}
        </div>
      </div>

      {showManual && <ManualModal onClose={() => setShowManual(false)} onSave={addEntry} />}
    </>
  );
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '0.5px solid #e0e0e0', background: '#fff' },
  logo: { fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { width: 28, height: 28, background: '#1D9E75', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { padding: '6px 14px', border: '0.5px solid #1D9E75', borderRadius: 8, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontSize: 13 },
  tabBar: { display: 'flex', borderBottom: '0.5px solid #e0e0e0', background: '#fff', padding: '0 20px' },
  tab: { padding: '10px 16px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: '#888', borderBottom: '2px solid transparent', marginBottom: -1 },
  tabActive: { padding: '10px 16px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', color: '#1D9E75', borderBottom: '2px solid #1D9E75', marginBottom: -1, fontWeight: 500 },
  content: { flex: 1, padding: 20, background: '#f5f5f3', overflowY: 'auto' },
};
