const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  itemId: { type: String }, // lesson id or note id
  completed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);
