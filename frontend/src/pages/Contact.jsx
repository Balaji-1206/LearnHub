// src/pages/Contact.jsx
import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'support', message: '' });
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    // In a real app, post to backend or email service
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-edu rounded-3 p-4 mb-4 text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="m-0"><i className="bi bi-envelope-paper me-2"/> Contact LearnHub</h3>
            <div className="text-white-50">We'd love to hear from you — questions, feedback, or partnerships.</div>
          </div>
          <div className="d-none d-md-block text-white display-6">
            <i className="bi bi-chat-left-heart"/>
          </div>
        </div>
      </section>

      <div className="row g-3">
        {/* Form */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm section-soft-edu">
            <div className="card-body">
              <h5 className="mb-3">Send us a message</h5>
              {sent && <div className="alert alert-success py-2">Thanks! We'll get back to you soon.</div>}
              <form onSubmit={onSubmit} className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={onChange} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={onChange} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Topic</label>
                  <select className="form-select" name="topic" value={form.topic} onChange={onChange}>
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                    <option value="partnerships">Partnerships</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" name="message" rows={5} value={form.message} onChange={onChange} required />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button className="btn btn-warning" type="submit"><i className="bi bi-send me-1"/> Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100 section-soft-edu">
            <div className="card-body">
              <h5 className="mb-3">Get in touch</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0"><i className="bi bi-geo-alt me-2"/> 123 Learning Ave, Suite 100, Chennai</li>
                <li className="list-group-item px-0"><i className="bi bi-envelope me-2"/> support@learnhub.local</li>
                <li className="list-group-item px-0"><i className="bi bi-telephone me-2"/> +91 98765 43210</li>
                <li className="list-group-item px-0"><i className="bi bi-clock me-2"/> Mon–Fri: 9:00–18:00 IST</li>
              </ul>

              <div className="mt-3">
                <div className="text-muted small mb-1">Social</div>
                <div className="d-flex gap-2">
                  <a className="btn btn-outline-secondary btn-sm" href="#" aria-label="Twitter"><i className="bi bi-twitter"/></a>
                  <a className="btn btn-outline-secondary btn-sm" href="#" aria-label="Instagram"><i className="bi bi-instagram"/></a>
                  <a className="btn btn-outline-secondary btn-sm" href="#" aria-label="Github"><i className="bi bi-github"/></a>
                  <a className="btn btn-outline-secondary btn-sm" href="#" aria-label="Discord"><i className="bi bi-discord"/></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map removed as requested */}

      {/* Quick help + FAQ */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-5">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-12">
              <div className="card card-edu accent h-100">
                <div className="card-body">
                  <h6 className="mb-1"><i className="bi bi-bag me-1"/> Sales</h6>
                  <div className="text-muted small mb-2">Plans, pricing, and bulk licenses.</div>
                  <a href="mailto:sales@learnhub.local" className="btn btn-outline-primary btn-sm">sales@learnhub.local</a>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-12">
              <div className="card card-edu secondary h-100">
                <div className="card-body">
                  <h6 className="mb-1"><i className="bi bi-life-preserver me-1"/> Support</h6>
                  <div className="text-muted small mb-2">Help with login, payments, or content.</div>
                  <a href="mailto:support@learnhub.local" className="btn btn-outline-primary btn-sm">support@learnhub.local</a>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card card-edu h-100">
                <div className="card-body">
                  <h6 className="mb-1"><i className="bi bi-megaphone me-1"/> Press</h6>
                  <div className="text-muted small mb-2">Media inquiries and interviews.</div>
                  <a href="mailto:press@learnhub.local" className="btn btn-outline-primary btn-sm">press@learnhub.local</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card section-soft-edu">
            <div className="card-body faq-edu">
              <h6 className="mb-3">FAQs</h6>
              <div className="accordion" id="faq">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="q1">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#a1" aria-expanded="true" aria-controls="a1">How do I reset my password?</button>
                  </h2>
                  <div id="a1" className="accordion-collapse collapse show" aria-labelledby="q1" data-bs-parent="#faq">
                    <div className="accordion-body small text-muted">Use “Forgot password” on the login page and check your email for instructions.</div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="q2">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a2" aria-expanded="false" aria-controls="a2">Do you offer certificates?</button>
                  </h2>
                  <div id="a2" className="accordion-collapse collapse" aria-labelledby="q2" data-bs-parent="#faq">
                    <div className="accordion-body small text-muted">Yes, courses marked with “Certificate” issue a completion certificate you can download.</div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="q3">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a3" aria-expanded="false" aria-controls="a3">Can I get a refund?</button>
                  </h2>
                  <div id="a3" className="accordion-collapse collapse" aria-labelledby="q3" data-bs-parent="#faq">
                    <div className="accordion-body small text-muted">We offer a 14‑day refund for eligible purchases. Contact support for assistance.</div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="q4">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a4" aria-expanded="false" aria-controls="a4">How do I contact instructors?</button>
                  </h2>
                  <div id="a4" className="accordion-collapse collapse" aria-labelledby="q4" data-bs-parent="#faq">
                    <div className="accordion-body small text-muted">Use the course page’s contact option or post in the course discussion area. Our team routes messages when needed.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
