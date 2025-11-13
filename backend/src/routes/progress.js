const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { recordStudy, getStreak, getCalendar } = require('../controllers/progressController');

router.post('/ping', auth, recordStudy);
router.get('/streak', auth, getStreak);
router.get('/calendar', auth, getCalendar);

module.exports = router;
