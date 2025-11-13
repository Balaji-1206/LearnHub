const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const { auth, requireRole } = require('../middleware/auth');

// admin stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  const courses = await Course.countDocuments();
  const users = await User.countDocuments();
  const enrollments = await Enrollment.countDocuments();
  res.json({ courses, users, enrollments });
});

module.exports = router;
