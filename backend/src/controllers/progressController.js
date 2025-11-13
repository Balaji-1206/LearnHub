const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23,59,59,999);
  return x;
}
function dateKey(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth()+1).padStart(2,'0');
  const dd = String(x.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

// POST /api/progress/ping { courseId }
const recordStudy = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId, active: true });
    if (!enrollment) return res.status(400).json({ message: 'Not enrolled in this course' });

    const from = startOfDay(new Date());
    const to = endOfDay(new Date());
    const existing = await Progress.findOne({ enrollment: enrollment._id, timestamp: { $gte: from, $lte: to } });
    if (existing) return res.json({ ok: true, message: 'Already recorded for today' });

    const p = new Progress({ enrollment: enrollment._id, completed: true, timestamp: new Date() });
    await p.save();
    res.json({ ok: true, message: 'Study recorded for today', progressId: p._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/progress/streak
const getStreak = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, active: true }).select('_id');
    const ids = enrollments.map(e => e._id);
    if (ids.length === 0) return res.json({ currentStreak: 0, longestStreak: 0, totalStudyDays: 0, todayStudied: false });

    const events = await Progress.find({ enrollment: { $in: ids } }).select('timestamp').sort({ timestamp: 1 });
    const daySet = new Set(events.map(e => dateKey(e.timestamp)));
    const days = Array.from(daySet).sort(); // ascending YYYY-MM-DD

    // longest streak
    let longest = 0, cur = 0, prev = null;
    for (const d of days) {
      if (prev) {
        const prevDate = new Date(prev);
        const curDate = new Date(d);
        const diff = (curDate - prevDate) / (1000*60*60*24);
        if (diff === 1) cur += 1; else cur = 1;
      } else {
        cur = 1;
      }
      if (cur > longest) longest = cur;
      prev = d;
    }

    // current streak (count backwards from today)
    const today = dateKey(new Date());
    let current = 0;
    let cursor = new Date();
    while (daySet.has(dateKey(cursor))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    res.json({
      currentStreak: current,
      longestStreak: longest,
      totalStudyDays: daySet.size,
      todayStudied: daySet.has(today),
      lastStudyDate: days.length ? days[days.length - 1] : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/progress/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
const getCalendar = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, active: true }).select('_id');
    const ids = enrollments.map(e => e._id);
    if (ids.length === 0) return res.json({ from: null, to: null, days: [] });

    const parseDay = (s) => {
      if (!s) return null;
      const [y,m,d] = s.split('-').map(Number);
      if (!y || !m || !d) return null;
      const dt = new Date(Date.UTC(y, m-1, d, 0, 0, 0, 0));
      return dt;
    };

    const today = new Date(); today.setHours(23,59,59,999);
    const defaultFrom = new Date(); defaultFrom.setDate(defaultFrom.getDate() - 179); defaultFrom.setHours(0,0,0,0);
    const from = parseDay(req.query.from) || defaultFrom;
    const to = parseDay(req.query.to) || today;

    // safety clamp: max 400 days
    const maxRangeDays = 400;
    const diffDays = Math.ceil((to - from) / (1000*60*60*24));
    if (diffDays > maxRangeDays) {
      from.setTime(to.getTime() - (maxRangeDays-1) * 24*60*60*1000);
      from.setHours(0,0,0,0);
    }

    const events = await Progress.find({
      enrollment: { $in: ids },
      timestamp: { $gte: from, $lte: to }
    }).select('timestamp');

    const counts = new Map();
    for (const e of events) {
      const k = dateKey(e.timestamp);
      counts.set(k, (counts.get(k) || 0) + 1);
    }

    const days = Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
    res.json({ from: dateKey(from), to: dateKey(to), days });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { recordStudy, getStreak, getCalendar };
