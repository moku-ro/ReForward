require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 4000;
const Config = require('../models/Config');

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Configurar las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Modelo de configuración
const Config = require('./models/Config');

// Rutas
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  const config = await Config.findOne();
  res.render('dashboard', { user: req.user, config });
});

app.post('/update-config', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  const { arteChannelId, anunciosChannelId, keywords } = req.body;
  
  try {
    let config = await Config.findOne();
    if (!config) {
      config = new Config();
    }
    
    config.arteChannelId = arteChannelId;
    config.anunciosChannelId = anunciosChannelId;
    config.keywords = keywords.split(',').map(k => k.trim());
    
    await config.save();
    
    res.json({ success: true, message: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// Mantener el bot activo mediante ping
const BOT_URL = `https://reforward.onrender.com`;
setInterval(() => {
  fetch(BOT_URL)
    .then(res => console.log(`Ping a ${BOT_URL}: ${res.status}`))
    .catch(err => console.error('Error al hacer ping:', err));
}, 5 * 60 * 1000);

// Conectar a MongoDB y iniciar el servidor
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
    });
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));