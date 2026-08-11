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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveOrder(orders[orders.length - 1]);
    }
  }, [orders]);

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Brand Side (Left/Top) */}
      <div className="lg:w-1/2 bg-slate-900 flex flex-col p-6 sm:p-8 lg:p-12 text-white relative min-h-[30vh] lg:min-h-0">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[120px]"></div>
         </div>
         
         <div className="flex items-center space-x-3 z-10">
            <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl object-contain bg-white/10 p-1" />
            <span className="text-xl lg:text-2xl font-black tracking-tighter">Brew Haven</span>
         </div>

         <div className="flex-1 flex flex-col justify-center max-w-lg z-10 py-4 lg:py-0">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 lg:mb-6 leading-tight">Welcome to Brew Haven!</h1>
            <p className="text-base lg:text-xl text-slate-400 leading-relaxed mb-6 lg:mb-12 hidden sm:block">
               Your satisfaction is our priority. Please check your order details below.
            </p>
            
            <div className="grid grid-cols-2 gap-4 lg:gap-8 hidden sm:grid">
               <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                     <Star className="text-amber-400 w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm lg:text-base">Fresh Ingredients</h4>
                    <p className="text-xs lg:text-sm text-slate-500">Sourced daily</p>
                  </div>
               </div>
               <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                     <Sparkles className="text-primary-light w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm lg:text-base">Fast Service</h4>
                    <p className="text-xs lg:text-sm text-slate-500">Ready in 10 mins</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="z-10 bg-white/5 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/10 flex items-center justify-between hidden sm:flex">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Special</p>
               <h3 className="text-lg lg:text-xl font-bold">Mocha Caramel Swirl</h3>
            </div>
            <span className="text-xl lg:text-2xl font-black text-primary-light">₹4.50</span>
         </div>
      </div>

      {/* Order Side (Right/Bottom) */}
      <div className="flex-1 lg:w-1/2 flex flex-col bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl min-h-0">
        <div className="p-6 sm:p-8 lg:p-12 pb-4 lg:pb-6 flex items-center justify-between border-b border-slate-200 bg-white">
           <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1">Current Order</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">
                Number: {activeOrder?.orderNumber || '---'}
              </p>
           </div>
           {activeOrder?.paymentStatus === 'Paid' && (
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/10">
                 <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                 <span className="text-sm sm:text-base">PAID</span>
              </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 space-y-3 sm:space-y-4 lg:space-y-6">
           {activeOrder?.items.map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 sm:p-5 lg:p-6 bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm animate-slide-up">
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl lg:text-2xl text-slate-400">
                      {item.quantity}
                   </div>
                   <div>
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">{item.name}</h4>
                      {item.variant && <p className="text-xs font-black text-primary uppercase tracking-wider">{item.variant}</p>}
                   </div>
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
             </div>
           ))}
           {!activeOrder && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12 lg:py-24">
                 <ShoppingBag className="w-20 h-20 lg:w-32 lg:h-32 mb-4 lg:mb-6 opacity-5" />
                 <p className="text-lg lg:text-2xl font-bold italic opacity-20">Ordering in progress...</p>
              </div>
           )}
        </div>

        <div className="p-4 sm:p-6 lg:p-12 border-t border-slate-200 bg-white">
           <div className="flex justify-between items-end">
              <div>
                 <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Total Amount Due</p>
                 <div className="flex items-center space-x-1 sm:space-x-2">
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary font-black" />
                    <span className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                       {activeOrder?.totalAmount ? activeOrder.totalAmount.toFixed(2) : '0.00'}
                    </span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-1 sm:mb-2">Order Status</p>
                 <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest ${
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
