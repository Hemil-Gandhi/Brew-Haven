import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, X, Share2 } from 'lucide-react';
import { amountInWords, formatINR } from '../utils/format';

const BRAND = {
  name: 'Brew Haven',
  tagline: 'Premium Café & Restaurant',
  address: '123 Coffee Lane, Brew City',
  phone: '+91 98765 43210',
  gstin: '22AAAAA0000A1Z5',
  email: 'care@brewhaven.cafe',
};

function computeBill(order) {
  const items = order?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const gst = Math.max((order?.totalAmount || 0) - subtotal, 0);
  const cgst = gst / 2;
  const sgst = gst / 2;
  const total = order?.totalAmount || subtotal + gst;
  const billDate = order?.createdAt ? new Date(order.createdAt) : new Date();
  const servedBy = order?.staffId?.name || order?.waiter || 'Brew Haven Staff';
  const orderType = order?.type || 'Dine-in';
  const tableNo = order?.tableId?.number || (order?.type === 'Takeaway' ? 'Takeaway' : '—');
  return { items, subtotal, gst, cgst, sgst, total, billDate, servedBy, orderType, tableNo };
}

const BillPaper = ({ order }) => {
  const { items, subtotal, gst, cgst, sgst, total, billDate, servedBy, orderType, tableNo } = computeBill(order);
  const words = amountInWords(total);

  return (
    <div className="bill-paper w-full bg-white text-slate-900 rounded-[1.5rem] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-200">
      {/* Exposed top colour band */}
      <div className="h-2.5 bg-gradient-to-r from-[#8B6533] via-[#B48F60] to-[#D4AF37]" />

      <div className="p-5 sm:p-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2C241E] flex items-center justify-center text-primary-light text-xl font-black flex-shrink-0 shadow-inner">
              B
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">{BRAND.name}</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{BRAND.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-dark">Tax Invoice</p>
            <p className="text-xs text-slate-400 mt-0.5">GSTIN: {BRAND.gstin}</p>
          </div>
        </div>

        {/* ── Company line ── */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-1">
          <span>{BRAND.address}</span>
          <span className="text-slate-400">•</span>
          <span>{BRAND.phone}</span>
          <span className="text-slate-400">•</span>
          <span>{BRAND.email}</span>
        </div>

        {/* ── Meta (Bill to / Invoice) ── */}
        <div className="mt-6 grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="space-y-2">
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bill To</p>
              <p className="text-sm font-bold text-slate-800">Guest / Counter</p></div>
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Served By</p>
              <p className="text-sm font-semibold text-slate-700">{servedBy}</p></div>
          </div>
          <div className="space-y-2 text-left sm:text-right">
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Invoice No.</p>
              <p className="text-sm font-bold text-primary-dark">{order?.orderNumber}</p></div>
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Date & Time</p>
              <p className="text-sm font-semibold text-slate-700">
                {billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p></div>
          </div>
        </div>

        {/* ── Order summary pills ── */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#1A1510] text-white text-[11px] font-bold">Table {tableNo || '—'}</span>
          <span className="px-3 py-1.5 rounded-lg bg-[#B48F5A]/15 text-[#8B6533] text-[11px] font-bold">{orderType}</span>
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
            order?.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>{order?.paymentStatus || 'Unpaid'}</span>
        </div>

        {/* ── Items table ── */}
        <div className="mt-6">
          <div className="grid grid-cols-[2.2rem_1fr_3.5rem_4.5rem_5rem] sm:grid-cols-[2.5rem_1fr_4rem_5rem_5.5rem] gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b-2 border-slate-800 pb-2">
            <span>#</span><span>Item</span><span className="text-center">Qty</span><span className="text-right">Rate</span><span className="text-right">Amount</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-[2.2rem_1fr_3.5rem_4rem_3rem] sm:grid-cols-[2.5rem_1fr_4rem_5rem_5.5rem] gap-2 py-3 items-center text-sm">
                <span className="text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 leading-tight truncate">{it.name}</p>
                  {it.variant && <p className="text-[10px] text-slate-400 font-medium">{it.variant}</p>}
                </div>
                <span className="text-center font-medium text-slate-700">×{it.quantity}</span>
                <span className="text-right text-slate-600">{formatINR(it.price)}</span>
                <span className="text-right font-bold text-slate-800">{formatINR(it.price * it.quantity)}</span>
              </div>
            ))}
            {items.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm italic">No items on this bill.</div>
            )}
          </div>
        </div>

        {/* ── Totals ── */}
        <div className="mt-5 flex justify-end">
          <div className="w-full sm:w-[17rem] space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {gst > 0 && (<>
              <div className="flex justify-between text-slate-600"><span>CGST</span><span>{formatINR(cgst)}</span></div>
              <div className="flex justify-between text-slate-600"><span>SGST</span><span>{formatINR(sgst)}</span></div>
              <div className="flex justify-between text-slate-600"><span>GST Total</span><span>{formatINR(gst)}</span></div>
            </>)}
            <div className="flex justify-between text-slate-600"><span>Discount</span><span className="text-slate-400">—</span></div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-slate-800">
              <span className="text-base font-black uppercase">Total Pay</span>
              <span className="text-xl font-black text-primary-dark">₹{formatINR(total)}</span>
            </div>
          </div>
        </div>

        {/* ── Amount in words ── */}
        <div className="mt-5 bg-[#1A1510] text-white rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-light">Amount In Words</p>
          <p className="text-sm font-semibold text-white/90 text-right">{words}</p>
        </div>

        {/* ── Payment summary ── */}
        {order?.paymentMethod && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Payment Mode</p>
              <p className="text-sm font-bold text-emerald-800">{order.paymentMethod}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Status</p>
              <p className="text-sm font-bold text-slate-800">{order?.paymentStatus || 'Unpaid'}</p>
            </div>
            <div className={`rounded-lg py-2.5 col-span-2 sm:col-span-1 ${order?.paymentStatus === 'Paid' ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Reference</p>
              <p className="text-sm font-bold text-slate-800">{order?.orderNumber}</p>
            </div>
          </div>
        )}

        {/* ── Thank you / signature row ── */}
        <div className="mt-7 pt-5 border-t border-slate-200 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-800 italic">“Thank you for dining with us!”</p>
            <p className="text-xs text-slate-400 mt-1">Please visit us again at {BRAND.name} ☕</p>
            <p className="text-[10px] text-slate-300 mt-2">This is a computer-generated bill.</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-6 mr-6 sm:mr-10">Authorised Signatory</p>
            <div className="w-24 sm:w-32 border-t-2 border-slate-400 pt-1 text-[10px] text-slate-400 text-center mx-auto">Brew Haven</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toolbar = ({ onDownload, onPrint, onShare, streaming }) => (
  <div className="flex flex-wrap items-center gap-2">
    <button
      onClick={onDownload}
      disabled={streaming}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-60"
    >
      <Download className="w-4 h-4" />{streaming ? 'Generating…' : 'Download PDF'}
    </button>
    <button
      onClick={onPrint}
      disabled={streaming}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-60"
    >
      <Printer className="w-4 h-4" /> Print
    </button>
    {navigator.share && (
      <button onClick={onShare} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95">
        <Share2 className="w-4 h-4" /> Share
      </button>
    )}
  </div>
);

/**
 * A premium, professional restaurant bill/invoice with GST breakdown,
 * amount-in-words and PDF/Print export. Reusable by admins & customers.
 *
 * @param {object}  order        - Order object (items, totalAmount, orderNumber, tableId, type, payment*)
 * @param {boolean} isModal      - Render as an overlay modal with action bar
 * @param {function} onClose     - Close callback (modal mode)
 */
const Bill = ({ order, isModal = false, onClose }) => {
  const billRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const { total } = computeBill(order);

  // ── PDF export via html2canvas ─────────────────────────────────────
  const downloadPDF = async () => {
    setStreaming(true);
    setError('');
    try {
      const node = billRef.current;
      const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = 210;
      const ph = 297;
      const ratio = canvas.height / canvas.width;
      let w = pw;
      let h = w * ratio;
      if (h > ph) { h = ph; w = ph / ratio; }
      pdf.addImage(imgData, 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h);
      pdf.save(`Brew-Haven-Bill-${order?.orderNumber || 'Invoice'}.pdf`);
    } catch (e) {
      setError('Could not generate PDF. Please use print instead.');
      console.error(e);
    } finally {
      setStreaming(false);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────
  const handlePrint = async () => {
    setStreaming(true);
    try {
      document.body.classList.add('print-bill-mode');
      await new Promise(r => setTimeout(r, 60));
      window.print();
    } finally {
      document.body.classList.remove('print-bill-mode');
      setStreaming(false);
    }
  };

  // ── Share via Web Share ────────────────────────────────────────────
  const handleShare = async () => {
    if (!navigator.share) return;
    const params = `text=${encodeURIComponent(`Your bill from ${BRAND.name} — ${order?.orderNumber} | Total: INR ${formatINR(total)}`)}`;
    try { await navigator.share({ text: params }); } catch (err) { void err; }
  };

  const toolbar = (
    <Toolbar
      onDownload={downloadPDF}
      onPrint={handlePrint}
      onShare={handleShare}
      streaming={streaming}
    />
  );

  // ── MODAL ──
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl max-h-[94vh] flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Your Bill</h3>
              <span className="text-xs text-white/50 font-medium">{order?.orderNumber}</span>
            </div>
            {toolbar}
          </div>
          <div className="flex-1 overflow-y-auto rounded-2xl shadow-2xl">
            <div ref={billRef}>
              <BillPaper order={order} />
            </div>
          </div>
          <button onClick={onClose} className="mx-auto px-8 py-2.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all text-sm">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 max-w-sm mx-auto">
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  // ── Inline ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1A1510] text-primary-light">
            <Share2 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bill Preview</h3>
            <p className="text-xs text-slate-400 font-medium">{order?.orderNumber}</p>
          </div>
        </div>
        {toolbar}
      </div>
      <div ref={billRef}>
        <BillPaper order={order} />
      </div>
    </div>
  );
};

export default Bill;
export { BillPaper };