const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const toyRoutes = require('./routes/toyRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Env vars
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in .env file');
  process.exit(1);
}

const isProd = NODE_ENV === 'production';

// Core middleware
app.use(express.json({ limit: '1mb' })); // requests are small; file uploads go via multer, not JSON
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools/no origin and listed origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// Trust proxy only in prod behind a proxy
if (isProd) {
  app.set('trust proxy', 1);
}

// Sessions (if using cookie-based auth anywhere)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24, // 1 day
    }),
    cookie: {
      httpOnly: true,
      secure: isProd, // HTTPS required in production
      sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site cookies in prod
      maxAge: 1000 * 60 * 60 * 24,
    },
    name: 'sid',
  })
);

// Static for uploaded files (mounted early)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health routes
app.get('/health', (req, res) => res.status(200).json({ ok: true }));
app.get('/', (req, res) => {
  res.send('Toy Store API is running 🎉');
});

// Mount routes
app.use('/api', authRoutes);
app.use('/api/toys', toyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// MongoDB connection and server start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (${NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
