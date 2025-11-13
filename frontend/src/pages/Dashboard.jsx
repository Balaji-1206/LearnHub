// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCourses, adminStats, myEnrollments, getStreak } from '../api';

export default function Dashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, users: 0, enrollments: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [counts, setCounts] = useState({ courses: 0, users: 0, enrollments: 0 });
  const [enrollments, setEnrollments] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await listCourses();
        const data = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        setCourses(data.slice(0, 6)); // show first 6
      } catch (e) {
        setCourses([]);
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [adminRes, enRes, stRes] = await Promise.allSettled([
          adminStats(),
          myEnrollments(),
          getStreak()
        ]);

        if (!mounted) return;

        // admin stats (optional)
        if (adminRes.status === 'fulfilled') {
          const s = adminRes.value.data || {};
          setStats({ courses: s.courses || 0, users: s.users || 0, enrollments: s.enrollments || 0 });
        } else {
          // keep zeros if not available
          setStats((s) => ({ ...s }));
        }

        // my enrollments
        if (enRes.status === 'fulfilled') {
          const list = Array.isArray(enRes.value.data) ? enRes.value.data : (enRes.value.data?.enrollments || []);
          setEnrollments(list);
        }

        // streak
        if (stRes.status === 'fulfilled') {
          const st = stRes.value.data || {};
          setStreak({ currentStreak: st.currentStreak || 0, longestStreak: st.longestStreak || 0 });
        }
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // animate counters (simple easing)
  useEffect(() => {
    const duration = 900;
    const frameRate = 30;
    const steps = Math.round(duration / (1000 / frameRate));
    const from = { ...counts };
    const to = { ...stats };
    let step = 0;
    const id = setInterval(() => {
      step++;
      const t = step / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // some easing
      setCounts({
        courses: Math.round(from.courses + (to.courses - from.courses) * ease),
        users: Math.round(from.users + (to.users - from.users) * ease),
        enrollments: Math.round(from.enrollments + (to.enrollments - from.enrollments) * ease),
      });
      if (step >= steps) clearInterval(id);
    }, Math.round(1000 / frameRate));
    return () => clearInterval(id);
    // we want to animate whenever stats change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  return (
    <div className="home-root">
      {/* HERO */}
      <section className="hero rounded-3 p-4 mb-4">
        <div className="container">
          <div className="row align-items-center gx-4">
            <div className="col-lg-7">
              <h1 className="hero-title">Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋</h1>
              <p className="lead hero-sub">
                Keep your streak alive and continue where you left off.
              </p>

              <div className="d-flex gap-2 flex-wrap mt-3">
                <Link to="/courses" className="btn btn-primary btn-lg me-2">Browse Courses</Link>
                <Link to="/notes" className="btn btn-outline-primary btn-lg">View Notes</Link>
              </div>

              <div className="d-flex gap-3 mt-4 stats-row">
                <div className="stat">
                  <div className="stat-number">{enrollments.length}</div>
                  <div className="stat-label">My Enrollments</div>
                </div>
                <div className="stat">
                  <div className="stat-number">{streak.currentStreak}🔥</div>
                  <div className="stat-label">Current Streak (days)</div>
                </div>
                <div className="stat">
                  <div className="stat-number">{streak.longestStreak}</div>
                  <div className="stat-label">Longest Streak</div>
                </div>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="ad-card p-3 h-100 d-flex flex-column justify-content-center">
                <div className="ad-badge mb-2">POPULAR</div>
                <h5 className="mb-1">Full-Stack Basics</h5>
                <p className="text-muted small mb-3">30 lessons • 12 hours • Beginner friendly</p>
                <div className="mb-3">
                  <div className="progress" style={{ height: 10 }}>
                    <div className="progress-bar" style={{ width: '60%' }} />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link to="/courses" className="btn btn-sm btn-primary">Enroll Now</Link>
                  <Link to="/courses" className="btn btn-sm btn-outline-secondary">Preview</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHORTCUTS */}
      <section className="container mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="m-0">Quick actions</h4>
          <small className="text-muted">Shortcuts to what you need</small>
        </div>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <Link to="/courses" className="shortcut-card p-3 d-block text-decoration-none">
              <div className="shortcut-icon bg-primary text-white mb-2">📚</div>
              <div className="fw-bold">Courses</div>
              <small className="text-muted">Browse & enroll</small>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/notes" className="shortcut-card p-3 d-block text-decoration-none">
              <div className="shortcut-icon bg-success text-white mb-2">🗒️</div>
              <div className="fw-bold">Notes</div>
              <small className="text-muted">Upload & download</small>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/profile" className="shortcut-card p-3 d-block text-decoration-none">
              <div className="shortcut-icon bg-warning text-white mb-2">👤</div>
              <div className="fw-bold">Profile</div>
              <small className="text-muted">View & edit</small>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/courses" className="shortcut-card p-3 d-block text-decoration-none">
              <div className="shortcut-icon bg-info text-white mb-2">⚡</div>
              <div className="fw-bold">My Progress</div>
              <small className="text-muted">Track progress</small>
            </Link>
          </div>
        </div>
      </section>

      {/* CONTINUE LEARNING */}
      <section className="container mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0">Continue learning</h4>
          {loadingStats && <small className="text-muted">Loading…</small>}
        </div>
        {enrollments.length === 0 ? (
          <div className="text-muted">You haven't enrolled in any courses yet. Explore <Link to="/courses">Courses</Link> to get started.</div>
        ) : (
          <div className="row g-3">
            {enrollments.slice(0, 3).map(en => (
              <div key={en._id} className="col-12 col-md-4">
                <div className="card course-card h-100">
                  <div className="course-banner" style={{ background: 'linear-gradient(135deg, #5b86e5, #36d1dc)' }} />
                  <div className="card-body d-flex flex-column">
                    <h6 className="mb-1">{en.course?.title}</h6>
                    <div className="text-muted small mb-2">{en.course?.description?.slice(0, 90)}</div>
                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      <div className="small text-muted">{en.progressPercent ?? 0}%</div>
                      <Link to={`/courses/${en.course?.slug || en.course?._id}`} className="btn btn-sm btn-outline-primary">Continue</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COURSES PREVIEW */}
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Recently added</h5>
          <Link to="/courses" className="small">See all courses →</Link>
        </div>

        <div className="row g-3">
          {courses.length ? courses.map(c => (
            <div key={c._id} className="col-12 col-md-4">
              <div className="card course-card h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title">{c.title}</h6>
                  <p className="text-muted small mb-3">{c.description?.slice(0, 110)}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <small className="text-muted">{(c.tags || []).slice(0,2).join(' • ')}</small>
                    <Link to={`/courses/${c.slug || c._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12 text-muted">No courses to show.</div>
          )}
        </div>
      </section>
    </div>
  );
}
