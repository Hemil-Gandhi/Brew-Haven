import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { LogIn, Loader2, Coffee, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ChefHat, Users } from 'lucide-react';

const roleMeta = {
  customer: { icon: Users, label: 'Customer' },
  staff: { icon: ChefHat, label: 'Staff' },
  admin: { icon: ShieldCheck, label: 'Admin' },
};

const Login = () => {
  const [roleMode, setRoleMode] = useState('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      const userRole = res.user.role;
      if (userRole === 'customer') {
        setTimeout(() => navigate('/customer/order-type'), 400);
      } else if (userRole === 'admin') {
        setTimeout(() => navigate('/backend'), 400);
      } else {
        setTimeout(() => navigate('/pos/floor'), 400);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  // Seed user auto-fill handler for demo ease
  const fillDemo = () => {
    if (roleMode === 'customer') setEmail('customer@cafe.com');
    else if (roleMode === 'admin') setEmail('admin@cafe.com');
    else setEmail('staff@cafe.com');

    setPassword('password');
  };

  return (
    <div className="min-h-screen flex bg-secondary-dark font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Ambient floating blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[8%] left-[12%] w-[420px] h-[420px] bg-primary/15 rounded-full blur-[130px] animate-float-blob"></div>
        <div className="absolute bottom-[5%] right-[18%] w-[380px] h-[380px] bg-accent/10 rounded-full blur-[130px] animate-float-blob-delay"></div>
        <div className="absolute top-[45%] right-[42%] w-[260px] h-[260px] bg-wood/10 rounded-full blur-[100px] animate-float-blob"></div>
      </div>

      {/* Left Plate - Image & Branding */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
           <img
              src="/premium_cafe_hero.png"
              alt="Premium Cafe Atmosphere"
              className="w-full h-full object-cover object-center animate-pulse-subtle scale-105"
           />
           {/* Deep gradient overlay to blend into the dark slate */}
           <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark/60 via-secondary-dark/40 to-secondary-dark"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center space-x-3 animate-fade-in-up">
           <div className="w-14 h-14 rounded-2xl shadow-xl shadow-primary/30 bg-white/10 backdrop-blur-md border border-white/15 p-1.5 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-primary-light" />
           </div>
           <div>
              <span className="text-xl font-bold tracking-widest text-white uppercase origin-left font-display">
                 Brew Haven
              </span>
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary-light font-bold mt-0.5">Premium Café & Restaurant</p>
           </div>
        </div>

        <div className="relative z-10 max-w-sm animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
           <div className="flex items-center space-x-3 mb-6">
              <span className="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                 <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" /> Est. Excellence
              </span>
           </div>
           <p className="border-l-2 border-primary pl-4 text-slate-300 font-medium text-lg leading-relaxed shadow-sm">
             "Redefining the modern cafe experience through elegant, fluid Point-of-Sale architecture."
           </p>
           <div className="mt-8 grid grid-cols-3 gap-4">
              {[{v: '3', l: 'Zones'}, {v: '50+', l: 'Dishes'}, {v: '24/7', l: 'Live Sync'}].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                  <p className="text-lg font-black text-primary-light">{s.v}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{s.l}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Plate - Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative">
         <div className="w-full max-w-md relative z-10">
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] animate-fade-in-up">
               <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_50px_-10px_rgba(200,155,94,0.6)] animate-pulse-subtle">
                     <Coffee className="w-8 h-8 text-secondary-dark" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-light mb-2">Welcome back</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight font-display">Sign in to Brew Haven</h1>
                  <p className="text-slate-400 font-medium">
                     From the espresso bar to the kitchen — all in one place.
                  </p>
               </div>

               {error && (
                 <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm font-medium animate-slide-up">
                   <div className="w-1.5 h-full min-h-[2px] bg-red-400 rounded-full"></div>
                   <p>{error}</p>
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-5">
                 {/* Role selector */}
                 <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1.5">
                   {['customer', 'staff', 'admin'].map(r => {
                     const meta = roleMeta[r];
                     const Icon = meta.icon;
                     return (
                       <button
                         key={r}
                         type="button"
                         onClick={() => {
                             setRoleMode(r);
                             if(email.includes('@cafe.com') || email === '') {
                                setEmail(`${r}@cafe.com`);
                                setPassword('password');
                             }
                         }}
                         className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                           roleMode === r ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]' : 'text-slate-500 hover:text-slate-300'
                         }`}
                       >
                         <Icon className="w-3.5 h-3.5" />
                         {meta.label}
                       </button>
                     );
                   })}
                 </div>

                 <div>
                   <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input
                       type="email"
                       className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all font-medium placeholder-slate-600"
                       placeholder="you@brewhaven.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                     />
                   </div>
                 </div>
                 <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                     <button type="button" onClick={() => alert('Please contact your administrator to reset your password.')} className="text-xs font-bold text-primary hover:text-primary-light transition-colors">Forgot?</button>
                   </div>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input
                       type={showPassword ? 'text' : 'password'}
                       className="w-full pl-11 pr-11 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all font-medium placeholder-slate-600 tracking-widest"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(v => !v)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-primary-light transition-colors"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>

                 <button
                   type="submit"
                   disabled={loading}
                   className="btn-shine w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(180,143,96,0.5)] hover:brightness-110 hover:shadow-[0_0_60px_-15px_rgba(180,143,96,0.6)] transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                 >
                   {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                   ) : (
                      <>
                        <span>Authenticate</span>
                        <LogIn className="w-5 h-5 opacity-80" />
                      </>
                   )}
                 </button>
               </form>

               <div className="mt-8 flex flex-col items-center space-y-4">
                  <button onClick={fillDemo} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors border border-slate-700 rounded-full px-5 py-2.5 hover:bg-slate-800 hover:border-primary/40">
                     Use Demo Account
                  </button>
                  <p className="text-slate-400 font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:text-primary-light font-bold transition-colors">Apply here</Link>
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;