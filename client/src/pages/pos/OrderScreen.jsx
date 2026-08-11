import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { 
  ArrowLeft, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard,
  ShoppingCart,
  UtensilsCrossed,
  Layers,
  ChevronRight
} from 'lucide-react';

const OrderScreen = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { 
    products, 
    fetchProducts, 
    tables, 
    fetchTables,
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQty,
    createOrder,
    activeSession
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null); // For variant modal

  useEffect(() => {
    fetchProducts();
    fetchTables();
  }, [fetchProducts, fetchTables]);

  const table = tables.find(t => t._id === tableId);
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cart.reduce((sum, item) => sum + (item.price * item.quantity * ((item.tax || 0) / 100)), 0);
  const cartTotal = cartSubtotal + cartTax;

  const handleProductClick = (product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
    } else {
      addToCart(product);
    }
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        tableId,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          kitchenStatus: 'To Cook'
        })),
        totalAmount: cartTotal,
        type: 'Dine-in',
        sessionId: activeSession?._id
      };
      const order = await createOrder(orderData);
      alert('Order sent to kitchen!');
      navigate(`/pos/payment/${order._id}`);
    } catch {
      alert('Error creating order');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        tableId,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          kitchenStatus: 'Completed' // Quick checkout skips kitchen
        })),
        totalAmount: cartTotal,
        type: 'Dine-in',
        sessionId: activeSession?._id
      };
      const order = await createOrder(orderData);
      navigate(`/pos/payment/${order._id}`);
    } catch {
      alert('Error creating order');
    }
  };

  const [showMobileCart, setShowMobileCart] = useState(false);

  return (
    <div className="h-screen bg-cream flex flex-col md:flex-row overflow-hidden">
      {/* Product Selection (Left/Main) */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-secondary-dark border-b border-white/5 p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 text-slate-100 shadow-xl relative z-10">
          <button 
            onClick={() => navigate('/pos/floor')}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" />
          </button>
          <div className="flex-1 flex flex-col min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-white truncate">
               Table {table?.number || '...'}
            </h2>
            <p className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider">Taking New Order</p>
          </div>
          {/* Mobile cart button */}
          <button
            onClick={() => setShowMobileCart(true)}
            className="md:hidden relative p-2.5 bg-white/10 rounded-xl border border-white/10"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-secondary-dark">{cart.length}</span>
            )}
          </button>
          <div className="relative w-40 sm:w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Categories Bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto flex space-x-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {filteredProducts.map(product => (
            <button
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col text-left group animate-slide-up"
            >
              <div className="w-full aspect-square bg-cream rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                 {product.image ? (
                   <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 ) : (
                   <span className="text-4xl">{({'Coffee':'☕','Pastry':'🥐','Mains':'🍽️','Drinks':'🥤'})[product.category] || '🍴'}</span>
                 )}
              </div>
              <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary">{product.name}</p>
              <p className="text-xs text-slate-400 font-medium mb-2">{product.category}</p>
              <div className="mt-auto flex items-center justify-between">
                 <span className="text-lg font-black text-slate-800">₹{product.price.toFixed(2)}</span>
                 <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                 </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart (Right Sidebar - Desktop) */}
      <div className="hidden md:flex w-96 bg-white border-l border-slate-200 flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary-light" />
             </div>
             <h3 className="text-xl font-bold">Your Cart</h3>
          </div>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-black">{cart.length} ITEMS</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((item, idx) => (
            <div key={`${item._id}-${item.variant}-${idx}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-slide-up">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <p className="font-bold text-slate-800 leading-tight">{item.name}</p>
                  {item.variant && (
                    <p className="text-[10px] font-black text-primary uppercase mt-0.5 tracking-widest">{item.variant}</p>
                  )}
                  <p className="text-sm font-bold text-slate-500 mt-1">₹{item.price.toFixed(2)} ea</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item._id, item.variant)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                  <button 
                    onClick={() => updateCartQty(item._id, item.variant, -1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-black text-slate-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQty(item._id, item.variant, 1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-black text-slate-800 text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
               <ShoppingCart className="w-16 h-16 mb-4 opacity-10" />
               <p className="font-bold">Cart is empty</p>
               <p className="text-xs">Add products to start an order</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Tax</span>
              <span>₹{cartTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={handleSendToKitchen}
               disabled={cart.length === 0}
               className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
             >
                <Send className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase">To Kitchen</span>
             </button>
             <button 
               onClick={handleCheckout}
               disabled={cart.length === 0}
               className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20"
             >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase">Checkout</span>
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {showMobileCart && (
        <div className="fixed inset-0 z-[90] md:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1 bg-slate-200 rounded-full" /></div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-light" />
                </div>
                <h3 className="text-xl font-bold">Your Cart</h3>
              </div>
              <button onClick={() => setShowMobileCart(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item, idx) => (
                <div key={`${item._id}-${item.variant}-${idx}`} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      {item.variant && <p className="text-[10px] font-black text-primary uppercase mt-0.5 tracking-widest">{item.variant}</p>}
                      <p className="text-xs font-bold text-slate-500 mt-0.5">₹{item.price.toFixed(2)} ea</p>
                    </div>
                    <button onClick={() => removeFromCart(item._id, item.variant)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                      <button onClick={() => updateCartQty(item._id, item.variant, -1)} className="p-1.5 rounded-lg text-slate-600"><Minus className="w-3 h-3" /></button>
                      <span className="w-7 text-center font-black text-slate-800 text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item._id, item.variant, 1)} className="p-1.5 rounded-lg text-slate-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="font-black text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center text-slate-300 py-8">
                  <ShoppingCart className="w-12 h-12 mb-3 opacity-10" />
                  <p className="font-bold text-sm">Cart is empty</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between text-xl font-black text-slate-900 mb-4">
                <span>Total</span><span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowMobileCart(false); handleSendToKitchen(); }} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 text-white font-bold disabled:opacity-50 active:scale-95">
                  <Send className="w-5 h-5 mb-1" /><span className="text-[10px] uppercase">To Kitchen</span>
                </button>
                <button onClick={() => { setShowMobileCart(false); handleCheckout(); }} disabled={cart.length === 0} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20">
                  <CreditCard className="w-5 h-5 mb-1" /><span className="text-[10px] uppercase">Checkout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 pb-4">
                 <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase">Select Option</span>
                    <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-100 rounded-full">
                       <X className="w-6 h-6 text-slate-400" />
                    </button>
                 </div>
                 <h3 className="text-3xl font-black text-slate-800 mb-1">{selectedProduct.name}</h3>
                 <p className="text-slate-500 mb-6">{selectedProduct.description || 'Customize your selection below'}</p>
                 
                 <div className="space-y-3">
                    {selectedProduct.variants.map((v, i) => (
                       <button
                         key={i}
                         onClick={() => {
                           addToCart(selectedProduct, v);
                           setSelectedProduct(null);
                         }}
                         className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
                       >
                         <div className="text-left">
                            <p className="font-black text-slate-800 group-hover:text-primary transition-colors">{v.name}</p>
                            <p className="text-xs text-slate-500">Base price + ₹{v.extraPrice}</p>
                         </div>
                         <div className="flex items-center space-x-3">
                           <span className="text-lg font-black text-slate-800">₹{(selectedProduct.price + v.extraPrice).toFixed(2)}</span>
                           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                         </div>
                       </button>
                    ))}
                 </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-xs text-slate-400 font-medium">Pricing includes applicable taxes for {selectedProduct.category}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;
