require('dotenv').config();
const express = require('express');
const path = require('path'); // Add this line
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const supportRoutes = require('./routes/supportRoutes');
const cors = require('cors');
const connectDB = require('./config/db');
connectDB();

const app = express();

// Serving static files (optional, depending on your use case)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse JSON
app.use(express.json());

// // CORS configuration
// const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

// app.use(
//   cors({
//     origin: allowedOrigins,  // Allow all origins if '*'
//     // origin: "*",  // Allow all origins if '*'
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  // Add 'PATCH' here
//     credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
//   })
// );

const allowedOrigins = [
  'https://iceusers.info',
  'http://iceusers.info',
  'https://www.iceusers.info',
  'http://www.iceusers.info',
  'https://saipunt.info',
  'http://saipunt.info',
  'https://www.saipunt.info',
  'http://www.saipunt.info',
  'https://iceusers.vercel.app',
  'http://iceusers.vercel.app',
  'https://iceusers.onrender.com',
  'https://www.the247panel.shop',
  'https://the247panel.shop',
  'https://the247panel.vercel.app',
  'https://saipuntinfo.vercel.app',
  'https://icepanels.vercel.app',
  'https://icepanels.pro',
  'https://www.icepanels.info',
  'https://icepanels.info',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.iceusers.info') ||
        normalizedOrigin === 'https://iceusers.info' ||
        normalizedOrigin === 'http://iceusers.info' ||
        normalizedOrigin.endsWith('.saipunt.info') ||
        normalizedOrigin === 'https://saipunt.info' ||
        normalizedOrigin === 'http://saipunt.info' ||
        normalizedOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);
// Registering routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/support', supportRoutes);

// Handling dynamic port for Vercel or fallback to local port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
