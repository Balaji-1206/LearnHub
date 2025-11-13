// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Player } from '@lottiefiles/react-lottie-player';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setMsg(err); return; }
    setLoading(true);
    setMsg('');
    try {
      const res = await login(form);
      const token = res.data.token;
      localStorage.setItem('learnhub_token', token);

      // fetch user info
      const meRes = await (await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:4000/api') + '/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })).json();

      setUser(meRes.user);
      nav('/');
    } catch (err) {
      const serverMsg = err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors.map(e=>e.msg).join(', ')) ||
        'Login failed';
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <>
      <div className="login-viewport d-flex align-items-center justify-content-center">
        <div className="login-shapes" aria-hidden />

        <div className="login-card shadow-lg text-center">
          <div className="brand mb-3">
            <div className="brand-logo">LH</div>
            <h3 className="m-0">LearnHub</h3>
            <small className="text-muted">Sign in to continue</small>
          </div>

          <div className="form px-4 pb-4">
            <div className="mb-3 text-start">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  onKeyDown={onKey}
                  className="form-control"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  onKeyDown={onKey}
                  className="form-control"
                  placeholder="Your password"
                  type={showPass ? 'text' : 'password'}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPass(s => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                </button>
              </div>
            </div>

            {msg && <div className="alert alert-danger py-2">{msg}</div>}

            <div className="d-grid">
              <button
                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                onClick={submit}
                disabled={loading}
                style={{ minHeight: 48 }}
              >
                {loading ? (
                  <div style={{ width: 44, height: 44 }}>
                    <Player
                      autoplay
                      loop
                      src="https://assets9.lottiefiles.com/packages/lf20_usmfx6bp.json"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ) : 'Sign In'}
              </button>
            </div>

            <div className="mt-3 d-flex justify-content-between small text-muted">
              <a role="button" onClick={() => setForgotOpen(true)}>Forgot password?</a>
              <div>Don't have an account? <a href="/register">Register</a></div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal show={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
