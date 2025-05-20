require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({ secret: process.env.SESSION_SECRET || 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/future-talk', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Save user to database
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Verify user and generate JWT
        const token = jwt.sign({ userId: 'user_id' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
});

app.post('/api/support', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'support@futuretalk.com',
            subject: `Support Request: ${subject}`,
            text: `From: ${name} (${email})\n\n${message}`
        });
        res.json({ message: 'Support request sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send support request' });
    }
});

// Запрос на сброс пароля
app.post('/api/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            // Генерируем токен
            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 час
            await user.save();
            // Отправляем письмо
            const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Восстановление пароля FUTURE TALK',
                html: `<p>Для сброса пароля перейдите по ссылке:<br><a href="${resetUrl}">${resetUrl}</a><br>Ссылка действительна 1 час.</p>`
            });
        }
        // Не раскрываем, есть ли email
        res.json({ message: 'Если такой email зарегистрирован, мы отправили на него инструкцию по восстановлению.' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка отправки письма' });
    }
});

// Сброс пароля по токену
app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ error: 'Ссылка для сброса пароля недействительна или устарела.' });
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Пароль успешно изменён!' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сброса пароля' });
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Здесь можно найти или создать пользователя в базе данных
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// WebSocket setup
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('chat message', (msg) => {
        // Handle chat messages
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
}); 