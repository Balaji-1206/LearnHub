require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const courseRoutes = require('./routes/courses');
const noteRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');
const progressRoutes = require('./routes/progress');

const app = express();
app.use(cors());
app.use(express.json());

// static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// connect db
connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub');

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);

// health
app.get('/', (req, res) => res.json({ ok: true, name: 'LearnHub API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
