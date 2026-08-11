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
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Warm café atmosphere */}
        <div className="absolute top-[18%] left-[50%] -translate-x-1/2 w-[640px] h-[640px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[420px] h-[420px] bg-[#7a542c]/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(#e7c37f 1px, transparent 1.5px)', backgroundSize: '26px 26px' }}></div>

        <div className="w-full max-w-4xl relative z-10 animate-slide-up">
          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary-light mb-4">Brewed to Perfection</p>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight font-display">How would you like<br/>your order?</h2>
            <p className="text-slate-400 font-medium text-xl">Select your preferred dining experience to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button 
              onClick={() => navigate('/customer/tables')}
              className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[2rem] sm:rounded-[3rem] hover:bg-gradient-to-b hover:from-primary/15 hover:to-white/[0.04] hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(200,155,94,0.25)] active:scale-95"
            >
               <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-secondary-dark group-hover:bg-primary rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 transition-colors duration-300 shadow-xl border border-primary/20 group-hover:border-primary-light/40">
                  <Utensils className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-light group-hover:text-white" />
               </div>
               <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-4 tracking-tighter font-display">Dine-In</h3>
               <p className="text-slate-400 text-center font-medium text-sm sm:text-base lg:text-lg leading-relaxed">Relax and enjoy your meal at one of our comfortable tables.</p>
               <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">Settle in & savor →</span>
            </button>

            <button 
              onClick={() => navigate('/self-ordering/takeaway')}
              className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[2rem] sm:rounded-[3rem] hover:bg-gradient-to-b hover:from-primary/15 hover:to-white/[0.04] hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(200,155,94,0.25)] active:scale-95"
            >
               <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-secondary-dark group-hover:bg-primary rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 transition-colors duration-300 shadow-xl border border-primary/20 group-hover:border-primary-light/40">
                  <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-light group-hover:text-white" />
               </div>
               <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-4 tracking-tighter font-display">Takeaway</h3>
               <p className="text-slate-400 text-center font-medium text-sm sm:text-base lg:text-lg leading-relaxed">Grab your freshly prepared order to go. Skip the table selection.</p>
               <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">On the go →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderType;
