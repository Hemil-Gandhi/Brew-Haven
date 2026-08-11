import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReceiptModal from '../../components/ReceiptModal';
import useAppStore from '../../store/useAppStore';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  QrCode, 
  ChevronRight,
  IndianRupee,
  Undo2,
  Printer,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PaymentScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { updateOrderStatus } = useAppStore();
  
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amountTendered, setAmountTendered] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId === 'new') { setLoadingOrder(false); return; }
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (e) {
        console.error('Could not load order', e);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loadingOrder) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-xl font-bold animate-pulse">Loading Order...</div>
    </div>
  );

  if (!order && orderId !== 'new') return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
      <p className="text-xl font-bold">Order not found.</p>
      <button onClick={() => navigate('/pos/floor')} className="px-6 py-3 bg-primary rounded-xl font-bold">Back to Tables</button>
    </div>
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      await updateOrderStatus(order._id, {
        paymentStatus: 'Paid',
        paymentMethod: selectedMethod,
        status: 'Completed'
      });
      setOrder(prev => ({ ...prev, paymentStatus: 'Paid', paymentMethod: selectedMethod, status: 'Completed' }));
      setPaymentSuccess(true);
    } catch (e) {
      void e;
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const changeDue = parseFloat(amountTendered) - (order?.totalAmount || 0);
  const upiId = 'hemilgandhi904@oksbi';
  const upiLink = `upi://pay?pa=${upiId}&pn=Brew%20Haven&am=${order?.totalAmount}&cu=INR`;
  const subtotal = order?.items.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const taxAmount = (order?.totalAmount || 0) - subtotal;
  const paidAt = order?.createdAt ? new Date(order.createdAt) : null;
  const paidAtLabel = paidAt
    ? paidAt.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3A2C21] via-[#1E1510] to-[#12100D] flex items-center justify-center p-6 text-center">
         {order && <ReceiptModal order={order} selectedMethod={selectedMethod} amountTendered={amountTendered} />}
         <div className="max-w-md w-full animate-slide-up">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-primary-light/20">
               <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 font-display">Payment Success!</h1>
            <p className="text-slate-400 mb-8">Order <span className="font-bold text-slate-300">{order?.orderNumber}</span> has been finalized.</p>
            
            {/* Receipt Summary Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl text-left space-y-3">
               <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px] pb-3 border-b border-white/10">
<span>Order Summary</span>
                   <span>{paidAtLabel}</span>
               </div>
               {order?.items.map((item, i) => (
                 <div key={i} className="flex justify-between text-sm">
                   <span className="text-slate-300">{item.quantity}× {item.name} {item.variant && `(${item.variant})`}</span>
                   <span className="text-white font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                 </div>
               ))}
               <div className="flex justify-between items-end pt-3 border-t border-white/10 mt-3">
                  <div className="w-full">
                     <div className="flex justify-between text-slate-400 text-xs mb-1">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-slate-400 text-xs mb-3">
                        <span>Tax</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-end border-t border-white/10 pt-3">
                        <div>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total Paid</p>
                           <span className="text-3xl font-black text-white">₹{(order?.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold border border-emerald-500/30">{selectedMethod}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col space-y-3">
               <button onClick={() => navigate('/pos/floor')} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark transition-all active:scale-95 shadow-xl shadow-primary/20">
                  ← Back to Tables
               </button>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      document.getElementById('print-receipt').style.display = 'block';
                      window.print();
                      document.getElementById('print-receipt').style.display = 'none';
                    }}
                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                  >
                     <Printer className="w-5 h-5" />
                     <span>Receipt</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/bill/${order?._id}`)}
                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center space-x-2 border border-white/20"
                  >
                     <FileText className="w-5 h-5" />
                     <span>Full Bill</span>
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </button>
          <h2 className="text-lg sm:text-xl font-black text-slate-800">Checkout</h2>
        </div>
        <div className="bg-slate-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold">
           ORDER: {order?.orderNumber}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6 overflow-y-auto">
         {/* Order Summary */}
         <div className="w-full lg:w-96 flex flex-col gap-4 lg:gap-6">
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-6">Order Total</p>
               <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter">₹{(order?.totalAmount || 0).toFixed(2)}</h3>
               
               <div className="mt-8 space-y-4">
                  {order?.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                       <span className="text-slate-500 font-bold">{item.quantity}x {item.name} {item.variant && `(${item.variant})`}</span>
                       <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Wallet className="w-32 h-32" />
               </div>
               <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Table Info</p>
               <h4 className="text-3xl font-black">Table {order?.tableId?.number}</h4>
               <p className="text-slate-400 font-medium">Waitstaff: Current User</p>
            </div>
         </div>

         {/* Payment Methods */}
         <div className="flex-1 space-y-4 lg:space-y-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-800">Select Payment Method</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
               {[
                 { id: 'Cash', icon: Wallet, color: 'bg-emerald-500' },
                 { id: 'Digital', icon: CreditCard, color: 'bg-primary' },
                 { id: 'UPI QR', icon: QrCode, color: 'bg-amber-500' },
               ].map((method) => (
                 <button
                   key={method.id}
                   onClick={() => setSelectedMethod(method.id)}
                   className={`p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center space-y-2 sm:space-y-4 group ${
                     selectedMethod === method.id 
                     ? 'border-primary bg-white shadow-2xl scale-105' 
                     : 'border-white bg-white hover:border-slate-200'
                   }`}
                 >
                    <div className={`p-4 rounded-3xl ${selectedMethod === method.id ? method.color : 'bg-slate-100 text-slate-400'} text-white transition-all`}>
                       <method.icon className="w-8 h-8" />
                    </div>
                    <span className={`font-black text-lg ${selectedMethod === method.id ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                       {method.id}
                    </span>
                 </button>
               ))}
            </div>

            {/* Method Details */}
            {selectedMethod === 'Cash' && (
               <div className="bg-white p-8 rounded-[2rem] border-2 border-primary animate-slide-up space-y-6">
                  <h4 className="text-xl font-black flex items-center space-x-2">
                     <Wallet className="w-6 h-6 text-emerald-500" />
                     <span>Cash Payment</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount Tendered</label>
                        <div className="relative">
                           <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                           <input
                              type="number"
                              className="w-full pl-12 pr-4 py-6 bg-slate-50 border-none rounded-2xl text-4xl font-black text-slate-800 focus:ring-2 focus:ring-primary/20"
                              placeholder="0.00"
                              value={amountTendered}
                              onChange={(e) => setAmountTendered(e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="flex flex-col justify-end">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Change Due</p>
                        <p className={`text-4xl font-black ${changeDue >= 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                           ₹{changeDue >= 0 ? changeDue.toFixed(2) : '0.00'}
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {selectedMethod === 'UPI QR' && (
               <div className="bg-white p-8 rounded-[2rem] border-2 border-primary animate-slide-up flex flex-col md:flex-row items-center gap-12">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] shadow-inner border border-slate-100">
                     <QRCodeSVG value={upiLink} size={250} level="H" />
                  </div>
                  <div className="flex-1 space-y-6 text-center md:text-left">
                     <h4 className="text-3xl font-black text-slate-800">Scan to Pay</h4>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        Customers can scan this QR code with any UPI app like GPay, PhonePe, or Paytm to complete the payment of <b>₹{(order?.totalAmount || 0).toFixed(2)}</b>.
                     </p>
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 inline-block text-amber-700 font-bold text-sm">
                        Merchant: {upiId}
                     </div>
                  </div>
               </div>
            )}

            {selectedMethod && (
               <div className="pt-6">
                  <button
                    onClick={handlePayment}
                    disabled={loading || (selectedMethod === 'Cash' && changeDue < 0)}
                    className="w-full py-6 bg-primary text-white rounded-3xl font-black text-2xl hover:bg-primary-dark transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                     <span>Confirm Payment</span>
                     <ChevronRight className="w-8 h-8" />
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
