import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore, { socket } from '../../store/useAppStore';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Utensils, 
  Check, 
  ArrowRight,
  ArrowLeft,
  Monitor,
  Bell,
  LogOut,
  Timer,
  AlertCircle
} from 'lucide-react';

const KitchenDisplay = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, updateOrderStatus, logout } = useAppStore();
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [now, setNow] = useState(new Date());

  // Live timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOrders();
    
    socket.on('order_received', (order) => {
      setKitchenOrders(prev => [order, ...prev]);
    });

    socket.on('order_status_updated', (data) => {
      setKitchenOrders(prev => prev.map(o => o._id === data._id ? data : o));
    });

    return () => {
      socket.off('order_received');
      socket.off('order_status_updated');
    };
  }, [fetchOrders]);

  useEffect(() => {
    // Filter open orders for kitchen
    setKitchenOrders(orders.filter(o => o.status === 'Open'));
  }, [orders]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const moveOrderStage = async (orderId, currentStatus, itemId = null) => {
    const order = kitchenOrders.find(o => o._id === orderId);
    if (!order) return;

    let updatedItems = [...order.items];
    if (itemId) {
      // Update individual item
      updatedItems = updatedItems.map(item => {
        if (item._id === itemId) {
          const stages = ['To Cook', 'Preparing', 'Completed'];
          const nextStage = stages[stages.indexOf(item.kitchenStatus) + 1] || 'Completed';
          return { ...item, kitchenStatus: nextStage };
        }
        return item;
      });
    } else {
      // Update whole order
      const stages = ['To Cook', 'Preparing', 'Completed'];
      const nextStage = stages[stages.indexOf(currentStatus) + 1] || 'Completed';
      updatedItems = updatedItems.map(item => ({ ...item, kitchenStatus: nextStage }));
    }

    try {
      const isOrderComplete = updatedItems.every(i => i.kitchenStatus === 'Completed');
      const updateData = { items: updatedItems };
      if (isOrderComplete) {
        updateData.status = 'Completed';
      }
      await updateOrderStatus(orderId, updateData);
    } catch (error) {
      console.error('Failed to update kitchen status');
    }
  };

  const getStageOrders = (stage) => kitchenOrders.filter(o => {
    if (filterType !== 'All' && o.type !== filterType) return false;
    // An order is in a stage if its items are largely in that stage
    // For simplicity, we'll use the status of the first item
    return o.items[0]?.kitchenStatus === stage;
  });

  const formatElapsedTime = (createdAt) => {
    const elapsedMs = now - new Date(createdAt);
    const totalMins = Math.floor(elapsedMs / 60000);
    const secs = Math.floor((elapsedMs % 60000) / 1000);
    return {
      text: `${totalMins}m ${secs}s`,
      isDelayed: totalMins >= 15,
      isWarning: totalMins >= 10 && totalMins < 15
    };
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col text-slate-100 overflow-hidden font-sans">
      {/* Redesigned Navbar */}
      <header className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shadow-2xl relative z-10">
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => navigate('/backend')}
             className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 text-white shadow-lg"
             title="Back to Dashboard"
           >
             <ArrowLeft className="w-6 h-6" />
           </button>
           <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-12 h-12 rounded-2xl object-contain bg-white/10 p-0.5 shadow-lg shadow-primary/30" />
           <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-white">Kitchen Display System</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live Sync Active</p>
              </div>
           </div>
        </div>

        {/* Filter Toggle Group */}
        <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-slate-700">
          {['All', 'Dine-in', 'Self-order', 'Takeaway'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filterType === type 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex flex-col items-end mr-4">
             <span className="text-sm font-bold text-slate-300">{now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
             <span className="text-xs text-slate-500 font-black tracking-widest">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
           </div>
           <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all border border-slate-600 text-sm font-bold text-white">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
           </button>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex p-6 gap-6 scrollbar-dark">
        {['To Cook', 'Preparing', 'Completed'].map((stage, idx) => (
          <div key={stage} className="flex-1 min-w-[400px] bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-6 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${
                    idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                  <h3 className="text-xl font-black uppercase tracking-wider">{stage}</h3>
               </div>
               <span className="bg-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black border border-slate-700 tracking-widest text-slate-300">
                 {getStageOrders(stage).length} TICKETS
               </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
              {getStageOrders(stage).map(order => {
                const time = formatElapsedTime(order.createdAt);
                
                return (
                <div key={order._id} className={`bg-slate-800 p-6 rounded-3xl border shadow-xl animate-slide-up relative overflow-hidden group transition-all ${
                  time.isDelayed && stage !== 'Completed' ? 'border-rose-500/50 shadow-rose-500/10' : 'border-slate-700'
                }`}>
                  {/* Progress Line */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>

                  <div className="flex justify-between items-start mb-5">
                     <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="text-2xl font-black text-white leading-none">#{order.orderNumber}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            order.type === 'Self-order' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {order.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Table {order.tableId?.number || 'N/A'}
                        </p>
                     </div>
                     <button 
                       onClick={() => moveOrderStage(order._id, stage)}
                       className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all border border-primary/20 group-hover:scale-105"
                     >
                       <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Order Progress Visualization */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Progress</span>
                       <span className="text-[10px] font-bold text-white tracking-widest">
                         {order.items.filter(i => i.kitchenStatus === 'Completed').length}/{order.items.length}
                       </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/50">
                       <div 
                         className={`h-full transition-all duration-1000 ${
                           idx === 0 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                           idx === 1 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                           'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                         }`}
                         style={{ width: `${(order.items.filter(i => i.kitchenStatus === 'Completed').length / order.items.length) * 100}%` }}
                       ></div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                     {order.items.map((item, i) => (
                       <div 
                         key={i} 
                         onClick={() => moveOrderStage(order._id, null, item._id)}
                         className={`flex items-start justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                            item.kitchenStatus === 'Completed' 
                            ? 'bg-slate-900/50 border-transparent opacity-50 grayscale' 
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                         }`}
                       >
                          <div className="flex items-center space-x-4">
                             <span className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-lg text-primary shadow-inner border border-slate-700/50">
                                {item.quantity}
                             </span>
                             <div>
                                <p className={`font-bold text-sm ${item.kitchenStatus === 'Completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                  {item.name}
                                </p>
                                {item.variant && <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{item.variant}</p>}
                             </div>
                          </div>
                          {item.kitchenStatus === 'Completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                       </div>
                     ))}
                  </div>

                  {/* Redesigned Footer with Live SLA Tracker */}
                  <div className="mt-6 pt-5 border-t border-slate-700 flex justify-between items-center bg-slate-900/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-3xl">
                     <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                       stage === 'Completed' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                       time.isDelayed ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                       time.isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                       'bg-slate-800 border-slate-700 text-slate-300'
                     }`}>
                        {stage === 'Completed' ? <Check className="w-4 h-4" /> : 
                         time.isDelayed ? <AlertCircle className="w-4 h-4 animate-pulse" /> : 
                         <Timer className="w-4 h-4" />}
                        <span className="text-xs font-black tracking-widest">{stage === 'Completed' ? 'DONE' : time.text}</span>
                     </div>
                     <div className="flex items-center space-x-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                  </div>
                </div>
              )})}
              
              {getStageOrders(stage).length === 0 && (
                <div className="h-48 flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-700/50 rounded-[2rem] bg-slate-800/20">
                   <Monitor className="w-12 h-12 mb-3 opacity-20" />
                   <p className="font-black text-xs uppercase tracking-widest opacity-40">No Tickets</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDisplay;
