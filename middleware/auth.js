const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // 1. Получаем токен
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Для доступа к этому ресурсу необходима авторизация' 
      });
    }

    // 2. Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Проверяем существование пользователя
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Пользователь с данным токеном больше не существует' 
      });
    }

    // 4. Проверяем статус пользователя
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Ваш аккаунт заблокирован или неактивен' 
      });
    }

    // Добавляем пользователя в объект запроса
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Ошибка аутентификации' 
    });
  }
};

// Middleware для проверки роли
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'У вас нет прав для выполнения этого действия'
      });
    }
    next();
  };
}; 