require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initSockets } = require('./sockets');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ---------- Health check (Render pings this to confirm the app is up) ----------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ---------- DB connection status — open this in browser to diagnose ----------
app.get('/api/status', (req, res) => {
  const mongoose = require('mongoose');
  const states = { 0:'disconnected', 1:'connected', 2:'connecting', 3:'disconnecting' };
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({
    server: 'running',
    database: state,
    ready: mongoose.connection.readyState === 1,
    mongo_uri_set: !!process.env.MONGO_URI,
  });
});

// ---------- One-time seed (protected by x-seed-secret header) ----------
app.use('/api/admin', require('./routes/seedRoutes'));

// ---------- API routes ----------
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));
app.use('/api/categories',require('./routes/categoryRoutes'));
app.use('/api/menu',      require('./routes/menuRoutes'));
app.use('/api/tables',    require('./routes/tableRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/expenses',  require('./routes/expenseRoutes'));
app.use('/api',           require('./routes/attendanceRoutes'));
app.use('/api/settings',  require('./routes/settingsRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

// ---------- Frontend ----------
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

// ---------- Start HTTP server FIRST so Render detects the open port,
//            THEN connect to MongoDB in the background ----------
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSockets(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  // Connect to MongoDB after the port is already bound
  connectDB();
});
