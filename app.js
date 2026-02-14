const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const path = require('path');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

/*
// Middleware para conectar a DB en cada solicitud (si no está conectada)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
*/

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta para servir login.html en la raíz (opcional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Middleware de errores
app.use(errorMiddleware);

// Conexión a MongoDB optimizada para serverless
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    cachedDb = conn;
    console.log('MongoDB conectado');
    return conn;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
}

// Exportar la app y la función connectDB para usarla en las rutas si es necesario
module.exports = { app, connectDB };

// Para Vercel, exportamos la app como handler
module.exports = app;