import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Boxes,
  ClipboardList,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  RefreshCw,
  History,
  Coins,
  ArrowDownToLine,
  PackageCheck,
  Building2,
  Check,
  ChevronDown,
  Package,
} from 'lucide-react';

const getCategoryEmoji = (cat) => {
  const map = { 'Coffee': '☕', 'Pastry': '🥐', 'Mains': '🍽️', 'Drinks': '🥤' };
  return map[cat] || '🍴';
};

const StockBadge = ({ item }) => {
  if (item.quantity <= 0) {
    return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">Out of stock</span>;
  }
  if (item.quantity <= item.reorderLevel) {
    return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Low stock</span>;
  }
  return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">In stock</span>;
};

const QuantityEditor = ({ item, onSave }) => {
  const [value, setValue] = useState(String(item.quantity));
  const [saved, setSaved] = useState(false);

  const persist = () => {
    const next = Math.max(0, Number(value) || 0);
    if (next !== Number(item.quantity)) {
      onSave(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } else {
      setValue(String(item.quantity));
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={persist}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white text-center"
      />
      <span className="text-xs text-slate-400 font-medium w-12">{item.unit}</span>
      {saved ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <span className="w-4" />
      )}
    </div>
  );
};

const Inventory = () => {
  const {
    inventory,
    products,
    fetchInventory,
    fetchInventorySummary,
    fetchProducts,
    createInventoryItem,
    updateInventoryItem,
    restockInventoryItem,
    deleteInventoryItem,
    syncInventoryProducts,
    stockMovements,
    fetchStockMovements,
    user,
  } = useAppStore();

  const [tab, setTab] = useState('items');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Product',
    category: '',
    quantity: 0,
    unit: 'unit',
    reorderLevel: 0,
    supplier: '',
    costPerUnit: 0,
    productId: '',
  });
  const [restockData, setRestockData] = useState({ quantity: '', note: '' });

  const refresh = async () => {
    await Promise.all([fetchInventory(), fetchInventorySummary()]);
  };

  useEffect(() => {
    fetchInventory();
    fetchInventorySummary();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', type: 'Product', category: '', quantity: 0, unit: 'unit', reorderLevel: 0, supplier: '', costPerUnit: 0, productId: '' });
    setShowAdd(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      category: item.category || '',
      quantity: item.quantity,
      unit: item.unit || 'unit',
      reorderLevel: item.reorderLevel || 0,
      supplier: item.supplier || '',
      costPerUnit: item.costPerUnit || 0,
      productId: item.productId || '',
    });
    setShowAdd(true);
  };

  const handleTypeChange = (type) => {
    const next = { ...formData, type };
    if (type === 'Ingredient') next.productId = '';
    setFormData(next);
  };

  const handleProductLink = (productId) => {
    if (!productId) {
      setFormData({ ...formData, productId: '' });
      return;
    }
    const p = products.find(x => x._id === productId);
    setFormData({
      ...formData,
      productId,
      name: p?.name || formData.name,
      category: p?.category || formData.category,
      unit: p?.unit || formData.unit,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem._id, { ...formData, user: user?.name || '' });
      } else {
        await createInventoryItem({ ...formData, user: user?.name || '' });
      }
      setShowAdd(false);
      await refresh();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const qty = Number(restockData.quantity);
    if (!qty || qty <= 0) {
      alert('Enter a quantity greater than 0');
      return;
    }
    await restockInventoryItem(restockItem._id, { quantity: qty, note: restockData.note, user: user?.name || '' });
    setRestockItem(null);
    setRestockData({ quantity: '', note: '' });
    await refresh();
  };

  const handleQtySave = async (item, nextQty) => {
    await updateInventoryItem(item._id, { quantity: nextQty, user: user?.name || '' });
    fetchInventorySummary();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inventory item? This also removes its stock history.')) {
      await deleteInventoryItem(id);
      await refresh();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncInventoryProducts();
      await refresh();
      alert(res.message + (res.created > 0 ? ` — ${res.created} new stock entries created. Set their quantities.` : ' — all menu products already have stock entries.'));
    } finally {
      setSyncing(false);
    }
  };

  const summary = useAppStore(s => s.inventorySummary) || {
    totalItems: inventory.length,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  };

  const filtered = inventory.filter(item => {
    if (typeFilter !== 'All' && item.type !== typeFilter) return false;
    if (statusFilter === 'low' && !(item.quantity > 0 && item.quantity <= item.reorderLevel)) return false;
    if (statusFilter === 'out' && !(item.quantity <= 0)) return false;
    const q = searchTerm.toLowerCase();
    if (q && !(item.name.toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q) || (item.supplier || '').toLowerCase().includes(q))) return false;
    return true;
  });

  const statCards = [
    {
      title: 'Tracked Items',
      value: summary.totalItems ?? inventory.length,
      icon: Boxes,
      color: 'bg-primary',
      onClick: () => { setStatusFilter('all'); setTypeFilter('All'); },
    },
    {
      title: 'Low Stock',
      value: summary.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      onClick: () => { setStatusFilter('low'); setTab('items'); setTypeFilter('All'); },
    },
    {
      title: 'Out of Stock',
      value: summary.outOfStockCount ?? 0,
      icon: PackageMinus,
      color: 'bg-rose-500',
      onClick: () => { setStatusFilter('out'); setTab('items'); setTypeFilter('All'); },
    },
    {
      title: 'Stock Value',
      value: `₹${Number(summary.totalValue || 0).toFixed(2)}`,
      icon: Coins,
      color: 'bg-emerald-500',
      onClick: () => { setStatusFilter('all'); setTypeFilter('All'); },
    },
  ];

  const movementIcon = (t) => {
    if (t === 'in') return <PackagePlus className="w-4 h-4 text-emerald-600" />;
    if (t === 'out') return <PackageMinus className="w-4 h-4 text-rose-600" />;
    return <Edit2 className="w-4 h-4 text-indigo-600" />;
  };

  const movementBg = (t) => {
    if (t === 'in') return 'bg-emerald-100';
    if (t === 'out') return 'bg-rose-100';
    return 'bg-indigo-100';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-display">Inventory</h2>
          <p className="text-sm text-slate-400">Track menu product stock & restaurant supplies</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleSync} disabled={syncing} className="btn-secondary flex items-center space-x-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Menu Products</span>
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, onClick }) => (
          <button key={title} onClick={onClick} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left ${statusFilter !== 'all' && (title === 'Low Stock' || title === 'Out of Stock') ? 'ring-2 ring-primary/40' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <ArrowDownToLine className="w-4 h-4 text-slate-300" />
            </div>
            <h4 className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</h4>
            <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        <button
          onClick={() => setTab('items')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'items' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Inventory
        </button>
        <button
          onClick={() => { setTab('history'); if (stockMovements.length === 0) fetchStockMovements(); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'history' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Stock History
        </button>
      </div>

      {tab === 'items' ? (
        <>
          {/* Type + Status filters */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Product', 'Ingredient'].map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); if (t !== 'All') setStatusFilter('all'); }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  typeFilter === t
                    ? 'bg-secondary text-white border-secondary shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {t === 'Product' ? 'Menu Products' : t === 'Ingredient' ? 'Supplies' : 'All Items'}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[980px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Item</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Quantity</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Reorder Level</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Supplier</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cost/Unit</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Value</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="font-bold text-slate-500">No inventory items</p>
                        <p className="text-sm text-slate-400">Click "Sync Menu Products" or "Add Item" to get started</p>
                      </td>
                    </tr>
                  )}
                  {filtered.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-slate-100 ${item.type === 'Ingredient' ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                            {item.type === 'Ingredient' ? '🧺' : getCategoryEmoji(item.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 flex items-center space-x-2">
                              <span>{item.name}</span>
                              {item.productId && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black tracking-widest uppercase">Menu</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{item.category || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.type === 'Ingredient' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                          {item.type === 'Ingredient' ? 'Supply' : 'Product'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <QuantityEditor key={`${item._id}-${item.quantity}`} item={item} onSave={(next) => handleQtySave(item, next)} />
                      </td>
                      <td className="px-6 py-4">
                        <StockBadge item={item} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700">{item.reorderLevel} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        {item.supplier ? (
                          <span className="flex items-center space-x-1.5 text-sm text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.supplier}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">₹{Number(item.costPerUnit || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">₹{Number(item.value || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => { setRestockItem(item); setRestockData({ quantity: '', note: '' }); }}
                            title="Restock"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(item)} title="Edit" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} title="Delete" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ---------- Stock History ---------- */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <History className="w-5 h-5 text-primary" />
                <span>Stock Movements</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Every restock, sale deduction, and manual adjustment</p>
            </div>
            <button onClick={() => fetchStockMovements()} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-50 max-h-[calc(100vh-320px)] overflow-y-auto">
            {stockMovements.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-16">No stock movements recorded yet</p>
            )}
            {stockMovements.map((m) => (
              <div key={m._id} className="flex items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${movementBg(m.type)} mr-4`}>
                  {movementIcon(m.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{m.itemName}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {m.note || (m.type === 'in' ? 'Restocked' : m.type === 'out' ? 'Order sale' : 'Manual adjustment')}
                    {m.user ? ` • by ${m.user}` : ''}
                  </p>
                </div>
                <div className="text-right mr-6">
                  <p className={`text-sm font-black ${m.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.delta > 0 ? '+' : ''}{m.delta}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{m.beforeQuantity} → {m.afterQuantity}</p>
                </div>
                <div className="text-right w-32">
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(m.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Type</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('Product')}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        formData.type === 'Product' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Package className="w-4 h-4 mx-auto mb-1" /> Menu Product
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('Ingredient')}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        formData.type === 'Ingredient' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      🧺 Supply / Ingredient
                    </button>
                  </div>
                </div>

                {formData.type === 'Product' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link to Menu Product <span className="text-slate-400 font-normal">(stock auto-deducts on sale)</span></label>
                    <div className="relative">
                      <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <select
                        className="input-field pl-10 appearance-none"
                        value={formData.productId}
                        onChange={(e) => handleProductLink(e.target.value)}
                        disabled={Boolean(editingItem?.productId)}
                      >
                        <option value="">— Not linked (standalone item) —</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>
                    {editingItem?.productId && (
                      <p className="text-[10px] text-primary font-bold mt-1">Linked to a menu product — disable in Products screen to change</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input type="text" required className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input type="text" className="input-field" placeholder="e.g. Coffee, Dairy, Packaging" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input type="number" min="0" className="input-field" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input type="text" className="input-field" placeholder="unit, kg, ml" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                  <input type="number" min="0" className="input-field" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost / Unit (₹)</label>
                  <input type="number" min="0" step="0.01" className="input-field" value={formData.costPerUnit} onChange={(e) => setFormData({ ...formData, costPerUnit: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input type="text" className="input-field" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                </div>
              </div>

              <div className="pt-4 flex space-x-3 justify-end">
                <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <PackagePlus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Restock</h3>
                  <p className="text-xs text-slate-500">{restockItem.name} — currently {restockItem.quantity} {restockItem.unit}</p>
                </div>
              </div>
              <button onClick={() => setRestockItem(null)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRestock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Quantity ({restockItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  className="input-field text-lg font-bold"
                  placeholder={`e.g. 20 ${restockItem.unit}`}
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Weekly delivery from supplier"
                  value={restockData.note}
                  onChange={(e) => setRestockData({ ...restockData, note: e.target.value })}
                />
              </div>
              <div className="pt-2 flex space-x-3 justify-end">
                <button type="button" onClick={() => setRestockItem(null)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;