require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const total = await Course.countDocuments();
  const publishedCount = await Course.countDocuments({ published: true });
  console.log(`Total courses: ${total}`);
  console.log(`Published courses: ${publishedCount}`);
  const toPublish = await Course.find({ published: false });
  if (!toPublish.length) {
    console.log('No unpublished courses found. Nothing to do.');
    process.exit(0);
  }
  const ids = toPublish.map(c => c._id);
  await Course.updateMany({ _id: { $in: ids } }, { $set: { published: true } });
  const after = await Course.countDocuments({ published: true });
  console.log(`Published flag set on ${ids.length} courses. New published count: ${after}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error('Error publishing courses:', e); process.exit(1); });
