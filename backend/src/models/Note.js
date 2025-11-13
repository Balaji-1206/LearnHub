const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  attachments: [{ filename: String, url: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String, trim: true }],
  pinned: { type: Boolean, default: false }
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Note', NoteSchema);
