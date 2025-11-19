const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ name, email, passwordHash, role: role || 'student' });
    await user.save();

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing at register');
      return res.status(500).json({ message: 'Server config error: missing JWT_SECRET' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ? (user.avatarUrl.startsWith('/uploads') ? (req.protocol + '://' + req.get('host') + user.avatarUrl) : user.avatarUrl) : undefined } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', detail: process.env.DEBUG_AUTH ? (err.message || 'unknown') : undefined });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing at login');
      return res.status(500).json({ message: 'Server config error: missing JWT_SECRET' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl ? (user.avatarUrl.startsWith('/uploads') ? (req.protocol + '://' + req.get('host') + user.avatarUrl) : user.avatarUrl) : undefined } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', detail: process.env.DEBUG_AUTH ? (err.message || 'unknown') : undefined });
  }
};

module.exports = { register, login };
