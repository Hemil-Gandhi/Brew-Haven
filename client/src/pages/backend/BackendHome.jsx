import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  IndianRupee,
  LayoutDashboard,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const StatCard = ({ title, value, icon: Icon, trend, color, sub }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <span className="flex items-center text-sm font-medium text-emerald-500">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const BackendHome = () => {
  const { orders, fetchOrders, products, fetchProducts, inventorySummary, fetchInventorySummary } = useAppStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchInventorySummary();
  }, [fetchOrders, fetchProducts, fetchInventorySummary]);

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const openOrders = orders.filter(o => o.status === 'Open');
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const todayOrders = orders.filter(o => {
    const created = new Date(o.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toFixed(2)}`}
          icon={IndianRupee} 
          trend={12.5} 
          color="bg-emerald-500"
          sub={`${paidOrders.length} paid transactions`}
        />
        <StatCard 
          title="Total Orders" 
          value={orders.length}
          icon={ShoppingCart} 
          color="bg-primary"
          sub={`${todayOrders.length} today`}
        />
        <StatCard 
          title="Open Orders" 
          value={openOrders.length}
          icon={Clock} 
          color="bg-amber-500"
          sub="Currently in progress"
        />
        <StatCard 
          title="Products" 
          value={products.length}
          icon={TrendingUp} 
          color="bg-indigo-500"
          sub="Active menu items"
        />
      </div>

      {/* Low Stock Alert */}
      {(inventorySummary?.lowStockCount > 0 || inventorySummary?.outOfStockCount > 0) && (
        <Link
          to="/backend/inventory"
          className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-amber-800">
                {inventorySummary.outOfStockCount > 0
                  ? `${inventorySummary.outOfStockCount} item(s) out of stock`
                  : `${inventorySummary.lowStockCount} item(s) running low`}
              </p>
              <p className="text-xs text-amber-600">Check inventory & restock before it affects orders</p>
            </div>
          </div>
          <span className="flex items-center text-sm font-bold text-amber-700">
            <ClipboardList className="w-4 h-4 mr-1" /> Manage
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Orders</h3>
            <Link to="/backend/reports" className="text-xs text-primary font-bold hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No orders yet</p>
            )}
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {order.paymentStatus === 'Paid' 
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : <AlertCircle className="w-4 h-4 text-amber-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">
                      {order.tableId?.number ? `Table ${order.tableId.number}` : 'Self-Order'} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{order.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
              <p className="text-slate-500 text-sm">Jump to key sections</p>
            </div>
          </div>
          
          {[
            { label: 'Manage Products', desc: 'Add, edit, or remove menu items', path: '/backend/products', color: 'bg-primary/10 text-primary' },
            { label: 'Inventory & Stock', desc: 'Track stock, restock, and supplies', path: '/backend/inventory', color: 'bg-sky-100 text-sky-700' },
            { label: 'Floor & Tables', desc: 'Configure your restaurant layout', path: '/backend/floors', color: 'bg-amber-100 text-amber-700' },
            { label: 'Sales Reports', desc: 'Export PDF & Excel reports', path: '/backend/reports', color: 'bg-emerald-100 text-emerald-700' },
            { label: 'POS Terminal', desc: 'Launch the floor plan view', path: '/pos/floor', color: 'bg-indigo-100 text-indigo-700' },
            { label: 'Kitchen Display', desc: 'Monitor live kitchen orders', path: '/kitchen', color: 'bg-rose-100 text-rose-700' },
          ].map(({ label, desc, path, color }) => (
            <Link 
              key={path} 
              to={path}
              className="flex items-center space-x-4 p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} font-black text-sm`}>
                →
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackendHome;
