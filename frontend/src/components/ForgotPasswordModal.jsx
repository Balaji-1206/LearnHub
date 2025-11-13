// src/components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { forgotPassword } from '../api';

export default function ForgotPasswordModal({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, msg: null, ok: null });

  const submit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus({ loading: false, msg: 'Please enter a valid email', ok: false });
      return;
    }
    setStatus({ loading: true, msg: null, ok: null });
    try {
      const res = await forgotPassword({ email });
      // backend should respond with success message
      const msg = res?.data?.message || 'If an account exists, you will receive reset instructions (check spam).';
      setStatus({ loading: false, msg, ok: true });
    } catch (err) {
      // If endpoint missing or returns 404/500, show helpful message
      const serverMsg = err.response?.data?.message ||
        'We could not complete the request. If you have an account, try contacting support.';
      setStatus({ loading: false, msg: serverMsg, ok: false });
    }
  };

  const onHide = () => {
    setEmail('');
    setStatus({ loading: false, msg: null, ok: null });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content shadow-sm">
          <div className="modal-header">
            <h5 className="modal-title">Reset password</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p className="small text-muted">Enter your account email and we'll send password reset instructions (if supported).</p>
            <input
              className="form-control mb-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            />
            {status.msg && (
              <div className={`alert ${status.ok ? 'alert-success' : 'alert-danger'} py-2`}>{status.msg}</div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onHide}>Close</button>
            <button type="button" className="btn btn-primary" onClick={submit} disabled={status.loading}>
              {status.loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
