const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); // Importar la conexión a la base de datos
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

const ALLOWED_EMAILS = ["benjaminbarria06@gmail.com"];

const ADMIN_EMAILS = ["benjaminbarria06@gmail.com"];

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a la base de datos:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1); // detiene la app si no puede conectarse
  }
})();

// --- Middlewares ---

// Para que Express entienda los cuerpos JSON en peticiones POST/PUT
app.use(express.json());

// Configurar CORS para que frontend pueda hacer peticiones
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true, // importante para enviar cookies de sesión
}));

// Configurar sesión y passport (antes de las rutas)
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Passport setup ---
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    if (!ALLOWED_EMAILS.includes(email)) {
      return done(null, false, { message: "Correo no autorizado" });
    }
    return done(null, profile);
  }
));

// --- Rutas de autenticación ---
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    res.redirect('http://localhost:5173'); // Redirigir al frontend tras login
  }
);

// --- Rutas importadas ---
const subjectRoutes = require('./routes/subjects');
const questionRoutes = require('./routes/questions');
const examRoutes = require('./routes/exams');

// Importante: después de middleware, montar las rutas
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);

// --- Rutas adicionales para pruebas y ejemplo ---

app.get('/save', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, content TEXT)');
    await pool.query('INSERT INTO messages (content) VALUES ($1)', ['Hola desde PostgreSQL!']);
    res.send('Mensaje guardado en la base de datos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    const email = req.user.emails[0].value;
    res.json({
      id: req.user.id,
      name: req.user.displayName,
      email,
      isAdmin: ADMIN_EMAILS.includes(email)
    });
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('¡Bienvenido! Usa /save para guardar un mensaje y /messages para verlos.');
});

// --- Iniciar servidor ---
app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});
