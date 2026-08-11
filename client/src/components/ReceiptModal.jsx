import React from 'react';
import { X, Printer } from 'lucide-react';

/**
 * Shared Receipt component used across the entire app.
 * 
 * @param {object}   order    - The order object (items, totalAmount, orderNumber, tableId, type, paymentMethod, paymentStatus, createdAt)
 * @param {boolean}  isModal  - If true, renders inside a dismissable overlay modal (admin Reports)
 * @param {function} onClose  - Callback to close the modal (only used when isModal=true)
 * @param {string}   selectedMethod - Override for payment method display (used by PaymentScreen for pre-confirmation)
 * @param {number}   amountTendered - Cash tendered amount (optional, for cash change display)
 */
const ReceiptContent = ({ order, isModal, selectedMethod, amountTendered }) => {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const receiptDate = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const receiptTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const taxAmount = (order.totalAmount || 0) - subtotal;
  const payMethod = selectedMethod || order.paymentMethod || 'N/A';
  const changeDue = amountTendered ? parseFloat(amountTendered) - (order.totalAmount || 0) : null;

  return (
    <div id="print-receipt" style={{ display: isModal ? 'block' : 'none', fontFamily: '"Courier New", Courier, monospace', width: '100%', maxWidth: '300px', margin: '0 auto', color: '#000', backgroundColor: '#fff', padding: '16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <img src="/brew_haven_logo.png" alt="Brew Haven Logo" style={{ width: '60px', height: '60px', display: 'block', margin: '0 auto 10px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Brew Haven</h2>
        <p style={{ margin: '0', fontSize: '12px' }}>Premium Cafe & Restaurant</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>123 Coffee Lane, Brew City</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>Phone: +91 98765 43210</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>GSTIN: 22AAAAA0000A1Z5</p>
      </div>

      {/* Order Info */}
      <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '10px 0', marginBottom: '15px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Order No:</span> <span style={{ fontWeight: 'bold' }}>{order.orderNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Date:</span> <span>{receiptDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Time:</span> <span>{receiptTime}</span>
        </div>
        {order.tableId?.number && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Table:</span> <span style={{ fontWeight: 'bold' }}>{order.tableId.number}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Type:</span> <span>{order.type}</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '15px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
          <span style={{ flex: 1 }}>Item</span>
          <span style={{ width: '30px', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '60px', textAlign: 'right' }}>Amount</span>
        </div>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ flex: 1, paddingRight: '5px' }}>{item.name}{item.variant ? ` (${item.variant})` : ''}</span>
            <span style={{ width: '30px', textAlign: 'center' }}>{item.quantity}</span>
            <span style={{ width: '60px', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '15px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Taxes</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          <span>Total</span>
          <span>₹{order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', fontSize: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Payment Mode:</span>
          <span>{payMethod}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Status:</span>
          <span style={{ fontWeight: 'bold' }}>{order.paymentStatus || 'Unpaid'}</span>
        </div>
        {changeDue !== null && changeDue >= 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Cash Tendered:</span>
              <span>₹{parseFloat(amountTendered || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Change Due:</span>
              <span>₹{changeDue.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>*** Thank You For Visiting ***</p>
        <p style={{ margin: '0 0 10px 0' }}>Please come again</p>
        <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto 10px auto' }}></div>
        <p style={{ margin: '0', fontSize: '10px', fontWeight: 'bold' }}>Brew Haven POS</p>
      </div>
    </div>
  );
};

const ReceiptModal = ({ order, isModal = false, onClose, selectedMethod, amountTendered }) => {
  if (!order) return null;

  const handlePrint = () => {
    const receiptEl = document.getElementById('print-receipt');
    if (receiptEl) {
      const originalDisplay = receiptEl.style.display;
      receiptEl.style.display = 'block';
      window.print();
      receiptEl.style.display = originalDisplay;
    }
  };

  // ─── MODAL MODE (Admin Reports) ───
  if (isModal) {
    return (
      <div id="receipt-modal-overlay" className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>
        
        {/* Modal Card */}
        <div id="receipt-modal-card" className="relative z-10 bg-white rounded-[2rem] shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col animate-slide-up overflow-hidden">
          {/* Modal Header */}
          <div id="receipt-modal-header" className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="text-lg font-black text-slate-800">Receipt</h3>
              <p className="text-xs text-slate-400 font-medium">Order {order.orderNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Scrollable Receipt Body */}
          <div id="receipt-modal-body" className="flex-1 overflow-y-auto p-6 bg-white">
            <div id="receipt-modal-inner" className="bg-slate-50 rounded-2xl border border-slate-100 p-1 shadow-inner">
              <ReceiptContent order={order} isModal={isModal} selectedMethod={selectedMethod} amountTendered={amountTendered} />
            </div>
          </div>

          {/* Modal Footer */}
          <div id="receipt-modal-footer" className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── INLINE MODE (hidden for printing, used by customer flow & POS) ───
  return <ReceiptContent order={order} isModal={isModal} selectedMethod={selectedMethod} amountTendered={amountTendered} />;
};

export default ReceiptModal;
