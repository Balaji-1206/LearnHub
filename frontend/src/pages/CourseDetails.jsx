// src/pages/CourseDetails.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, recordStudy, enroll, createNote } from '../api';

export default function CourseDetails() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [pingMsg, setPingMsg] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  // note modal state
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteFiles, setNoteFiles] = useState([]);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');
  const fileInputRef = useRef(null);

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
    (async () => {
      try {
        const res = await getCourse(slug);
        setCourse(res.data);
        // consider enrolled status (optional enhancement)
      } catch {
        setMsg('Failed to load course');
      }
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    // initialize bookmark state from localStorage
    try {
      const raw = localStorage.getItem('learnhub_bookmarks');
      let arr = [];
      try { arr = raw ? JSON.parse(raw) : []; } catch { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      setBookmarked(arr.includes(slug));
    } catch {}
  }, [slug]);

  const toggleBookmark = () => {
    try {
      const raw = localStorage.getItem('learnhub_bookmarks');
      let arr;
      try { arr = raw ? JSON.parse(raw) : []; } catch { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      let next = arr.slice();
      if (!slug) return;
      if (next.includes(slug)) next = next.filter(s => s !== slug); else next.push(slug);
      localStorage.setItem('learnhub_bookmarks', JSON.stringify(next));
      setBookmarked(next.includes(slug));
    } catch {
      // If storage is unavailable, still reflect UI state
      setBookmarked(prev => !prev);
    }
  };

  const learnItems = () => {
    const src = (course?.longDescription || '').trim();
    if (src) {
      const parts = src.split(/[\.\n]/).map(s => s.trim()).filter(Boolean);
      if (parts.length) return parts.slice(0, 4);
    }
    const tags = course?.tags || [];
    if (tags.length) return tags.slice(0,4).map(t => `Understand ${t} fundamentals`);
    return [
      'Grasp core concepts with practical examples',
      'Build confidence with guided exercises',
      'Learn best practices and patterns',
      'Prepare for real-world projects'
    ];
  };

  const reqItems = () => {
    const lvl = (course?.level || '').toLowerCase();
    if (lvl.includes('advanced')) return ['Strong foundation in the topic', 'Comfort with reading docs', 'Familiarity with debugging tools'];
    if (lvl.includes('intermediate')) return ['Basic understanding of the topic', 'Some prior hands-on practice'];
    return ['No prior experience required', 'Curiosity to learn'];
  };

  const assetIcon = (m) => {
    if (!m) return 'bi bi-file-earmark';
    if (m.includes('pdf')) return 'bi bi-filetype-pdf';
    if (m.includes('zip')) return 'bi bi-file-zip';
    if (m.includes('image')) return 'bi bi-file-image';
    if (m.includes('video')) return 'bi bi-file-play';
    if (m.includes('audio')) return 'bi bi-file-music';
    return 'bi bi-file-earmark';
  };

  if (msg) return <div className="alert alert-danger">{msg}</div>;
  if (loading) return <div className="p-4">Loading...</div>;
  if (!course) return <div className="p-4">Course not found.</div>;

  return (
    <>
    <div className="card shadow-sm">
      {confetti && (
        <div className="confetti-overlay">
          {Array.from({ length: 120 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = 2 + Math.random() * 1.5;
            const rotate = Math.random() * 360;
            const colors = ['#0d6efd','#6610f2','#6f42c1','#198754','#fd7e14','#dc3545','#20c997'];
            const color = colors[i % colors.length];
            const style = { left: left + '%', backgroundColor: color, animationDelay: `${delay}s`, animationDuration: `${duration}s`, transform: `rotate(${rotate}deg)` };
            return <span key={i} className="confetti-piece" style={style} />;
          })}
        </div>
      )}
      {/* Decorative banner instead of image */}
      <div className="course-banner course-banner-lg" style={bannerStyle(course.title)}>
        <div className="course-badges">
          {course.level && <span className="badge bg-dark text-white me-2 text-capitalize">{course.level}</span>}
          <span className="badge bg-primary">{course.duration || 'TBD'}</span>
        </div>
        {/* subtle overlay for visual interest */}
        <div style={{position:'absolute', inset:0, background: 'radial-gradient(1200px 180px at -10% -20%, rgba(255,255,255,0.16), rgba(255,255,255,0)), radial-gradient(800px 180px at 120% 120%, rgba(255,255,255,0.12), rgba(255,255,255,0))'}}/>
      </div>
      <div className="card-body">
          <div className="d-flex justify-content-between">
          <div>
            <h3 className="mb-1">{course.title}</h3>
            <div className="text-muted small">by {course.instructor?.name || '—'}</div>
            {(course.tags && course.tags.length>0) && (
              <div className="mt-2">
                {course.tags.map((t,i)=>(<span key={i} className="badge bg-warning-subtle text-dark me-1">#{t}</span>))}
              </div>
            )}
          </div>
          <div className="text-end">
            <div className="fw-bold">{course.price ? `$${course.price}` : 'Free'}</div>
            <div className="text-muted small">{new Date(course.createdAt).toLocaleDateString()}</div>
              <button className={`btn btn-sm mt-2 ${bookmarked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={toggleBookmark} title={bookmarked? 'Remove bookmark':'Bookmark'}>
                <i className={`bi ${bookmarked? 'bi-heart-fill':'bi-heart'} me-1`}/>{bookmarked? 'Bookmarked':'Bookmark'}
              </button>
          </div>
        </div>

          <p className="text-muted mt-3" id="overview">{course.description || 'No description provided.'}</p>

        {/* Quick actions */}
          <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); }}>
            <i className="bi bi-link-45deg me-1"/> Copy link
          </button>
          <a className="btn btn-outline-secondary btn-sm" href={`mailto:support@learnhub.local?subject=Course%20Question:%20${encodeURIComponent(course.title)}`}>
            <i className="bi bi-envelope me-1"/> Ask a question
          </a>
        </div>

          {/* Jump to */}
          <div className="mt-2">
            <a href="#learn" className="btn btn-sm btn-light me-1"><i className="bi bi-list-ul me-1"/>Details</a>
            <a href="#learn-outcomes" className="btn btn-sm btn-light me-1"><i className="bi bi-stars me-1"/>Outcomes</a>
            <a href="#learn-reqs" className="btn btn-sm btn-light me-1"><i className="bi bi-clipboard-check me-1"/>Requirements</a>
            <a href="#resources" className="btn btn-sm btn-light"><i className="bi bi-folder2-open me-1"/>Resources</a>
          </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <ul className="list-group section-soft-edu">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>Duration</strong>
                <span>{course.duration || 'TBD'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>Tags</strong>
                <span>{(course.tags || []).join(', ') || '—'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>Published</strong>
                <span>{course.published ? 'Yes' : 'No'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>Assets</strong>
                <span>{(course.assets || []).length}</span>
              </li>
            </ul>

            {/* Instructor card */}
            <div className="card mt-3">
              <div className="card-body d-flex align-items-center">
                <div className="profile-avatar me-2" style={{ width: 40, height: 40 }}>
                  <div className="profile-initial" style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%' }}>
                    {(course.instructor?.name?.[0] || 'I').toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="fw-semibold">{course.instructor?.name || 'Instructor'}</div>
                  <div className="text-muted small">{course.instructor?.email || ''}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8" id="learn">
            <h5>Course Details</h5>
            <p>{course.longDescription || course.description || 'No further details.'}</p>

            {/* What you'll learn */}
            <div id="learn-outcomes" className="mt-3">
              <h6 className="mb-2">What you'll learn</h6>
              <div className="row g-2">
                {learnItems().map((it, idx) => (
                  <div className="col-12 col-sm-6" key={idx}>
                    <div className="card-edu p-2">
                      <i className="bi bi-check2-circle text-success me-2"/>
                      <span>{it}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div id="learn-reqs" className="mt-3">
              <h6 className="mb-2">Requirements</h6>
              <ul className="m-0 ps-3 text-muted">
                {reqItems().map((r,i)=>(<li key={i} className="mb-1">{r}</li>))}
              </ul>
            </div>

            {course.assets && course.assets.length > 0 && (
              <div className="mt-3" id="resources">
                <h6>Resources</h6>
                <div className="d-flex flex-wrap gap-2">
                  {course.assets.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className={`${assetIcon(a.mimetype)} me-1`}/>{a.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 d-flex align-items-center gap-2 flex-wrap">
              {!enrolled ? (
                <button
                  className="btn btn-primary me-2"
                  disabled={enrolling}
                  onClick={async () => {
                    if (!course?._id) return;
                    try {
                      setEnrolling(true);
                      await enroll(course._id);
                      setEnrolled(true);
                      setConfetti(true);
                      setTimeout(() => {
                        setConfetti(false);
                        document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 1200);
                    } catch (e) {
                      setPingMsg(e.response?.data?.message || 'Enroll failed');
                    } finally {
                      setEnrolling(false);
                    }
                  }}
                >
                  {enrolling ? 'Enrolling…' : 'Enroll'}
                </button>
              ) : (
                <button
                  className="btn btn-success me-2"
                  onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  Start learning
                </button>
              )}
              <button className="btn btn-outline-primary" onClick={()=>setNoteOpen(true)}>
                <i className="bi bi-journal-plus me-1"/> Write a Note
              </button>
              <button className="btn btn-outline-secondary" onClick={() => nav('/courses')}>Back to Courses</button>
              <button
                className="btn btn-outline-success"
                onClick={async () => {
                  try {
                    setPingMsg('');
                    await recordStudy(course._id);
                    setPingMsg('🔥 Study recorded for today');
                  } catch (e) {
                    setPingMsg(e.response?.data?.message || 'Failed to record');
                  }
                  setTimeout(() => setPingMsg(''), 3500);
                }}
              >
                I studied today
              </button>
              {pingMsg && <span className="small text-success ms-1">{pingMsg}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Note composer modal */}
    {noteOpen && (
      <div className="modal d-block" tabIndex="-1" onClick={()=>!noteSaving && setNoteOpen(false)}>
        <div className="modal-dialog modal-lg" onClick={e=>e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Note for {course?.title}</h5>
              <button type="button" className="btn-close" disabled={noteSaving} onClick={()=>setNoteOpen(false)}></button>
            </div>
            <div className="modal-body">
              {noteMsg && <div className="alert alert-info py-2">{noteMsg}</div>}
              <input className="form-control mb-2" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Title" />
              <textarea className="form-control mb-2" rows={4} value={noteContent} onChange={e=>setNoteContent(e.target.value)} placeholder="Content (optional)" />
              <input className="form-control mb-2" value={noteTags} onChange={e=>setNoteTags(e.target.value)} placeholder="Tags (comma separated)" />
              <div className="notes-dropzone rounded p-3 text-center" style={{ cursor: 'pointer' }} onClick={()=>fileInputRef.current?.click()}>
                <div className="text-muted"><i className="bi bi-upload me-1"/> Click to choose files (optional)</div>
                <div className="small text-muted mt-1">PDF, images, docs supported</div>
              </div>
              <input ref={fileInputRef} type="file" multiple className="d-none" onChange={(e)=> setNoteFiles(Array.from(e.target.files||[]))} />
              {noteFiles.length>0 && <div className="small text-muted mt-1">{noteFiles.length} file(s) selected</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" disabled={noteSaving} onClick={()=>setNoteOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={noteSaving || !noteTitle?.trim()} onClick={async()=>{
                try {
                  setNoteSaving(true); setNoteMsg('');
                  const fd = new FormData();
                  fd.append('courseId', course._id);
                  fd.append('title', noteTitle.trim());
                  if (noteContent) fd.append('content', noteContent);
                  if (noteTags) fd.append('tags', noteTags);
                  noteFiles.forEach(f=>fd.append('attachments', f));
                  await createNote(fd);
                  setNoteMsg('Note created successfully');
                  setTimeout(()=>{ setNoteOpen(false); setNoteTitle(''); setNoteContent(''); setNoteTags(''); setNoteFiles([]); }, 900);
                } catch (e) {
                  setNoteMsg(e.response?.data?.message || 'Failed to create note');
                } finally { setNoteSaving(false); }
              }}>{noteSaving ? 'Saving…' : 'Save Note'}</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
