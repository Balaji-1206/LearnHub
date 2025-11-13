// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false); // mobile menu
  // profile dropdown removed; clicking avatar navigates directly to profile
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const profileRef = useRef();

  useEffect(() => {
    // (no dropdown to close anymore)
    return () => {};
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // logout moved to Profile page

  const isActive = (path) => loc.pathname === path || loc.pathname.startsWith(path + '/');

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) { nav('/courses'); return; }
    nav(`/courses?q=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  return (
    <header className={`app-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container d-flex align-items-center justify-content-between py-2">
        {/* LEFT: Brand */}
        <div className="d-flex align-items-center gap-3">
          <div className="brand d-flex align-items-center text-decoration-none" aria-label="LearnHub logo">
            <div className="brand-logo me-2">LH</div>
            <span className="brand-text fw-bold">LearnHub</span>
          </div>
        </div>

        {/* RIGHT: search, links and profile */}
        <div className="d-flex align-items-center gap-3">
          {/* desktop search comes first */}
          <form className="d-none d-md-flex" onSubmit={submitSearch} role="search" style={{ minWidth: 260 }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"/></span>
              <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control" placeholder="Search courses..." />
            </div>
          </form>

          {/* desktop nav links (hidden on xs) */}
          <nav className="d-none d-md-flex align-items-center gap-2">
            <Link to="/" className={`nav-link small ${isActive('/') ? 'active' : ''}`}><i className="bi bi-house me-1"/>Home</Link>
            <Link to="/courses" className={`nav-link small ${isActive('/courses') ? 'active' : ''}`}><i className="bi bi-collection me-1"/>Courses</Link>
            <Link to="/notes" className={`nav-link small ${isActive('/notes') ? 'active' : ''}`}><i className="bi bi-journal-text me-1"/>Notes</Link>
            <Link to="/contact" className={`nav-link small ${isActive('/contact') ? 'active' : ''}`}><i className="bi bi-envelope me-1"/>Contact</Link>
            <Link to="/about" className={`nav-link small ${isActive('/about') ? 'active' : ''}`}><i className="bi bi-info-circle me-1"/>About</Link>
          </nav>

          {/* mobile hamburger */}
          <button
            className="btn btn-sm btn-light d-md-none"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {/* simple hamburger */}
            <span className="hamburger" />
          </button>

          {/* profile area */}
          {user ? (
            <div className="position-relative" ref={profileRef}>
              <button
                className="btn btn-light d-flex align-items-center gap-2"
                onClick={() => nav('/profile')}
                aria-label="Open profile"
              >
                <div className="profile-avatar d-flex align-items-center justify-content-center">
                  <span className="profile-initial">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  <span className="status-dot"></span>
                </div>
                <span className="d-none d-sm-inline small text-dark">Hi, {user.name?.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <div className="d-none d-md-flex gap-2">
              <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* mobile expanded menu (simple) */}
      {open && (
        <div className="mobile-menu d-md-none bg-white border-top">
          <div className="container py-2 d-flex flex-column">
            <form className="mb-2" onSubmit={submitSearch} role="search">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"/></span>
                <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control" placeholder="Search courses..." />
              </div>
            </form>
            <Link to="/" className="py-2 nav-link" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/courses" className="py-2 nav-link" onClick={() => setOpen(false)}>Courses</Link>
            <Link to="/notes" className="py-2 nav-link" onClick={() => setOpen(false)}>Notes</Link>
            <Link to="/contact" className="py-2 nav-link" onClick={() => setOpen(false)}>Contact</Link>
            <Link to="/about" className="py-2 nav-link" onClick={() => setOpen(false)}>About</Link>
            {user ? (
              <div className="py-2">
                <Link to="/profile" className="nav-link" onClick={() => setOpen(false)}>Profile</Link>
              </div>
            ) : (
              <div className="d-flex gap-2 mt-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
