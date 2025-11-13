// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import { me } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('learnhub_token') || localStorage.getItem('eduhub_token');
    if (!token) { setBooting(false); return; }
    (async () => {
      try {
        const res = await me();
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('learnhub_token');
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) return <div className="vh-100 d-flex align-items-center justify-content-center">Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/courses" element={user ? <Courses /> : <Navigate to="/login" />} />
          <Route path="/courses/:slug" element={user ? <CourseDetails /> : <Navigate to="/login" />} />
          <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
