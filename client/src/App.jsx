import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/useAppStore';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/backend/Dashboard';
import FloorView from './pages/pos/FloorView';
import OrderScreen from './pages/pos/OrderScreen';
import PaymentScreen from './pages/pos/PaymentScreen';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import CustomerDisplay from './pages/customer/CustomerDisplay';
import CustomerOrderType from './pages/customer/CustomerOrderType';
import CustomerTableSelect from './pages/customer/CustomerTableSelect';
import SelfOrdering from './pages/pos/SelfOrdering';
import BillPage from './pages/bill/BillPage';

const AdminRoute = ({ children }) => {
  const { token, user } = useAppStore();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const StaffRoute = ({ children }) => {
  const { token, user } = useAppStore();
  if (!token) return <Navigate to="/login" />;
  if (user?.role === 'customer') return <Navigate to="/" />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { token } = useAppStore();
  if (!token) return <Navigate to="/login" />;
  return children;
};

const IndexRoute = () => {
  const user = useAppStore(state => state.user);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'customer') return <Navigate to="/customer/order-type" />;
  if (user.role === 'admin') return <Navigate to="/backend" />;
  return <Navigate to="/pos/floor" />;
};

function App() {
  const initSocket = useAppStore(state => state.initSocketListeners);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/backend/*" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
        
        <Route path="/pos/floor" element={
          <StaffRoute>
            <FloorView />
          </StaffRoute>
        } />
        
        <Route path="/pos/order/:tableId" element={
          <StaffRoute>
            <OrderScreen />
          </StaffRoute>
        } />
        
        <Route path="/pos/payment/:orderId" element={
          <StaffRoute>
            <PaymentScreen />
          </StaffRoute>
        } />
        
        <Route path="/kitchen" element={
          <StaffRoute>
            <KitchenDisplay />
          </StaffRoute>
        } />
        <Route path="/customer-display" element={<CustomerDisplay />} />
        
        <Route path="/customer/tables" element={
          <CustomerRoute>
            <CustomerTableSelect />
          </CustomerRoute>
        } />
        
        <Route path="/customer/order-type" element={
          <CustomerRoute>
            <CustomerOrderType />
          </CustomerRoute>
        } />
        
        <Route path="/self-ordering/:tableId/:token" element={
          <CustomerRoute>
            <SelfOrdering />
          </CustomerRoute>
        } />

        <Route path="/self-ordering/takeaway" element={
          <CustomerRoute>
            <SelfOrdering />
          </CustomerRoute>
        } />
        
        <Route path="/bill/:orderId" element={<BillPage />} />
        
        <Route path="/" element={<IndexRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
