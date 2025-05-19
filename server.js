const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Конфигурация
const config = {
    telegramBotToken: '7683878117:AAHsMqQbFOEXrHv1J6emcKX0-A8T1zL677Q',
    telegramChatId: '6818531274',
    maxRequestsPerMinute: 10
};

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// CSRF защита
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: config.maxRequestsPerMinute,
    message: 'Слишком много запросов. Пожалуйста, подождите.'
});
app.use('/api/', limiter);

// Получение CSRF токена
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Обработка запросов поддержки
app.post('/api/support', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Валидация данных
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        // Формирование сообщения для Telegram
        const telegramMessage = `
🔔 Новый запрос в поддержку

👤 Имя: ${name}
📧 Email: ${email}
📝 Тема: ${subject}
💬 Сообщение:
${message}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
`;

        // Отправка сообщения в Telegram
        await axios.post(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            chat_id: config.telegramChatId,
            text: telegramMessage,
            parse_mode: 'HTML'
        });

        // Отправка подтверждения на email пользователя
        // TODO: Добавить отправку email

        res.json({ message: 'Ваше сообщение успешно отправлено' });

    } catch (error) {
        console.error('Ошибка при обработке запроса поддержки:', error);
        res.status(500).json({ message: 'Произошла ошибка при отправке сообщения' });
    }
});

// Обработка ошибок
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'Недействительный CSRF токен' });
    }
    next(err);
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`Бот поддержки: @Help_222_bot`);
}); 