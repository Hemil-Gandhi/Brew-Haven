import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { Coffee, LogOut, Users, CheckCircle, Loader2 } from 'lucide-react';

const CustomerTableSelect = () => {
  const navigate = useNavigate();
  const { floors, tables, fetchFloors, fetchTables, user, logout } = useAppStore();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFloors(), fetchTables()]).finally(() => setLoading(false));
  }, [fetchFloors, fetchTables]);

  const handleSelect = (table) => {
    if (table.status === 'Occupied') return; // don't allow occupied tables
    setSelected(table);
  };

  const handleConfirm = () => {
    if (!selected) return;
    navigate(`/self-ordering/${selected.number}/session`);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatusStyle = (table) => {
    if (table._id === selected?._id) return 'ring-4 ring-primary bg-primary text-white shadow-[0_0_30px_rgba(180,143,96,0.5)] scale-105';
    if (table.status === 'Occupied') return 'bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed opacity-60';
    if (table.status === 'Reserved') return 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed opacity-60';
    return 'bg-white border-slate-200 text-slate-700 hover:border-primary/40 hover:shadow-lg cursor-pointer';
  };

  return (
    <div className="min-h-screen bg-secondary-dark flex flex-col font-sans">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5">
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
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[520px] h-[520px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="w-full max-w-xl animate-slide-up relative z-10">
          {/* Heading */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-light mb-3">Choose your seat</p>
            <h2 className="text-4xl font-black text-white mb-2 font-display">Where are you sitting?</h2>
            <p className="text-slate-400 font-medium">Select your table to begin ordering</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {floors.map(floor => {
                const floorTables = tables.filter(t => t.floorId?._id === floor._id || t.floorId === floor._id);
                if (!floorTables.length) return null;
                return (
                  <div key={floor._id} className="mb-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-white/5"></span>
                      {floor.name}
                      <span className="h-px flex-1 bg-white/5"></span>
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {floorTables.map(table => (
                        <button
                          key={table._id}
                          onClick={() => handleSelect(table)}
                          disabled={table.status === 'Occupied' || table.status === 'Reserved'}
                          className={`relative aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${getStatusStyle(table)}`}
                        >
                          {selected?._id === table._id && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <CheckCircle className="w-5 h-5 text-white drop-shadow-lg" />
                            </div>
                          )}
                          <Coffee className={`w-7 h-7 ${selected?._id === table._id ? 'text-white' : table.status !== 'Available' ? 'opacity-40' : 'text-slate-400'}`} />
                          <div className="text-center">
                            <p className={`text-2xl font-black ${selected?._id === table._id ? 'text-white' : ''}`}>{table.number}</p>
                            {table.status !== 'Available' && (
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{table.status}</p>
                            )}
                          </div>
                          {table.seats && (
                            <div className="flex gap-1">
                              {[...Array(Math.min(table.seats, 4))].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${selected?._id === table._id ? 'bg-white/60' : 'bg-slate-300'}`} />
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex justify-center gap-6 mb-8 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-slate-500"><span className="w-3 h-3 rounded-full bg-slate-200"></span>Available</span>
                <span className="flex items-center gap-2 text-slate-500"><span className="w-3 h-3 rounded-full bg-primary"></span>Selected</span>
                <span className="flex items-center gap-2 text-slate-500"><span className="w-3 h-3 rounded-full bg-rose-400"></span>Occupied</span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="w-full py-5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black text-xl hover:brightness-110 transition-all active:scale-95 shadow-2xl shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selected ? `Sit at Table ${selected.number} →` : 'Select a Table First'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTableSelect;
