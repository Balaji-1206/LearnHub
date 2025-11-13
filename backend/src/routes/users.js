const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { me, listUsers, myEnrollments, updateMe, uploadAvatarHandler } = require('../controllers/userController');

router.get('/me', auth, me);
router.get('/', auth, listUsers); // admin or protected - simple for demo
router.get('/me/enrollments', auth, myEnrollments);
router.patch('/me', auth, updateMe);
router.post('/me/avatar', auth, ...uploadAvatarHandler);

module.exports = router;
