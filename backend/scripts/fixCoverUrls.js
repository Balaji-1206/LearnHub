require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

const BASE = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');

  const courses = await Course.find({ $or: [ { 'cover.url': { $regex: '^/uploads' } }, { assets: { $exists: true, $ne: [] } } ] });
  let updated = 0;
  for (const c of courses) {
    let changed = false;
    if (c.cover && c.cover.url && c.cover.url.startsWith('/uploads')) {
      c.cover.url = BASE + c.cover.url;
      changed = true;
    }
    if (c.assets && Array.isArray(c.assets)) {
      c.assets = c.assets.map(a => {
        if (a.url && a.url.startsWith('/uploads')) {
          changed = true;
          return { ...a, url: BASE + a.url };
        }
        return a;
      });
    }
    if (changed) {
      await c.save();
      updated++;
      console.log(`Updated course: ${c.title}`);
    }
  }

  console.log(`✓ Updated ${updated} courses`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
