import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import Bill from '../../components/Bill';
import { ArrowLeft, LogOut, Loader2, AlertCircle } from 'lucide-react';

const BillPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setOrder(data);
      } catch (e) {
        void e;
        setError('Unable to load this bill. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleBack = () => {
    if (!user) navigate('/');
    else if (user.role === 'admin' || user.role === 'staff') navigate('/backend');
    else navigate('/customer/order-type');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      {/* Top bar */}
      <header className="bg-[#1A1510] text-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-2xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-widest">Brew Haven</h1>
            <p className="text-[10px] text-primary-light font-bold uppercase tracking-widest">Bill / Invoice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <span className="hidden sm:block text-xs text-white/60 font-medium">
                {user.name} · {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8">
        {loading && (
          <div className="flex flex-col items-center justify-center text-slate-500 py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-bold text-sm">Fetching your bill…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center text-slate-400 py-24 gap-4 text-center">
            <AlertCircle className="w-14 h-14 opacity-40" />
            <p className="font-bold text-lg text-slate-500">{error}</p>
            <button onClick={handleBack} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
              Go Back
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-3">
            <Bill order={order} />
            <p className="text-center text-xs text-slate-400 font-medium pt-2">
              Download or print this bill for your records.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BillPage;