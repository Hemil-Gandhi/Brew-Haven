import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { LogIn, Loader2, Coffee } from 'lucide-react';

const Login = () => {
  const [roleMode, setRoleMode] = useState('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex bg-secondary-dark font-sans selection:bg-primary/30">
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

        <div className="relative z-10 flex items-center space-x-3">
           <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-14 h-14 rounded-xl shadow-lg shadow-primary/20 object-contain bg-white/10 backdrop-blur-md border border-white/10 p-1" />
           <span className="text-xl font-bold tracking-widest text-white uppercase origin-left">
              Brew Haven
           </span>
        </div>

        <div className="relative z-10 max-w-sm">
           <p className="border-l-2 border-primary pl-4 text-slate-300 font-medium text-lg leading-relaxed shadow-sm">
             "Redefining the modern cafe experience through elegant, fluid Point-of-Sale architecture."
           </p>
        </div>
      </div>

      {/* Right Plate - Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative">
         {/* Subtle background glow effect */}
         <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="w-full max-w-md relative z-10 animate-slide-up">
            <div className="mb-10 text-center lg:text-left">
               <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Sign In</h1>
               <p className="text-slate-400 font-medium text-lg">
                  Access your premier management portal.
               </p>
            </div>

            {error && (
              <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-medium animate-slide-up">
                <div className="w-1.5 h-full min-h-[2px] bg-red-400 rounded-full"></div>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
                {['customer', 'staff', 'admin'].map(r => (
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
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                      roleMode === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all font-medium placeholder-slate-600"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                    <button type="button" onClick={() => alert('Please contact your administrator to reset your password.')} className="text-xs font-bold text-primary hover:text-primary-light transition-colors">Forgot?</button>
                  </div>
                  <input
                    type="password"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all font-medium placeholder-slate-600 tracking-widest"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(180,143,96,0.5)] hover:bg-primary-light hover:shadow-[0_0_60px_-15px_rgba(180,143,96,0.6)] transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
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
              </div>
            </form>

            <div className="mt-10 flex flex-col items-center space-y-4">
               <button onClick={fillDemo} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors border border-slate-700 rounded-full px-4 py-2 hover:bg-slate-800">
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
  );
};

export default Login;
