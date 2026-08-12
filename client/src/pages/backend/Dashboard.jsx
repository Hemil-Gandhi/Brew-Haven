import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Layers, 
  Table as TableIcon, 
  History, 
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

// Sub-pages
import Products from './Products';
import Floors from './Floors';
import Tables from './Tables';
import Sessions from './Sessions';
import Reports from './Reports';
import BackendHome from './BackendHome';
import Inventory from './Inventory';

const Dashboard = () => {
  const location = useLocation();
  const logout = useAppStore(state => state.logout);
  const user = useAppStore(state => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/backend', icon: LayoutDashboard },
    { name: 'Products', path: '/backend/products', icon: Package },
    { name: 'Inventory', path: '/backend/inventory', icon: ClipboardList },
    { name: 'Floors', path: '/backend/floors', icon: Layers },
    { name: 'Tables', path: '/backend/tables', icon: TableIcon },
    { name: 'Sessions', path: '/backend/sessions', icon: History },
    { name: 'Reports', path: '/backend/reports', icon: BarChart3 },
  ];

  const renderNavContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-9 h-9 rounded-lg object-contain bg-white/10 p-0.5" />
          <span>
            <span className="tracking-widest uppercase text-sm font-display block">Brew Haven</span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary-light font-bold">Premium Café</span>
          </span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.path === '/backend' 
            ? (location.pathname === '/backend' || location.pathname === '/backend/')
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center space-x-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-semibold"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-secondary-dark text-slate-300 flex-col shadow-2xl z-10">
        {renderNavContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-secondary-dark text-slate-300 flex flex-col shadow-2xl animate-slide-in-left z-10">
            <div className="absolute right-3 top-3">
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              {navItems.find(i => 
                i.path === '/backend' 
                  ? (location.pathname === '/backend' || location.pathname === '/backend/')
                  : location.pathname.startsWith(i.path)
              )?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/pos/floor" className="btn-primary text-xs sm:text-sm">
              <span className="hidden sm:inline">Launch POS Terminal</span>
              <span className="sm:hidden">POS</span>
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<BackendHome />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="floors" element={<Floors />} />
            <Route path="tables" element={<Tables />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
