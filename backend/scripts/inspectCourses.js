require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/learnhub';
  console.log('Using URI (redacted):', redact(uri));
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const total = await Course.countDocuments();
  const published = await Course.countDocuments({ published: true });
  console.log('Total courses:', total, 'Published:', published);
  const sample = await Course.find({}).limit(3);
  console.log('Sample titles:', sample.map(c => `${c.title} (published=${c.published})`));
  await mongoose.disconnect();
}

function redact(u){
  return String(u).replace(/(mongodb\+srv:\/\/)(.*?)(@)/,'$1<creds>$3');
}

run().catch(e => { console.error('inspectCourses error:', e); process.exit(1); });
