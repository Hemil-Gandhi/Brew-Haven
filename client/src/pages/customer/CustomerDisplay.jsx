import React, { useState, useEffect } from 'react';
import useAppStore, { socket } from '../../store/useAppStore';
import { ShoppingBag, Star, Sparkles, CheckCircle2, IndianRupee } from 'lucide-react';

const CustomerDisplay = () => {
  const { orders, fetchOrders } = useAppStore();
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    socket.on('order_status_updated', (data) => {
      setActiveOrder(data);
    });
    return () => socket.off('order_status_updated');
  }, [fetchOrders]);

  // For demo, we'll just show the latest open order
  useEffect(() => {
    if (orders.length > 0) {
      setActiveOrder(orders[orders.length - 1]);
    }
  }, [orders]);

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans">
      {/* Brand Side (Left) */}
      <div className="w-1/2 bg-slate-900 flex flex-col p-12 text-white relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px]"></div>
         </div>
         
         <div className="flex items-center space-x-3 z-10">
            <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-14 h-14 rounded-2xl object-contain bg-white/10 p-1" />
            <span className="text-2xl font-black tracking-tighter">Brew Haven</span>
         </div>

         <div className="flex-1 flex flex-col justify-center max-w-lg z-10">
            <h1 className="text-6xl font-black mb-6 leading-tight">Welcome to Brew Haven!</h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-12">
               Your satisfaction is our priority. Please check your order details on the right.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                     <Star className="text-amber-400 w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold">Fresh Ingredients</h4>
                    <p className="text-sm text-slate-500">Sourced daily</p>
                  </div>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                     <Sparkles className="text-primary-light w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Fast Service</h4>
                    <p className="text-sm text-slate-500">Ready in 10 mins</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="z-10 bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Special</p>
               <h3 className="text-xl font-bold">Mocha Caramel Swirl</h3>
            </div>
            <span className="text-2xl font-black text-primary-light">₹4.50</span>
         </div>
      </div>

      {/* Order Side (Right) */}
      <div className="w-1/2 flex flex-col bg-slate-50 border-l border-slate-200 shadow-2xl">
        <div className="p-12 pb-6 flex items-center justify-between border-b border-slate-200 bg-white">
           <div>
              <h2 className="text-4xl font-black text-slate-900 mb-1">Current Order</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                Number: {activeOrder?.orderNumber || '---'}
              </p>
           </div>
           {activeOrder?.paymentStatus === 'Paid' && (
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-600 px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/10">
                 <CheckCircle2 className="w-6 h-6" />
                 <span>PAID</span>
              </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-6">
           {activeOrder?.items.map((item, i) => (
             <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm animate-slide-up">
                <div className="flex items-center space-x-6">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400">
                      {item.quantity}
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-slate-800">{item.name}</h4>
                      {item.variant && <p className="text-xs font-black text-primary uppercase tracking-wider">{item.variant}</p>}
                   </div>
                </div>
                <span className="text-2xl font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
             </div>
           ))}
           {!activeOrder && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24">
                 <ShoppingBag className="w-32 h-32 mb-6 opacity-5" />
                 <p className="text-2xl font-bold italic opacity-20">Ordering in progress...</p>
              </div>
           )}
        </div>

        <div className="p-12 border-t border-slate-200 bg-white">
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount Due</p>
                 <div className="flex items-center space-x-2">
                    <IndianRupee className="w-8 h-8 text-primary font-black" />
                    <span className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
                       {activeOrder?.totalAmount.toFixed(2) || '0.00'}
                    </span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Order Status</p>
                 <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${
                   activeOrder?.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                 }`}>
                   {activeOrder?.paymentStatus || 'Waiting'}
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDisplay;
