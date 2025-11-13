const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../utils/fileStorage');
const { createNote, listNotesForCourse, updateNote, deleteNote, togglePin } = require('../controllers/noteController');

router.post('/', auth, upload.array('attachments', 5), createNote);
router.get('/course/:courseId', auth, listNotesForCourse);
router.patch('/:id', auth, upload.array('attachments', 5), updateNote);
router.delete('/:id', auth, deleteNote);
router.patch('/:id/pin', auth, togglePin);

module.exports = router;
