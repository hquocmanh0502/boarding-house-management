const express       = require('express');
const dotenv        = require('dotenv');
const session       = require('express-session');
const flash         = require('connect-flash');
const path          = require('path');

const connectDB     = require('./config/db');
const { setLocals } = require('./middleware/auth');

const authRoutes    = require('./routes/auth');
const adminRoutes   = require('./routes/admin');
const userRoutes    = require('./routes/user');
const { payosWebhook } = require('./controllers/user/paymentController');

dotenv.config();
connectDB();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'boarding-house-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

app.use(flash());
app.use(setLocals);

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// PayOS webhook — không cần auth
app.post('/webhook/payos', payosWebhook);

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
});

app.use((req, res) => {
  res.status(404).send('404 - Trang khong tim thay');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chay tai http://localhost:${PORT}`);

  console.log(`Moi truong: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
