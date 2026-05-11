import React, { useState, useEffect } from 'react';
import useAppStore, { socket } from '../../store/useAppStore';
import { History, Play, CheckCircle2, IndianRupee, Calendar, User } from 'lucide-react';

const Sessions = () => {
  const { activeSession, sessions, fetchActiveSession, getSessions, openSession, closeSession, orders, fetchOrders } = useAppStore();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);

  useEffect(() => {
    fetchActiveSession();
    getSessions();
    fetchOrders();

    socket.on('order_received', fetchOrders);
    socket.on('order_status_updated', fetchOrders);

    return () => {
      socket.off('order_received', fetchOrders);
      socket.off('order_status_updated', fetchOrders);
    };
  }, [fetchActiveSession, getSessions, fetchOrders]);

  const runningTotal = activeSession ? (
    activeSession.openingBalance + 
    orders.filter(o => o.sessionId === activeSession._id && o.paymentStatus === 'Paid')
          .reduce((sum, o) => sum + o.totalAmount, 0)
  ) : 0;

  const handleOpenSession = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    await openSession({
      terminalId: 'TERM-01',
      staffId: user.id,
      openingBalance
    });
    setShowOpenModal(false);
  };

  const handleCloseSession = async (id) => {
    if (window.confirm('Are you sure you want to close this session?')) {
      await closeSession(id, { closingBalance: runningTotal });
      getSessions(); // Refresh to show the updated session history
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Active Session Status */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${activeSession ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
              <History className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {activeSession ? 'Current Session Active' : 'No Active Session'}
              </h3>
              <p className="text-slate-500">
                {activeSession 
                  ? `Started at ${new Date(activeSession.createdAt).toLocaleString()}` 
                  : 'Start a new session to begin taking orders.'}
              </p>
            </div>
          </div>
          {activeSession ? (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-400 uppercase">Running Total</p>
                <p className="text-xl font-bold text-slate-800">₹{runningTotal.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => handleCloseSession(activeSession._id)}
                className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-dark transition-all active:scale-95"
              >
                Close Session
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowOpenModal(true)}
              className="btn-primary flex items-center space-x-2 px-8 py-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Session History</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Session Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Responsible</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Opening Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Closing Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{new Date(session.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{new Date(session.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                       <User className="w-4 h-4" />
                       <span>{session.staffId?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">₹{session.openingBalance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {session.status === 'Closed' ? `₹${session.closingBalance?.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      session.status === 'Open' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="p-6 bg-slate-900 text-white flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <h3 className="text-xl font-bold">Open POS Session</h3>
                   <p className="text-xs text-slate-400">Initialize terminal for transactions</p>
                </div>
             </div>
            
            <form onSubmit={handleOpenSession} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Opening Balance (₹)</label>
                <div className="relative">
                   <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                   <input
                    type="number"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">The amount of cash currently in the register drawer.</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowOpenModal(false)} className="flex-1 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  Open Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
