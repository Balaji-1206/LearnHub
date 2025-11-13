const slugify = (s) => s.toLowerCase().replace(/[^\w]+/g,'-').replace(/^-|-$/g,'');

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const createCourse = async (req, res) => {
  try {
    const { title, description, longDescription, duration, level, tags, price, published } = req.body;
    const slug = slugify(title);
    const existing = await Course.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Course with similar title exists' });

    const host = req.protocol + '://' + req.get('host');

    const course = new Course({
      title,
      slug,
      description,
      longDescription: longDescription || '',
      duration: duration || '',
      level: level || 'beginner',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      price: price || 0,
      published: !!published,
      instructor: req.user._id,
      assets: (req.files && req.files.assets ? (req.files.assets || []).map(f => ({ filename: f.filename, url: `${host}/uploads/${f.filename}`, mimetype: f.mimetype })) : []),
      cover: (req.files && req.files.cover && req.files.cover[0]) ? { filename: req.files.cover[0].filename, url: `${host}/uploads/${req.files.cover[0].filename}`, mimetype: req.files.cover[0].mimetype } : undefined
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const listCourses = async (req, res) => {
  const { tag, q, instructor, page = 1, limit = 20 } = req.query;
  const filter = { published: true };
  if (tag) filter.tags = tag;
  if (instructor) filter.instructor = instructor;
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  const skip = (page - 1) * limit;
  const courses = await Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('instructor','name email');
  // ensure cover and asset urls are absolute (in case older entries used relative paths)
  const host = req.protocol + '://' + req.get('host');
  const normalized = courses.map(c => {
    const obj = c.toObject();
    if (obj.cover && obj.cover.url && obj.cover.url.startsWith('/uploads')) obj.cover.url = host + obj.cover.url;
    if (obj.assets && Array.isArray(obj.assets)) obj.assets = obj.assets.map(a => ({ ...a, url: a.url && a.url.startsWith('/uploads') ? host + a.url : a.url }));
    return obj;
  });
  res.json(normalized);
};

const getCourse = async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate('instructor','name email');
  if (!course) return res.status(404).json({ message: 'Not found' });
  const host = req.protocol + '://' + req.get('host');
  const obj = course.toObject();
  if (obj.cover && obj.cover.url && obj.cover.url.startsWith('/uploads')) obj.cover.url = host + obj.cover.url;
  if (obj.assets && Array.isArray(obj.assets)) obj.assets = obj.assets.map(a => ({ ...a, url: a.url && a.url.startsWith('/uploads') ? host + a.url : a.url }));
  res.json(obj);
};

const enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (enrollment) return res.status(400).json({ message: 'Already enrolled' });

    enrollment = new Enrollment({ user: req.user._id, course: courseId });
    await enrollment.save();
    res.json({ enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createCourse, listCourses, getCourse, enroll };
