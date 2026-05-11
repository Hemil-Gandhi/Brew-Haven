import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { Coffee, ShoppingBag, Utensils, LogOut } from 'lucide-react';

const CustomerOrderType = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-dark flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-3">
          <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-12 h-12 rounded-2xl object-contain bg-white/10 p-0.5 shadow-lg shadow-primary/30" />
          <div>
            <h1 className="text-lg font-black text-white leading-none">Brew Haven</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Welcome, {user?.name?.split(' ')[0]} 👋</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold border border-white/10 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Subtle background glow */}
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-4xl relative z-10 animate-slide-up">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">How would you like<br/>your order?</h2>
            <p className="text-slate-400 font-medium text-xl">Select your preferred dining experience to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => navigate('/customer/tables')}
              className="flex flex-col items-center justify-center p-16 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(180,143,96,0.2)] active:scale-95"
            >
               <div className="w-28 h-28 bg-slate-800 group-hover:bg-primary rounded-[2rem] flex items-center justify-center mb-8 transition-colors duration-300 shadow-xl border border-white/10">
                  <Utensils className="w-12 h-12 text-white" />
               </div>
               <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Dine-In</h3>
               <p className="text-slate-400 text-center font-medium text-lg leading-relaxed">Relax and enjoy your meal at one of our comfortable tables.</p>
            </button>

            <button 
              onClick={() => navigate('/self-ordering/takeaway')}
              className="flex flex-col items-center justify-center p-16 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(180,143,96,0.2)] active:scale-95"
            >
               <div className="w-28 h-28 bg-slate-800 group-hover:bg-primary rounded-[2rem] flex items-center justify-center mb-8 transition-colors duration-300 shadow-xl border border-white/10">
                  <ShoppingBag className="w-12 h-12 text-white" />
               </div>
               <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Takeaway</h3>
               <p className="text-slate-400 text-center font-medium text-lg leading-relaxed">Grab your freshly prepared order to go. Skip the table selection.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderType;
