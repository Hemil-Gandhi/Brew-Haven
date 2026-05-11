import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

const useAppStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  products: [],
  floors: [],
  tables: [],
  orders: [],
  activeSession: null,
  sessions: [],
  cart: [],

  // Auth Actions
  login: async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      set({ user: data.user, token: data.token });
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data; // Return data so callers can access user.role
    } catch (error) {
      throw error.response.data;
    }
  },
  signup: async (name, email, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/signup`, { name, email, password, role });
      set({ user: data.user, token: data.token });
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      throw error.response.data;
    }
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Product Actions
  fetchProducts: async () => {
    const { data } = await axios.get(`${API_URL}/products`);
    set({ products: data });
  },
  createProduct: async (productData) => {
    let payload = productData;
    let config = {};
    // If productData is FormData (has image file), use multipart
    if (productData instanceof FormData) {
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    const { data } = await axios.post(`${API_URL}/products`, payload, config);
    set(state => ({ products: [...state.products, data] }));
  },
  updateProduct: async (id, productData) => {
    let payload = productData;
    let config = {};
    if (productData instanceof FormData) {
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    const { data } = await axios.put(`${API_URL}/products/${id}`, payload, config);
    set(state => ({ products: state.products.map(p => p._id === id ? data : p) }));
  },
  deleteProduct: async (id) => {
    await axios.delete(`${API_URL}/products/${id}`);
    set(state => ({ products: state.products.filter(p => p._id !== id) }));
  },

  // POS Config Actions
  fetchFloors: async () => {
    const { data } = await axios.get(`${API_URL}/pos-config/floors`);
    set({ floors: data });
  },
  fetchTables: async () => {
    const { data } = await axios.get(`${API_URL}/pos-config/tables`);
    set({ tables: data });
  },
  createFloor: async (floorData) => {
    const { data } = await axios.post(`${API_URL}/pos-config/floors`, floorData);
    set(state => ({ floors: [...state.floors, data] }));
  },
  updateFloor: async (id, floorData) => {
    const { data } = await axios.put(`${API_URL}/pos-config/floors/${id}`, floorData);
    set(state => ({ floors: state.floors.map(f => f._id === id ? data : f) }));
  },
  deleteFloor: async (id) => {
    await axios.delete(`${API_URL}/pos-config/floors/${id}`);
    set(state => ({ floors: state.floors.filter(f => f._id !== id) }));
  },
  createTable: async (tableData) => {
    const { data } = await axios.post(`${API_URL}/pos-config/tables`, tableData);
    set(state => ({ tables: [...state.tables, data] }));
  },
  updateTable: async (id, tableData) => {
    const { data } = await axios.put(`${API_URL}/pos-config/tables/${id}`, tableData);
    set(state => ({ tables: state.tables.map(t => t._id === id ? data : t) }));
  },
  deleteTable: async (id) => {
    await axios.delete(`${API_URL}/pos-config/tables/${id}`);
    set(state => ({ tables: state.tables.filter(t => t._id !== id) }));
  },

  // Order Actions
  fetchOrders: async () => {
    const { data } = await axios.get(`${API_URL}/orders`);
    set({ orders: data });
  },
  createOrder: async (orderData) => {
    const { data } = await axios.post(`${API_URL}/orders`, orderData);
    // socket.emit('new_order', data); // Removed: server now emits to avoids race conditions/missing populated fields
    set(state => ({ orders: [...state.orders, data], cart: [] }));
    return data;
  },
  updateOrderStatus: async (id, statusData) => {
    const { data } = await axios.put(`${API_URL}/orders/${id}`, statusData);
    // socket.emit('update_order_status', data); // Removed: server now handles broadcast with full data
    set(state => ({ orders: state.orders.map(o => o._id === id ? data : o) }));
    return data;
  },

  // Session Actions
  fetchActiveSession: async () => {
    const { data } = await axios.get(`${API_URL}/sessions/active`);
    set({ activeSession: data });
  },
  getSessions: async () => {
    const { data } = await axios.get(`${API_URL}/sessions`);
    set({ sessions: data });
  },
  openSession: async (sessionData) => {
    const { data } = await axios.post(`${API_URL}/sessions/open`, sessionData);
    set({ activeSession: data });
  },
  closeSession: async (id, closingData) => {
    const { data } = await axios.put(`${API_URL}/sessions/close/${id}`, closingData);
    set({ activeSession: null });
  },

  // Cart Actions
  addToCart: (product, variant = null) => {
    set(state => {
      const existing = state.cart.find(c => c._id === product._id && c.variant === variant?.name);
      if (existing) {
        return {
          cart: state.cart.map(c => 
            (c._id === product._id && c.variant === variant?.name) 
            ? { ...c, quantity: c.quantity + 1 } 
            : c
          )
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1, variant: variant?.name, price: product.price + (variant?.extraPrice || 0) }] };
    });
  },
  removeFromCart: (productId, variantName) => {
    set(state => ({
      cart: state.cart.filter(c => !(c._id === productId && c.variant === variantName))
    }));
  },
  updateCartQty: (productId, variantName, delta) => {
    set(state => ({
      cart: state.cart.map(c => 
        (c._id === productId && c.variant === variantName) 
        ? { ...c, quantity: Math.max(1, c.quantity + delta) } 
        : c
      )
    }));
  },

  // Socket setup
  initSocketListeners: () => {
    socket.on('order_received', (order) => {
      set(state => {
        const exists = state.orders.some(o => o._id === order._id);
        if (exists) return { orders: state.orders.map(o => o._id === order._id ? order : o) };
        return { orders: [order, ...state.orders] };
      });
    });
    socket.on('order_status_updated', (data) => {
      set(state => ({ orders: state.orders.map(o => o._id === data._id ? data : o) }));
    });
    socket.on('table_updated', (table) => {
      set(state => ({ tables: state.tables.map(t => t._id === table._id ? table : t) }));
    });
  }
}));

export default useAppStore;
export { socket };
