const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../utils/fileStorage');

const { createCourse, listCourses, getCourse, enroll } = require('../controllers/courseController');

// public list
router.get('/', listCourses);
router.get('/:slug', getCourse);

// instructor protected
// accept one cover image and up to 5 asset files
router.post('/', auth, requireRole('instructor'), upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'assets', maxCount: 5 }]), createCourse);

// enroll
router.post('/enroll', auth, enroll);

module.exports = router;
