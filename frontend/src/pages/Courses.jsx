// src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listCourses, enroll, myEnrollments } from '../api';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // enroll visual states
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(() => new Set());
  const [confetti, setConfetti] = useState(false);
  // helpers for decorative banner (used when images are unavailable)
  const bannerStyle = (title) => {
    const t = title || 'Course';
    let h = 0;
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    const hue2 = (hue + 35) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hue} 85% 45%), hsl(${hue2} 85% 55%))`
    };
  };

  const initials = (title) => {
    const words = (title || 'C').split(/\s+/).filter(Boolean);
    return (words[0]?.[0] || 'C').toUpperCase() + (words[1]?.[0] || '').toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr('');
    listCourses()
      .then(res => {
        if (!mounted) return;
        // backend may return array or {data:..., meta:...}; handle both
        const data = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        setCourses(data);
        setFiltered(data);
      })
      .catch(e => {
        console.error(e);
        setErr('Unable to load courses. Make sure the backend is running.');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // preload enrolled courses so buttons show "Enrolled" immediately
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await myEnrollments();
        const list = Array.isArray(res.data) ? res.data : (res.data?.enrollments || res.data || []);
        const ids = new Set(
          list
            .map(e => e.course?._id || e.course) // supports populated or plain id
            .filter(Boolean)
        );
        if (mounted) setEnrolledIds(ids);
      } catch (e) {
        // likely unauthenticated; ignore silently on courses listing
      }
    })();
    return () => { mounted = false; };
  }, []);

  // search handling (client-side)
  useEffect(() => {
    const term = q.trim().toLowerCase();
    // reflect q in URL for shareability
    if (q) setSearchParams({ q }); else setSearchParams({});
    if (!term) {
      setFiltered(courses);
      setPage(1);
      return;
    }
    const out = courses.filter(c => {
      const title = (c.title || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const tags = (c.tags || []).join(' ').toLowerCase();
      return title.includes(term) || desc.includes(term) || tags.includes(term);
    });
    setFiltered(out);
    setPage(1);
  }, [q, courses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleEnroll = async (id) => {
    try {
      setEnrollingId(id);
      await enroll(id);
      setMsg({ type: 'success', text: 'Enrolled successfully.' });
      setEnrolledIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
      // optional: refresh courses or user info if API returns enrollment info
    } catch (e) {
      const server = e.response?.data?.message || 'Enroll failed';
      setMsg({ type: 'danger', text: server });
    }
    // auto clear message after a few seconds
    setTimeout(() => setMsg(null), 4000);
    setEnrollingId(null);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Courses</h3>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control form-control-sm"
            style={{ minWidth: 220 }}
            placeholder="Search courses (title, desc, tags)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : err ? (
        <div className="alert alert-danger">{err}</div>
      ) : (
        <>
          <div className="row g-3">
            {pageItems.map(c => (
              <div key={c._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 course-card shadow-sm">
                  {/* Decorative banner instead of image */}
                  <div className="course-banner" style={bannerStyle(c.title)}>
                    <div className="course-badges">
                      {c.level && <span className="badge bg-dark text-white me-2 text-capitalize">{c.level}</span>}
                      <span className="badge bg-primary">{c.duration || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{c.title}</h5>
                    <p className="card-text text-muted" style={{ minHeight: 56 }}>
                      {(c.description || '').slice(0, 120)}{(c.description || '').length > 120 ? '...' : ''}
                    </p>
                    <div className="mb-2">
                      {(c.tags || []).slice(0,3).map((t, i) => (
                        <span key={i} className="badge bg-light text-dark me-1">{t}</span>
                      ))}
                    </div>
                    <div className="d-flex align-items-center mb-2 small text-muted">
                      <span className="me-3">{c.instructor?.name || c.instructor || 'Instructor'}</span>
                      <span className="vr me-3"/>
                      <span>{c.price ? `$${c.price}` : 'Free'}</span>
                    </div>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div className="ms-auto">
                        <Link className="btn btn-sm btn-outline-secondary me-2" to={`/courses/${c.slug || c._id}`}>View</Link>
                        {enrolledIds.has(c._id) ? (
                          <button className="btn btn-sm btn-success btn-pulse-success" disabled>
                            <i className="bi bi-check-circle me-1"/> Enrolled
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-primary" disabled={enrollingId===c._id} onClick={() => handleEnroll(c._id)}>
                            {enrollingId===c._id ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Enrolling…</>) : 'Enroll'}
                          </button>
                        )}
                      </div>
                    </div>
      {confetti && (
        <div className="confetti-overlay">
          {Array.from({ length: 100 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.4;
            const duration = 1.8 + Math.random() * 1.2;
            const rotate = Math.random() * 360;
            const colors = ['#0d6efd','#6610f2','#6f42c1','#198754','#fd7e14','#dc3545','#20c997'];
            const color = colors[i % colors.length];
            const style = { left: left + '%', backgroundColor: color, animationDelay: `${delay}s`, animationDuration: `${duration}s`, transform: `rotate(${rotate}deg)` };
            return <span key={i} className="confetti-piece" style={style} />;
          })}
        </div>
      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Showing {(filtered.length === 0) ? 0 : ((page - 1) * pageSize + 1)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} courses
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(1)}>&laquo;</button>
                </li>
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                </li>

                {/* small numeric window */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pnum = i + 1;
                  // show only some pages if many
                  if (totalPages > 7) {
                    if (pnum === 1 || pnum === totalPages || (pnum >= page - 1 && pnum <= page + 1)) {
                      return (
                        <li key={pnum} className={`page-item ${pnum === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(pnum)}>{pnum}</button>
                        </li>
                      );
                    }
                    if (pnum === 2 && page > 4) {
                      return <li key={'dots1'} className="page-item disabled"><span className="page-link">…</span></li>;
                    }
                    if (pnum === totalPages - 1 && page < totalPages - 3) {
                      return <li key={'dots2'} className="page-item disabled"><span className="page-link">…</span></li>;
                    }
                    return null;
                  }
                  return (
                    <li key={pnum} className={`page-item ${pnum === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(pnum)}>{pnum}</button>
                    </li>
                  );
                })}

                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(totalPages)}>&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
