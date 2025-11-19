import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function Register({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', password: ''});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || form.name.length < 2) return setMsg('Name must be 2+ chars');
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return setMsg('Valid email required');
    if (!form.password || form.password.length < 6) return setMsg('Password must be 6+ chars');

    setLoading(true);
    setMsg('');
    try {
      const res = await register(form);
      const token = res.data.token;
      localStorage.setItem('learnhub_token', token);

      const meRes = await (await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:4000/api') + '/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })).json();

      setUser(meRes.user);
      nav('/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) setMsg(errors.map(e=>`${e.param}: ${e.msg}`).join(' | '));
      else setMsg(err.response?.data?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport d-flex align-items-center justify-content-center">
      <div className="login-shapes" aria-hidden />

      <div className="login-card shadow-lg text-center">
        <div className="brand mb-3">
          <h3 className="m-0">Create account</h3>
          <small className="text-muted">Join LearnHub — start learning</small>
        </div>

        <div className="form px-4 pb-4">
          <div className="mb-3 text-start">
            <label className="form-label">Full name</label>
            <input name="name" value={form.name} onChange={onChange} className="form-control" placeholder="Your full name" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Email</label>
            <input name="email" value={form.email} onChange={onChange} className="form-control" placeholder="you@example.com" />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Password</label>
            <input name="password" value={form.password} onChange={onChange} className="form-control" placeholder="Password (6+)" type="password" />
          </div>

          {msg && <div className="alert alert-danger py-2">{msg}</div>}

          <button className="btn btn-success w-100" onClick={submit} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="mt-3 text-muted small">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
