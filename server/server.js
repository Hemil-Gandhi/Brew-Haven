require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('io', io); // Make socket.io available to routes/controllers

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/pos-config', require('./routes/posConfigRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

// Socket.io for Real-time Kitchen Display
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('new_order', (order) => {
    io.emit('order_received', order);
  });

  socket.on('update_order_status', (data) => {
    io.emit('order_status_updated', data);
  });

  socket.on('table_status_change', (data) => {
    io.emit('table_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('Brew Haven API Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
