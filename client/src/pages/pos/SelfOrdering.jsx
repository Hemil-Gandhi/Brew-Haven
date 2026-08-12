import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import ReceiptModal from '../../components/ReceiptModal';
import useAppStore from '../../store/useAppStore';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChefHat,
  Search,
  CheckCircle,
  X,
  LogOut,
  Printer,
  Coffee,
  ChevronRight,
  Trash2,
  Wallet,
  QrCode,
  CreditCard,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SelfOrdering = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { 
    products, 
    fetchProducts, 
    tables, 
    fetchTables, 
    orders,
    fetchOrders,
    cart, 
    addToCart, 
    updateCartQty,
    removeFromCart, 
    createOrder,
    logout
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [showReadyNotif, setShowReadyNotif] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchTables();
    fetchOrders();
  }, [fetchProducts, fetchTables, fetchOrders]);

  const currentOrder = activeOrderId ? orders.find(o => o._id === activeOrderId) : null;
  const notifiedReady = useRef(false);

  useEffect(() => {
    if (currentOrder && currentOrder.status === 'Completed' && !notifiedReady.current) {
      notifiedReady.current = true;
      setShowReadyNotif(true);
    }
  }, [currentOrder]);

  const isTakeaway = !tableId || tableId === 'takeaway';
  const table = tables.find(t => t.number === tableId || t._id === tableId);
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cart.reduce((sum, item) => sum + (item.price * item.quantity * ((item.tax || 0) / 100)), 0);
  const cartTotal = cartSubtotal + cartTax;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = (product) => {
    if (product.stock === 0) return; // out of stock — cannot order
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
    } else {
      addToCart(product);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        ...(isTakeaway ? {} : { tableId: table?._id }),
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          kitchenStatus: 'To Cook'
        })),
        totalAmount: cartTotal,
        type: isTakeaway ? 'Takeaway' : 'Self-order',
        paymentStatus: 'Paid',
        paymentMethod: paymentMethod === 'UPI' ? 'UPI QR' : paymentMethod,
        status: 'Open'
      };
      const created = await createOrder(orderData);
      setActiveOrderId(created._id);
      setOrderComplete(true);
      setShowCart(false);
      setShowPayment(false);
    } catch (err) {
      void err;
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToPayment = () => {
    setShowCart(false);
    setPaymentMethod(null);
    setShowPayment(true);
  };

  // Category icon mapping
  const getCategoryEmoji = (cat) => {
    const map = { 'Coffee': '☕', 'Pastry': '🥐', 'Mains': '🍽️', 'Drinks': '🥤', 'All': '✨' };
    return map[cat] || '🍴';
  };

  const handleImgError = (e) => { e.currentTarget.style.display = 'none'; };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3A2C21] via-[#1E1510] to-[#12100D] flex items-center justify-center p-6 text-center text-white">
         {/* Hidden receipt for printing */}
         {currentOrder && <ReceiptModal order={currentOrder} />}
         <div className="animate-slide-up max-w-sm w-full">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-light to-primary rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border-4 border-primary-light/20 shadow-[0_0_80px_-15px_rgba(200,155,94,0.6)]">
              <CheckCircle className="w-16 h-16 drop-shadow-lg text-white" />
            </div>
            <h1 className="text-5xl font-black mb-3 tracking-tight font-display">Order Placed!</h1>
            <p className="text-slate-300 mb-10 text-lg font-medium leading-relaxed max-w-xs mx-auto">
               Your order is being prepared by our kitchen team.
            </p>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md mb-6">
               <p className="text-xs font-black uppercase tracking-widest text-primary-light mb-1">
                 {isTakeaway ? 'Order Number' : 'Your Table'}
               </p>
               <p className="text-5xl font-black font-display">{isTakeaway ? currentOrder?.orderNumber || '...' : (table?.number || tableId)}</p>
               <p className="text-sm text-slate-400 mt-2">
                 {isTakeaway ? 'Please wait at the counter' : 'We\'ll bring it right to you'}
               </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => { setOrderComplete(false); }}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black shadow-2xl active:scale-95 transition-all text-lg hover:brightness-110"
              >
               Order More Items
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('print-receipt');
                  if (el) { el.style.display = 'block'; window.print(); el.style.display = 'none'; }
                }}
                className="w-full px-8 py-4 bg-white/10 text-white rounded-2xl font-bold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white/20"
              >
                <Printer className="w-5 h-5" />
                Print Receipt
              </button>
              {currentOrder && (
                <button 
                  onClick={() => navigate(`/bill/${currentOrder._id}`)}
                  className="w-full px-8 py-4 bg-white text-secondary-dark rounded-2xl font-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-cream"
                >
                  <FileText className="w-5 h-5" />
                  View / Download Full Bill
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full px-8 py-4 bg-white/10 text-white/80 rounded-2xl font-bold border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
         </div>
      </div>
    );
  }

  const renderCategoryPills = () => (
    <div className="px-4 pb-4 lg:px-8 flex space-x-2 overflow-x-auto no-scrollbar">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`flex-shrink-0 flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === cat 
            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]' 
            : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-slate-200 border border-white/10'
          }`}
        >
          <span>{getCategoryEmoji(cat)}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  );

  const renderProductCard = (product) => {
    const inCart = cart.find(c => c._id === product._id);
    const isOutOfStock = product.stock === 0;
    return (
      <button 
        key={product._id} 
        onClick={() => handleProductClick(product)}
        disabled={isOutOfStock}
        className={`bg-white rounded-3xl border border-cream-dark shadow-sm text-left flex flex-col overflow-hidden active:scale-[0.97] transition-all group hover:shadow-lg hover:border-primary/30 ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
         {/* Image area */}
         <div className="w-full aspect-[4/3] bg-gradient-to-br from-cream to-cream-dark relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              <span>{getCategoryEmoji(product.category)}</span>
            </div>
            {product.image && (
              <img
                src={`${API_BASE}${product.image}`}
                alt={product.name}
                onError={handleImgError}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-3 py-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Sold Out</span>
              </div>
            )}
            {product.variants?.length > 0 && !isOutOfStock && (
              <span className="absolute top-2 right-2 bg-primary/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full">OPTIONS</span>
            )}
            {inCart && !isOutOfStock && (
              <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {inCart.quantity}
              </span>
            )}
         </div>
         <div className="p-3 flex-1">
           <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
           <p className="text-[10px] text-slate-400 mb-2">{product.category}</p>
           <div className="flex items-center justify-between">
             <span className="text-base font-black text-slate-900">₹{product.price}</span>
             <div className="w-7 h-7 bg-primary group-hover:bg-primary-dark rounded-xl flex items-center justify-center transition-colors shadow-sm">
               <Plus className="w-4 h-4 text-white" />
             </div>
           </div>
         </div>
      </button>
    );
  };

  const renderCartItems = () => (
    <div className="space-y-4">
      {cart.map((item, i) => (
         <div key={i} className="flex items-center space-x-4 bg-cream p-4 rounded-2xl border border-cream-dark">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-cream-dark flex-shrink-0">
              {getCategoryEmoji(item.category || 'Mains')}
            </div>
            <div className="flex-1 min-w-0">
               <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
               {item.variant && <p className="text-[10px] text-primary font-black uppercase tracking-widest">{item.variant}</p>}
               <p className="text-xs text-slate-500 font-medium">₹{item.price} each</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
               <div className="flex items-center bg-white rounded-xl border border-cream-dark shadow-sm overflow-hidden">
                  <button onClick={() => item.quantity === 1 ? removeFromCart(item._id, item.variant) : updateCartQty(item._id, item.variant, -1)} className="px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="w-7 text-center font-black text-slate-800 text-sm">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item._id, item.variant, 1)} className="px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
               </div>
               <span className="font-black text-slate-800 text-sm w-14 text-right">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
         </div>
      ))}
    </div>
  );

  const renderTotals = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-500 font-bold">
        <span>Subtotal ({totalItems} items)</span>
        <span>₹{cartSubtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-500 font-bold">
        <span>Tax</span>
        <span>₹{cartTax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-black text-xl text-slate-900 pt-2 border-t border-cream-dark mt-2">
        <span>Total</span>
        <span>₹{cartTotal.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans relative">
      {/* ===================== MOBILE LAYOUT ===================== */}
      <div className="lg:hidden max-w-lg mx-auto w-full flex flex-col min-h-screen relative">
        {/* Premium Header */}
        <header className="p-5 bg-secondary-dark sticky top-0 z-20 border-b border-white/5 shadow-2xl">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-3">
               <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-0.5 shadow-lg shadow-primary/30" />
               <div>
                 <h1 className="text-lg font-black text-white leading-none font-display">Brew Haven</h1>
                 {isTakeaway ? (
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Takeaway Order</p>
                 ) : table && (
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Table {table.number}</p>
                 )}
               </div>
             </div>
             <div className="flex items-center space-x-2">
               <button 
                 onClick={() => setShowCart(true)}
                 className="relative p-3 bg-white/10 rounded-2xl transition-all active:scale-90 shadow-lg border border-white/10"
               >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  {totalItems > 0 && (
                     <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-secondary-dark shadow-lg">
                        {totalItems}
                     </span>
                  )}
               </button>
               <button
                 onClick={handleLogout}
                 className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                 title="Sign Out"
               >
                 <LogOut className="w-5 h-5 text-slate-400" />
               </button>
             </div>
           </div>

           {/* Search */}
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                 type="text"
                 placeholder="Search food & drinks..."
                 className="w-full pl-11 pr-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/12"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </header>

        {/* Category Pills */}
        <div className="bg-secondary-dark pb-4 border-b border-white/5">
          {renderCategoryPills()}
        </div>

        {/* Product Grid */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto pb-32">
           {/* Section heading */}
           <div className="flex items-center justify-between">
             <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest">
               {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
             </h2>
             <span className="text-xs text-slate-400 font-medium">{filteredProducts.length} items</span>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(renderProductCard)}
           </div>

           {filteredProducts.length === 0 && (
             <div className="py-20 flex flex-col items-center text-slate-400">
               <span className="text-5xl mb-4">🔍</span>
               <p className="font-bold">Nothing found</p>
               <p className="text-sm">Try a different category</p>
             </div>
           )}
        </div>

        {/* Floating Cart Button */}
        {totalItems > 0 && !showCart && (
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[calc(32rem-2rem)] px-4 animate-slide-up z-30">
              <button 
                 onClick={() => setShowCart(true)}
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/40 flex items-center justify-between px-6 active:scale-95 transition-all border border-primary-light/30"
              >
                 <div className="flex items-center space-x-3">
                   <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-sm font-black">{totalItems}</span>
                   <span>View Cart</span>
                 </div>
                 <span className="font-black text-lg">₹{cartTotal.toFixed(0)}</span>
              </button>
           </div>
        )}

        {/* Cart Drawer */}
        {showCart && (
           <div className="fixed inset-0 z-[100] flex flex-col justify-end">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
              <div className="max-w-lg mx-auto w-full bg-white rounded-t-[2.5rem] shadow-2xl z-10 animate-slide-up max-h-[88vh] flex flex-col">
                 {/* Drawer Handle */}
                 <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                 </div>
                 
                 <div className="flex items-center justify-between px-8 pb-4 pt-2 border-b border-cream-dark">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">Your Order</h3>
                      <p className="text-sm text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                    </div>
                    <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                       <X className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto px-8 py-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <ShoppingBag className="w-14 h-14 mb-3 opacity-30" />
                        <p className="font-bold text-slate-500">Your cart is empty</p>
                        <p className="text-sm">Browse the menu to add items</p>
                      </div>
                    ) : renderCartItems()}
                 </div>

                 <div className="p-8 pt-4 border-t border-cream-dark bg-white rounded-b-[2.5rem] space-y-4">
                    {renderTotals()}
                    <button 
                       onClick={goToPayment}
                       disabled={cart.length === 0}
                       className="w-full py-5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-[2rem] font-black text-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center space-x-3"
                    >
                       <ChefHat className="w-6 h-6" />
                       <span>Proceed to Payment</span>
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent directly to kitchen display</p>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* ===================== DESKTOP LAYOUT ===================== */}
      <div className="hidden lg:flex flex-1 lg:h-screen">
        {/* Left: Menu */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop top bar */}
          <div className="px-8 py-5 flex items-center justify-between border-b border-white/5 bg-secondary-dark shrink-0">
            <div className="flex items-center space-x-3">
              <img src="/brew_haven_logo.png" alt="Brew Haven" className="w-11 h-11 rounded-xl object-contain bg-white/10 p-0.5 shadow-lg shadow-primary/30" />
              <div>
                <h1 className="text-xl font-black text-white leading-none font-display">Brew Haven</h1>
                {isTakeaway ? (
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Takeaway Order</p>
                ) : table && (
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Table {table.number}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                   type="text"
                   placeholder="Search food & drinks..."
                   className="w-full pl-11 pr-4 py-3 bg-white/8 border border-white/10 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/12"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleLogout}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Desktop category pills */}
          <div className="bg-secondary-dark py-3 border-b border-white/5 shrink-0">
            {renderCategoryPills()}
          </div>

          {/* Desktop menu grid */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest">
                {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
              </h2>
              <span className="text-xs text-slate-400 font-medium">{filteredProducts.length} items</span>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map(renderProductCard)}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-20 flex flex-col items-center text-slate-400">
                <span className="text-5xl mb-4">🔍</span>
                <p className="font-bold">Nothing found</p>
                <p className="text-sm">Try a different category</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Persistent Cart Sidebar */}
        <aside className="w-[380px] shrink-0 bg-white border-l border-cream-dark flex flex-col">
          <div className="px-6 py-5 border-b border-cream-dark flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-xl font-black text-slate-800">Your Order</h3>
              <p className="text-sm text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
            <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag className="w-14 h-14 mb-3 opacity-30" />
                <p className="font-bold text-slate-500">Your cart is empty</p>
                <p className="text-sm">Browse the menu to add items</p>
              </div>
            ) : renderCartItems()}
          </div>
          <div className="px-6 py-6 border-t border-cream-dark space-y-4 bg-white shrink-0">
            {renderTotals()}
            <button 
              onClick={goToPayment}
              disabled={cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black text-base hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 shadow-lg flex items-center justify-center space-x-2"
            >
              <ChefHat className="w-5 h-5" />
              <span>Proceed to Payment</span>
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent directly to kitchen display</p>
          </div>
        </aside>
      </div>

      {/* Variant Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
           <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-[2.5rem] lg:rounded-[2rem] shadow-2xl z-10 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    {selectedProduct.image && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-cream to-cream-dark">
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">
                          <span>{getCategoryEmoji(selectedProduct.category)}</span>
                        </div>
                        <img
                          src={`${API_BASE}${selectedProduct.image}`}
                          alt={selectedProduct.name}
                          onError={handleImgError}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase mb-2 inline-block">Choose Option</span>
                      <h3 className="text-2xl font-black text-slate-800">{selectedProduct.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{selectedProduct.description}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-100 rounded-full ml-4 flex-shrink-0">
                     <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-3">
                   {selectedProduct.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          addToCart(selectedProduct, v);
                          setSelectedProduct(null);
                        }}
                        className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-cream-dark hover:border-primary hover:bg-primary/5 transition-all group active:scale-[0.98]"
                      >
                        <div className="text-left">
                           <p className="font-black text-slate-800 group-hover:text-primary transition-colors">{v.name}</p>
                           {v.extraPrice > 0 && <p className="text-xs text-slate-400">+ ₹{v.extraPrice} extra</p>}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-black text-slate-800">₹{(selectedProduct.price + v.extraPrice)}</span>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                   ))}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-slide-up">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
              <div className="p-8 pb-4 flex items-center justify-between border-b border-cream-dark">
                 <div className="flex items-center space-x-3">
                   <button onClick={() => { setShowPayment(false); setShowCart(true); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                     <ArrowLeft className="w-5 h-5 text-slate-500" />
                   </button>
                   <div>
                     <h3 className="text-xl font-black text-slate-800">Checkout</h3>
                     <p className="text-xs text-slate-400">Total: ₹{cartTotal.toFixed(2)}</p>
                   </div>
                 </div>
                 <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>

              <div className="p-8 pb-4 space-y-4 overflow-y-auto max-h-[60vh]">
                 <h4 className="font-bold text-slate-800 mb-2">Select Payment Method</h4>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setPaymentMethod('Cash')}
                     className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                       paymentMethod === 'Cash' 
                       ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/20' 
                       : 'border-cream-dark hover:border-slate-300 text-slate-600'
                     }`}
                   >
                     <Wallet className="w-8 h-8 mb-2" />
                     <span className="font-bold">Cash</span>
                   </button>
                   <button 
                     onClick={() => setPaymentMethod('UPI')}
                     className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                       paymentMethod === 'UPI' 
                       ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/20' 
                       : 'border-cream-dark hover:border-slate-300 text-slate-600'
                     }`}
                   >
                     <QrCode className="w-8 h-8 mb-2" />
                     <span className="font-bold">UPI / QR</span>
                   </button>
                 </div>

                 {paymentMethod === 'UPI' && (
                   <div className="mt-6 p-6 bg-cream rounded-3xl flex flex-col items-center justify-center border border-cream-dark animate-slide-up">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Scan to Pay ₹{cartTotal.toFixed(2)}</p>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-cream-dark">
                        <QRCodeSVG value={`upi://pay?pa=hemilgandhi904@oksbi&pn=Brew%20Haven&am=${cartTotal}&cu=INR`} size={160} />
                      </div>
                      <p className="text-xs text-slate-400 mt-4">UPI ID: hemilgandhi904@oksbi</p>
                   </div>
                 )}
                 {paymentMethod === 'Cash' && (
                   <div className="mt-6 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-700 animate-slide-up">
                     <p className="font-bold mb-1">Pay at the Counter</p>
                     <p className="text-sm opacity-80">Please keep exact change ready or pay at the main counter.</p>
                   </div>
                 )}
              </div>

              <div className="p-8 pt-4 bg-white border-t border-cream-dark mt-auto">
                 <button 
                   onClick={handlePlaceOrder}
                   disabled={!paymentMethod || loading}
                   className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all active:scale-95 shadow-2xl shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                 >
                   {loading ? (
                     <span>Processing...</span>
                   ) : (
                     <>
                       <CheckCircle className="w-6 h-6" />
                       <span>Confirm & Place Order</span>
                     </>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Order Ready Notification */}
      {showReadyNotif && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-sm animate-bounce-in">
           <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between border-4 border-white/20">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                    <ChefHat className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg leading-tight">Order is Ready! 🍕</h4>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Pick up at the counter</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowReadyNotif(false)}
                className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SelfOrdering;
