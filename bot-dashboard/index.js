require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// Inicializamos express
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Configurar las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Carpeta pública para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar la sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport (para autenticación)
app.use(passport.initialize());
app.use(passport.session());

// Configurar rutas básicas
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Ruta protegida (ejemplo de configuración del bot)
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user });
});

// **Mantener el bot activo mediante ping**
const BOT_URL = `https://reforward.onrender.com`; // Si está en Render, usa la URL pública de Render aquí.
setInterval(() => {
  fetch(BOT_URL)
    .then(res => console.log(`Ping a ${BOT_URL}: ${res.status}`))
    .catch(err => console.error('Error al hacer ping:', err));
}, 5 * 60 * 1000); // Ping cada 5 minutos

// Escuchando el servidor
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
