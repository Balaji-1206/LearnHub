// src/pages/Notes.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { listNotes, createNote, listCourses, updateNoteApi, deleteNoteApi, togglePinApi } from '../api';

export default function Notes() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('recent'); // recent | oldest | title
  const [preview, setPreview] = useState(null); // note to preview
  const [editingNote, setEditingNote] = useState(null); // note being edited
  const [editData, setEditData] = useState({ title: '', content: '', tags: '' });
  const inputRef = useRef(null);

  // load courses once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await listCourses();
        const data = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        if (!mounted) return;
        setCourses(data);
        if (data.length && !courseId) setCourseId(data[0]._id);
      } catch (e) {
        // silently ignore; page still usable
      }
    })();
    return () => { mounted = false; };
  }, []);

  // load notes when course changes
  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoadingNotes(true);
    (async () => {
      try {
        const res = await listNotes(courseId);
        if (mounted) setNotes(Array.isArray(res.data) ? res.data : (res.data.notes || res.data || []));
        setMsg('');
      } catch (e) {
        setMsg('Failed to load notes');
      } finally {
        if (mounted) setLoadingNotes(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const filteredNotes = useMemo(() => {
    const t = filter.trim().toLowerCase();
    let arr = !t ? notes : notes.filter(n => (n.title || '').toLowerCase().includes(t) || (n.content || '').toLowerCase().includes(t) || (n.tags||[]).some(tag => tag.toLowerCase().includes(t)));
    // sort
    arr = [...arr].sort((a,b) => {
      // pinned first
      if ((b.pinned?1:0) - (a.pinned?1:0) !== 0) return (b.pinned?1:0) - (a.pinned?1:0);
      if (sortKey === 'title') return (a.title||'').localeCompare(b.title||'');
      const at = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bt = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortKey === 'oldest' ? at - bt : bt - at;
    });
    return arr;
  }, [notes, filter, sortKey]);

  const onPickFiles = (e) => {
    const sel = Array.from(e.target.files || []);
    setFiles(sel);
  };

  const upload = async () => {
    if (!courseId || !title) return setMsg('Please select a course and enter a title');
    const fd = new FormData();
    fd.append('courseId', courseId);
    fd.append('title', title);
    if (content) fd.append('content', content);
    if (tags) fd.append('tags', tags);
    (files || []).forEach(f => fd.append('attachments', f));
    try {
      setLoading(true);
      await createNote(fd);
      setMsg('Note uploaded');
      setTitle('');
      setContent('');
      setFiles([]);
      setTags('');
      if (inputRef.current) inputRef.current.value = '';
      // refresh
      const res = await listNotes(courseId);
      setNotes(Array.isArray(res.data) ? res.data : (res.data.notes || res.data || []));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const currentCourse = courses.find(c => c._id === courseId);
  const bannerStyle = useMemo(() => {
    const t = currentCourse?.title || 'Course';
    let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    const hue = h % 360; const hue2 = (hue + 35) % 360;
    return { background: `linear-gradient(135deg, hsl(${hue} 85% 45%), hsl(${hue2} 85% 55%))` };
  }, [currentCourse]);

  return (
    <div>
      <section className="hero-edu rounded-3 p-3 mb-3 text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="m-0"><i className="bi bi-journal-text me-2"/> Notes</h4>
            <div className="text-white-50 small">Capture and organize your study materials by course.</div>
          </div>
          <div style={{minWidth: 240}} className="d-none d-sm-block">
            <input className="form-control form-control-sm" placeholder="Search notes" value={filter} onChange={e=>setFilter(e.target.value)} />
          </div>
        </div>
        <div className="d-sm-none mt-2">
          <input className="form-control form-control-sm" placeholder="Search notes" value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
      </section>

      {/* header + course select */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="course-banner" style={bannerStyle} />
        <div className="card-body d-flex flex-wrap align-items-center gap-2">
          <div className="me-auto">
            <div className="fw-bold">Select Course</div>
            <div className="text-muted small">Create and view notes by course</div>
          </div>
          <select className="form-select" style={{ minWidth: 260 }} value={courseId} onChange={e=>setCourseId(e.target.value)}>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-3">
        {/* create note */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100 section-soft-edu">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="m-0">Add a Note</h6>
                {loading && <span className="spinner-border spinner-border-sm" />}
              </div>
              <input className="form-control mb-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
              <textarea className="form-control mb-2" rows={3} value={content} onChange={e=>setContent(e.target.value)} placeholder="Optional content/description" />
              <input className="form-control mb-2" value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma separated) e.g. recap, exam, formulas" />
              <div className="notes-dropzone rounded p-3 mb-2 text-center" style={{ cursor: 'pointer' }} onClick={() => inputRef.current?.click()}>
                <div className="text-muted">
                  <i className="bi bi-upload me-1" /> Click to choose files
                </div>
                <div className="small text-muted mt-1">PDF, images, docs supported</div>
              </div>
              <input ref={inputRef} type="file" multiple className="d-none" onChange={onPickFiles} />
              {files.length > 0 && (
                <div className="small text-muted mb-2">{files.length} file(s) selected</div>
              )}
              <button className="btn btn-info" disabled={loading || !title || !courseId} onClick={upload}>
                {loading ? 'Uploading…' : 'Upload Note'}
              </button>
              {msg && <div className="alert alert-info py-2 mt-3 mb-0">{msg}</div>}
            </div>
          </div>
        </div>

        {/* notes list */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100 section-soft-edu">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="m-0">Notes</h6>
                <div className="d-flex align-items-center gap-2">
                  <select className="form-select form-select-sm" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
                    <option value="recent">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title">Title</option>
                  </select>
                  {loadingNotes && <span className="spinner-border spinner-border-sm" />}
                </div>
              </div>
              {filteredNotes.length === 0 ? (
                <div className="text-muted small">No notes yet. Add your first note on the left.</div>
              ) : (
                <div className="row g-3">
                  {filteredNotes.map(n => (
                    <div className="col-12" key={n._id}>
                      <div className="card border-0" style={{ background: 'linear-gradient(180deg,#fff,#fbfdff)', borderRadius: 12, boxShadow: '0 6px 16px rgba(2,6,23,0.05)' }}>
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="pe-2" style={{minWidth:0}}>
                              <div className="fw-semibold d-flex align-items-center gap-2" style={{cursor:'pointer'}} onClick={()=>setPreview(n)}>
                                {n.pinned && <i className="bi bi-pin-angle-fill text-danger" title="Pinned"/>}
                                <span className="text-truncate" style={{maxWidth:'38ch'}}>{n.title}</span>
                              </div>
                              <div className="text-muted small mt-1" style={{whiteSpace:'pre-wrap'}}>{n.content || '—'}</div>
                              {(n.tags||[]).length>0 && (
                                <div className="mt-2">
                                  {n.tags.map(t => <span key={t} className="badge bg-warning-subtle text-dark me-1">#{t}</span>)}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div className="small text-muted">{new Date(n.updatedAt || n.createdAt || Date.now()).toLocaleDateString()}</div>
                              <div className="btn-group btn-group-sm mt-1">
                                <button className="btn btn-outline-secondary" title={n.pinned? 'Unpin':'Pin'} onClick={async()=>{
                                  const res = await togglePinApi(n._id); const updated = res?.data?.note || n; setNotes(prev=>prev.map(x=>x._id===n._id?updated:x));
                                }}><i className={`bi ${n.pinned? 'bi-pin-angle-fill':'bi-pin'}`}/></button>
                                <button className="btn btn-outline-primary" title="Edit" onClick={()=>{ setEditingNote(n); setEditData({ title: n.title||'', content: n.content||'', tags: (n.tags||[]).join(', ') }); }}><i className="bi bi-pencil"/></button>
                                <button className="btn btn-outline-danger" title="Delete" onClick={async()=>{ if (!window.confirm('Delete this note?')) return; await deleteNoteApi(n._id); setNotes(prev=>prev.filter(x=>x._id!==n._id)); }}><i className="bi bi-trash"/></button>
                              </div>
                            </div>
                          </div>
                          {n.attachments?.length > 0 && (
                            <div className="mt-2">
                              {n.attachments.map(a => (
                                <a key={a.filename || a.url} className="btn btn-sm btn-outline-primary me-2 mb-1" href={a.url} target="_blank" rel="noreferrer">
                                  <i className="bi bi-paperclip me-1" /> {a.filename || 'Attachment'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="modal d-block" tabIndex="-1" onClick={()=>setPreview(null)}>
          <div className="modal-dialog modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{preview.title}</h5>
                <button type="button" className="btn-close" onClick={()=>setPreview(null)}></button>
              </div>
              <div className="modal-body">
                <div className="text-muted small mb-2">{new Date(preview.updatedAt||preview.createdAt||Date.now()).toLocaleString()}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{preview.content || '—'}</div>
                {preview.tags?.length>0 && (
                  <div className="mt-2">{preview.tags.map(t=> <span key={t} className="badge bg-warning-subtle text-dark me-1">#{t}</span>)}</div>
                )}
                {preview.attachments?.length>0 && (
                  <div className="mt-3">
                    <div className="fw-semibold mb-1">Attachments</div>
                    {preview.attachments.map(a => (
                      <a key={a.filename||a.url} className="btn btn-sm btn-outline-primary me-2 mb-1" href={a.url} target="_blank" rel="noreferrer">
                        <i className="bi bi-paperclip me-1"/> {a.filename||'Attachment'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setPreview(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingNote && (
        <div className="modal d-block" tabIndex="-1" onClick={()=>setEditingNote(null)}>
          <div className="modal-dialog" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Note</h5>
                <button type="button" className="btn-close" onClick={()=>setEditingNote(null)}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" value={editData.title} onChange={e=>setEditData(s=>({...s, title: e.target.value}))} placeholder="Title" />
                <textarea className="form-control mb-2" rows={4} value={editData.content} onChange={e=>setEditData(s=>({...s, content: e.target.value}))} placeholder="Content" />
                <input className="form-control mb-2" value={editData.tags} onChange={e=>setEditData(s=>({...s, tags: e.target.value}))} placeholder="Tags (comma separated)" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setEditingNote(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={async()=>{
                  const payload = { title: editData.title, content: editData.content, tags: editData.tags };
                  const res = await updateNoteApi(editingNote._id, payload);
                  const updated = res?.data || payload; setNotes(prev=>prev.map(x=>x._id===editingNote._id ? { ...x, ...updated } : x)); setEditingNote(null);
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
