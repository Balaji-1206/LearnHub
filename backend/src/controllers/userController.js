const path = require('path');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { upload } = require('../utils/fileStorage');

const me = async (req, res) => {
  // normalize avatar to absolute URL if needed
  const host = req.protocol + '://' + req.get('host');
  const u = req.user.toObject();
  if (u.avatarUrl && u.avatarUrl.startsWith('/uploads')) {
    u.avatarUrl = host + u.avatarUrl;
  }
  res.json({ user: u });
};

const listUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
};

const myEnrollments = async (req, res) => {
  const list = await Enrollment.find({ user: req.user._id, active: true })
    .populate({ path: 'course', select: 'title slug description duration level cover tags price published instructor createdAt' });

  const host = req.protocol + '://' + req.get('host');
  const normalized = list.map(e => {
    const obj = e.toObject();
    if (obj.course && obj.course.cover && obj.course.cover.url && obj.course.cover.url.startsWith('/uploads')) {
      obj.course.cover.url = host + obj.course.cover.url;
    }
    return obj;
  });
  res.json(normalized);
};

module.exports = { me, listUsers, myEnrollments };
// Additional profile endpoints

const updateMe = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    req.user.name = String(name).trim();
    await req.user.save();
    const host = req.protocol + '://' + req.get('host');
    const u = req.user.toObject();
    if (u.avatarUrl && u.avatarUrl.startsWith('/uploads')) u.avatarUrl = host + u.avatarUrl;
    res.json({ user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const uploadAvatarHandler = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      // store relative URL starting with /uploads
      const rel = '/uploads/' + path.basename(req.file.path);
      req.user.avatarUrl = rel;
      await req.user.save();
      const host = req.protocol + '://' + req.get('host');
      res.json({ avatarUrl: host + rel, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatarUrl: host + rel } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  }
];

module.exports.updateMe = updateMe;
module.exports.uploadAvatarHandler = uploadAvatarHandler;
