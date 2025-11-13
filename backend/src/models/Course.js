const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  longDescription: { type: String, default: '' },
  duration: { type: String, default: '' },
  level: { type: String, default: 'beginner' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  price: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  cover: { filename: String, url: String, mimetype: String },
  assets: [{ filename: String, url: String, mimetype: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Course', CourseSchema);
