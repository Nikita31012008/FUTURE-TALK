const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Регистрация
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание пользователя
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName
      }
    });

    // Генерация токена
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Ошибка при регистрации пользователя'
    });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка наличия email и пароля
    if (!email || !password) {
      return res.status(400).json({
        error: 'Пожалуйста, укажите email и пароль'
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Проверка статуса пользователя
    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Ваш аккаунт заблокирован или неактивен'
      });
    }

    // Обновление времени последнего входа
    user.lastLogin = Date.now();
    await user.save();

    // Генерация токена
    const token = generateToken(user._id);

    res.json({
      status: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Ошибка при входе в систему'
    });
  }
};

// Сброс пароля
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'Пользователь с таким email не найден'
      });
    }

    // Генерация токена для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 час
    await user.save();

    // Отправка email
    // ... код отправки email ...

    res.json({
      status: 'success',
      message: 'Инструкции по сбросу пароля отправлены на ваш email'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Ошибка при обработке запроса на сброс пароля'
    });
  }
}; 