require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI in environment. Set it before running.');
    process.exit(1);
  }
  console.log('Testing MongoDB connection...');
  console.log('URI (redacted):', redact(uri));
  try {
    const start = Date.now();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 8000
    });
    const ms = Date.now() - start;
    console.log(`✓ Connected in ${ms}ms`);
    const admin = mongoose.connection.db.admin();
    const info = await admin.serverStatus().catch(() => null);
    if (info) console.log('ServerStatus ok, version:', info.version);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection failed');
    console.error('Message:', err && err.message);
    if (err && err.reason) console.error('Reason:', err.reason);
    if (err && err.code) console.error('Code:', err.code);
    process.exit(1);
  }
}

function redact(u) {
  try {
    const m = String(u).match(/mongodb\+srv:\/\/(.*)@/i);
    if (!m) return u;
    return u.replace(m[1], '<redacted>');
  } catch { return u; }
}

main();
