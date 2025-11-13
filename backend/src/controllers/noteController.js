const Note = require('../models/Note');
const Course = require('../models/Course');

const createNote = async (req, res) => {
  try {
    const { courseId, title, content } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const note = new Note({
      course: courseId,
      title,
      content,
      author: req.user._id,
      attachments: (req.files || []).map(f => ({ filename: f.filename, url: `/uploads/${f.filename}` })),
      tags: parseTags(req.body.tags)
    });
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listNotesForCourse = async (req, res) => {
  const notes = await Note.find({ course: req.params.courseId }).populate('author','name email');
  res.json(notes);
};

const ensureOwner = async (noteId, userId) => {
  const note = await Note.findById(noteId);
  if (!note) return { error: { status: 404, message: 'Note not found' } };
  if (String(note.author) !== String(userId)) return { error: { status: 403, message: 'Not allowed' } };
  return { note };
};

const updateNote = async (req, res) => {
  try {
    const { note, error } = await ensureOwner(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });
    const { title, content, tags, pinned } = req.body || {};
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = parseTags(tags);
    if (pinned !== undefined) note.pinned = Boolean(pinned);
    if (req.files && req.files.length) {
      // append new attachments
      note.attachments = note.attachments.concat((req.files || []).map(f => ({ filename: f.filename, url: `/uploads/${f.filename}` })));
    }
    await note.save();
    res.json(note);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { note, error } = await ensureOwner(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });
    await note.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

const togglePin = async (req, res) => {
  try {
    const { note, error } = await ensureOwner(req.params.id, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });
    note.pinned = !note.pinned;
    await note.save();
    res.json({ pinned: note.pinned, note });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update pin' });
  }
};

function parseTags(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr.map(String).map(s => s.trim()).filter(Boolean) : []; } catch { return []; }
}

module.exports = { createNote, listNotesForCourse, updateNote, deleteNote, togglePin };
