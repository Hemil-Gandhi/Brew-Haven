import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { Layers, Coffee, Clock, LogOut, ChefHat, Settings } from 'lucide-react';

const FloorView = () => {
  const { floors, tables, fetchFloors, fetchTables, activeSession, fetchActiveSession, user, logout } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFloors();
    fetchTables();
    fetchActiveSession();
  }, [fetchFloors, fetchTables, fetchActiveSession]);

  const handleTableClick = (table) => {
    if (!activeSession) {
      alert('Please open a POS session in the backend first.');
      return;
    }
    navigate(`/pos/order/${table._id}`);
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-white border-slate-200 text-slate-800 hover:border-primary/30';
      case 'Occupied': return 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] scale-[1.02]';
      case 'Reserved': return 'bg-amber-400 border-amber-400 text-amber-900 shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)]';
      default: return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* POS Top Nav */}
      <header className="bg-secondary-dark text-slate-100 p-4 flex items-center justify-between shadow-2xl relative z-10 border-b border-white/5">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-0.5" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-primary-light">Brew Haven</h1>
          </div>
          <div className="flex space-x-1 p-1 bg-white/5 rounded-xl border border-white/10">
             <button className="px-5 py-2 bg-white/10 rounded-lg text-sm font-bold flex items-center space-x-2 text-white shadow-lg">
                <Layers className="w-4 h-4" />
                <span>Floor Plan</span>
             </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
             <Clock className="w-4 h-4 text-primary-light" />
             <span className="text-sm font-medium">{activeSession ? 'Session Active' : 'No Session'}</span>
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/backend')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Backend
            </button>
          )}
          <button 
            onClick={() => navigate('/kitchen')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            Kitchen
          </button>
          <button 
            onClick={logout}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Floor Selector */}
      <div className="p-8 flex-1">
        {floors.map((floor) => (
          <div key={floor._id} className="mb-12 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center space-x-3">
               <span className="w-2 h-8 bg-primary rounded-full"></span>
               <span>{floor.name}</span>
            </h2>
            
            <div className="flex flex-wrap gap-8 items-center justify-center lg:justify-start lg:pl-10">
              {tables.filter(t => t.floorId?._id === floor._id || t.floorId === floor._id).map((table) => (
                <button
                  key={table._id}
                  onClick={() => handleTableClick(table)}
                  className={`relative w-40 h-40 rounded-full border-2 transition-all duration-300 group flex flex-col items-center justify-center space-y-2 ${getTableStatusColor(table.status)}`}
                >
                  <div className={`p-3 rounded-full transition-all ${
                    table.status === 'Occupied' ? 'bg-white text-emerald-500 shadow-sm' : 
                    table.status === 'Reserved' ? 'bg-amber-900/10 text-amber-900' :
                    'bg-slate-100/50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <Coffee className="w-6 h-6" />
                  </div>
                  
                  <div className="text-center mt-1">
                    <p className={`text-2xl font-black ${table.status === 'Occupied' ? 'text-white' : ''}`}>{table.number}</p>
                  </div>

                  {/* Seat indicators (Dots around or below) */}
                  <div className="flex items-center space-x-1.5 opacity-60">
                    {[...Array(table.seats || 2)].map((_, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full ${table.status === 'Occupied' ? 'bg-white' : table.status === 'Reserved' ? 'bg-amber-900' : 'bg-slate-300'} shadow-sm`}></div>
                    ))}
                  </div>

                  {table.status === 'Occupied' && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-white border border-emerald-500 shadow-sm"></span>
                    </div>
                  )}
                  
                  {table.status !== 'Occupied' && table.status !== 'Reserved' && (
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {floors.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <Layers className="w-16 h-16 mb-4 opacity-10" />
             <p className="text-xl font-medium">No floors or tables configured.</p>
             <button onClick={() => navigate('/backend/floors')} className="mt-4 text-primary font-bold hover:underline">
                Go to Configuration
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorView;
