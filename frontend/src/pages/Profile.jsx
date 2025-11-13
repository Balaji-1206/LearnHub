// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { myEnrollments, getStreak, getCalendar, updateProfile, uploadAvatar, getCourse } from '../api';

export default function Profile({ user, setUser }) {
  const nav = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalStudyDays: 0, todayStudied: false });
  const [calendar, setCalendar] = useState({ from: null, to: null, days: [] });
  const [toLearn, setToLearn] = useState([]);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const completed = useMemo(() => (enrollments || []).filter(en => (en.progressPercent ?? 0) >= 100), [enrollments]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        // Build a 26-week (approx 6 months) window
        const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 181);
        const toStr = to.toISOString().slice(0,10);
        const fromStr = from.toISOString().slice(0,10);
        const [enRes, stRes, calRes] = await Promise.all([
          myEnrollments(),
          getStreak(),
          getCalendar({ from: fromStr, to: toStr })
        ]);
        if (!mounted) return;
        setEnrollments(Array.isArray(enRes.data) ? enRes.data : []);
        setStreak(stRes?.data || { currentStreak: 0, longestStreak: 0, totalStudyDays: 0, todayStudied: false });
        setCalendar(calRes?.data || { from: fromStr, to: toStr, days: [] });
        // Bookmarked courses (To Learn) from localStorage, excluding enrolled
        try {
          const raw = localStorage.getItem('learnhub_bookmarks');
          const slugs = raw ? JSON.parse(raw) : [];
          if (Array.isArray(slugs) && slugs.length) {
            const uniq = Array.from(new Set(slugs.filter(Boolean)));
            const results = await Promise.allSettled(uniq.map(s => getCourse(s)));
            const enrolledSlugs = new Set((Array.isArray(enRes.data) ? enRes.data : []).map(e => e.course?.slug).filter(Boolean));
            const courses = results
              .filter(r => r.status === 'fulfilled')
              .map(r => r.value?.data)
              .filter(c => c && !enrolledSlugs.has(c.slug));
            setToLearn(courses);
          } else {
            setToLearn([]);
          }
        } catch {}
      } catch (e) {
        if (mounted) setErr('Failed to load enrollments');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container p-0" style={{ maxWidth: 1080 }}>
      
      {/* helper for banner gradient */}
      {null}
      {/* Top row: Profile header (left) + Activity (right) */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="profile-hero card border-0 shadow-sm overflow-hidden h-100">
            <div className="profile-hero-banner" />
            <div className="p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="profile-avatar-lg me-3 position-relative" style={{ overflow: 'hidden' }}>
                  { (avatarPreview || user?.avatarUrl) ? (
                    <img src={avatarPreview || user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <div className="inner">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                  ) }
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    {!editing ? (
                      <h4 className="mb-1">{user?.name}</h4>
                    ) : (
                      <input className="form-control form-control-sm" style={{ maxWidth: 280 }} value={nameDraft} onChange={e=>setNameDraft(e.target.value)} />
                    )}
                    <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => { setEditing(e => !e); setNameDraft(user?.name || ''); setAvatarFile(null); setAvatarPreview(''); }}>
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  <div className="text-muted small">{user?.email}</div>
                  <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                    <span className="badge badge-soft-primary text-capitalize">{user?.role || 'user'}</span>
                    <span className="badge badge-soft-success">{enrollments.length} Enrolled</span>
                    <span className="badge bg-warning-subtle text-dark">🔥 {streak.currentStreak} day streak</span>
                    <span className="badge bg-light text-dark border">Longest {streak.longestStreak}</span>
                  </div>
                  {editing && (
                    <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
                      <label className="btn btn-sm btn-outline-secondary mb-0">
                        <i className="bi bi-image me-1"/> Choose Avatar
                        <input type="file" accept="image/*" className="d-none" onChange={(e)=>{
                          const f = e.target.files?.[0];
                          setAvatarFile(f||null);
                          if (f) {
                            const url = URL.createObjectURL(f);
                            setAvatarPreview(url);
                          } else { setAvatarPreview(''); }
                        }} />
                      </label>
                      {avatarFile && <span className="small text-muted">{avatarFile.name}</span>}
                      <button className="btn btn-sm btn-primary ms-auto" disabled={saving || !nameDraft?.trim()} onClick={async ()=>{
                        try {
                          setSaving(true);
                          const upRes = await updateProfile({ name: nameDraft.trim() });
                          let u = upRes?.data?.user || upRes?.data;
                          if (avatarFile) {
                            const fd = new FormData();
                            fd.append('avatar', avatarFile);
                            const avRes = await uploadAvatar(fd);
                            u = avRes?.data?.user || u;
                          }
                          setUser(prev => ({ ...(prev||{}), ...(u||{}) }));
                          setEditing(false);
                          setAvatarFile(null); setAvatarPreview('');
                        } catch (e) {
                          // optional: show toast/alert
                        } finally {
                          setSaving(false);
                        }
                      }}>{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          {/* Activity Calendar */}
          <div className="card shadow-sm p-3 p-md-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0">Activity</h5>
              {loading && <div className="spinner-border spinner-border-sm" role="status"/>}
            </div>
            <div className="text-muted small mb-2">Last 6 months of study activity</div>
            <ActivityHeatmap data={calendar} />
            <div className="heatmap-legend mt-2 small text-muted">
              Less
              <span className="legend-box" style={{ background: '#e9ecef' }}></span>
              <span className="legend-box" style={{ background: '#c6e48b' }}></span>
              <span className="legend-box" style={{ background: '#7bc96f' }}></span>
              <span className="legend-box" style={{ background: '#239a3b' }}></span>
              <span className="legend-box" style={{ background: '#196127' }}></span>
              More
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments */}
      <div className="card shadow-sm p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Enrolled Courses</h5>
          {loading && <div className="spinner-border spinner-border-sm" role="status"/>}
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        {!loading && enrollments.length === 0 && (
          <div className="text-muted">You haven't enrolled in any courses yet. Explore <a href="#/courses">Courses</a> to get started.</div>
        )}
        <div className="row g-3">
          {enrollments.map((en) => (
            <div key={en._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 course-card">
                <div className="course-banner" style={{ background: 'linear-gradient(135deg, #5b86e5, #36d1dc)' }} />
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="pe-2">
                      <h6 className="mb-1">{en.course?.title || 'Course'}</h6>
                      <div className="text-muted small">{en.course?.description}</div>
                    </div>
                    <span className="badge bg-primary">{en.course?.duration || 'TBD'}</span>
                  </div>

                  <div className="mt-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span className="text-capitalize">{en.course?.level || 'beginner'}</span>
                      <span>{en.progressPercent ?? 0}%</span>
                    </div>
                    <div className="progress progress-thin" style={{ height: 6 }}>
                      <div className="progress-bar" role="progressbar" style={{ width: `${en.progressPercent ?? 0}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-3 d-flex align-items-center justify-content-between">
                    <Link to={`/courses/${en.course?.slug}`} className="btn btn-sm btn-outline-secondary">Continue</Link>
                    <span className="small text-muted">Enrolled {new Date(en.enrolledAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* To Learn (Bookmarked but not enrolled) */}
      <div className="card shadow-sm p-3 p-md-4 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">To Learn</h5>
        </div>
        {toLearn.length === 0 ? (
          <div className="text-muted">No bookmarked courses. Bookmark courses from their detail page.</div>
        ) : (
          <div className="row g-3">
            {toLearn.map((c) => (
              <div key={`tolrn-${c._id}`} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 course-card">
                  <div className="course-banner" style={{ background: bannerFromTitle(c.title) }} />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="pe-2">
                        <h6 className="mb-1">{c.title}</h6>
                        <div className="text-muted small text-truncate" title={c.description || ''}>{c.description || '—'}</div>
                      </div>
                      <span className="badge bg-secondary text-capitalize">{c.level || 'beginner'}</span>
                    </div>
                    <div className="mt-3 d-flex align-items-center justify-content-between">
                      <Link to={`/courses/${c.slug}`} className="btn btn-sm btn-outline-primary">View</Link>
                      <span className="small text-muted">{c.duration || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Courses */}
      <div className="card shadow-sm p-3 p-md-4 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Completed Courses</h5>
          {loading && <div className="spinner-border spinner-border-sm" role="status"/ >}
        </div>
        {completed.length === 0 ? (
          <div className="text-muted">No completed courses yet. Keep learning!</div>
        ) : (
          <div className="row g-3">
            {completed.map((en) => (
              <div key={`completed-${en._id}`} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 course-card border-success">
                  <div className="course-banner" style={{ background: 'linear-gradient(135deg, #00b09b, #96c93d)' }} />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="pe-2">
                        <h6 className="mb-1">{en.course?.title || 'Course'}</h6>
                        <div className="text-muted small">{en.course?.description}</div>
                      </div>
                      <span className="badge bg-success">Completed</span>
                    </div>

                    <div className="mt-3">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span className="text-capitalize">{en.course?.level || 'beginner'}</span>
                        <span>100%</span>
                      </div>
                      <div className="progress progress-thin" style={{ height: 6 }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `100%` }}></div>
                      </div>
                    </div>

                    <div className="mt-3 d-flex align-items-center justify-content-between">
                      <Link to={`/courses/${en.course?.slug || en.course?._id}`} className="btn btn-sm btn-outline-success">Review</Link>
                      <span className="small text-muted">Enrolled {new Date(en.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout at bottom */}
      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-outline-danger"
          onClick={() => { localStorage.removeItem('learnhub_token'); setUser(null); nav('/login'); }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function bannerFromTitle(title) {
  const t = title || 'Course';
  let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  const hue = h % 360; const hue2 = (hue + 35) % 360;
  return `linear-gradient(135deg, hsl(${hue} 85% 45%), hsl(${hue2} 85% 55%))`;
}

function ActivityHeatmap({ data }) {
  // Build map for quick lookup
  const countMap = new Map((data.days || []).map(d => [d.date, d.count]));
  // Determine range and align to Sunday
  const to = data.to ? new Date(data.to) : new Date();
  const from = data.from ? new Date(data.from) : new Date(to.getTime() - 181*24*60*60*1000);
  const start = new Date(from);
  // align start to previous Sunday
  const day = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - day);
  start.setHours(0,0,0,0);

  const end = new Date(to);
  end.setHours(0,0,0,0);

  const weeks = [];
  let cursor = new Date(start);
  while (cursor <= end) {
    const col = [];
    for (let i = 0; i < 7; i++) {
      const key = dateKeyLocal(cursor);
      const count = countMap.get(key) || 0;
      col.push({ date: new Date(cursor), count });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(col);
  }

  const color = (c) => {
    if (c <= 0) return '#e9ecef';
    if (c === 1) return '#c6e48b';
    if (c === 2) return '#7bc96f';
    if (c <= 4) return '#239a3b';
    return '#196127';
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {(() => {
          const columns = [];
          weeks.forEach((col, i) => {
            const idx = col.findIndex(cell => cell.date.getDate() === 1);

            if (idx === -1) {
              // no month start inside this column, render as-is
              columns.push(
                <div key={i} className="heatmap-col">
                  {col.map((cell, j) => (
                    <div
                      key={j}
                      className="heatmap-cell"
                      title={`${cell.date.toDateString()} • ${cell.count} study ${cell.count===1?'event':'events'}`}
                      style={{ background: color(cell.count) }}
                    />
                  ))}
                </div>
              );
              return;
            }

            if (idx === 0) {
              // month starts at top of this column: add spacer before (if not the very first), then render full column
              if (columns.length) columns.push(<div key={`sp-${i}`} className="heatmap-spacer" aria-hidden />);
              columns.push(
                <div key={i} className="heatmap-col">
                  {col.map((cell, j) => (
                    <div
                      key={j}
                      className="heatmap-cell"
                      title={`${cell.date.toDateString()} • ${cell.count} study ${cell.count===1?'event':'events'}`}
                      style={{ background: color(cell.count) }}
                    />
                  ))}
                </div>
              );
              return;
            }

            // Month boundary occurs mid-column (e.g., ... Oct 31 | Nov 1 ...)
            // Render left part (up to previous day), spacer, then right part (with blanks above idx)
            columns.push(
              <div key={`${i}-left`} className="heatmap-col">
                {col.map((cell, j) => (
                  j < idx ? (
                    <div
                      key={j}
                      className="heatmap-cell"
                      title={`${cell.date.toDateString()} • ${cell.count} study ${cell.count===1?'event':'events'}`}
                      style={{ background: color(cell.count) }}
                    />
                  ) : (
                    <div key={j} className="heatmap-cell" style={{ background: 'transparent' }} aria-hidden />
                  )
                ))}
              </div>
            );
            columns.push(<div key={`sp-mid-${i}`} className="heatmap-spacer" aria-hidden />);
            columns.push(
              <div key={`${i}-right`} className="heatmap-col">
                {col.map((cell, j) => (
                  j < idx ? (
                    <div key={j} className="heatmap-cell" style={{ background: 'transparent' }} aria-hidden />
                  ) : (
                    <div
                      key={j}
                      className="heatmap-cell"
                      title={`${cell.date.toDateString()} • ${cell.count} study ${cell.count===1?'event':'events'}`}
                      style={{ background: color(cell.count) }}
                    />
                  )
                ))}
              </div>
            );
          });
          return columns;
        })()}
      </div>
    </div>
  );
}

function dateKeyLocal(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth()+1).padStart(2,'0');
  const dd = String(x.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
