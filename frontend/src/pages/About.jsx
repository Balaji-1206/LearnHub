// src/pages/About.jsx
import React from 'react';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-edu rounded-3 p-4 mb-4 text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="m-0"><i className="bi bi-mortarboard me-2"/> About LearnHub</h3>
            <div className="text-white-50">Our mission is to make learning clear, engaging, and effective.</div>
          </div>
          <div className="d-none d-md-block text-white display-6">
            <i className="bi bi-stars"/>
          </div>
        </div>
      </section>

      {/* Mission */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100 section-soft-edu">
            <div className="card-body">
              <h5 className="mb-2 accent-underline">Why LearnHub?</h5>
              <p className="text-muted">LearnHub brings courses, notes, and progress tracking together so learners can focus on outcomes. We believe in a simple path: discover, practice, and grow — with tools that make each step feel natural.</p>
              <div className="row g-3 mt-1">
                <div className="col-sm-6">
                  <div className="card-edu p-3 h-100">
                    <div className="fw-semibold mb-1"><i className="bi bi-bullseye me-1"/> Clarity</div>
                    <div className="small text-muted">Clear course goals, structured content, and simple navigation.</div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card-edu secondary p-3 h-100">
                    <div className="fw-semibold mb-1"><i className="bi bi-people me-1"/> Community</div>
                    <div className="small text-muted">Notes and collaboration features that help knowledge stick.</div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card-edu success p-3 h-100">
                    <div className="fw-semibold mb-1"><i className="bi bi-graph-up-arrow me-1"/> Progress</div>
                    <div className="small text-muted">Track streaks and course completion to keep momentum.</div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card-edu accent p-3 h-100">
                    <div className="fw-semibold mb-1"><i className="bi bi-lightning-charge me-1"/> Speed</div>
                    <div className="small text-muted">Fast, responsive experience powered by a modern stack.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100 section-soft-edu">
            <div className="card-body">
              <h5 className="mb-2 accent-underline">At a glance</h5>
              <div className="row g-3">
                <div className="col-6">
                  <div className="stat-card-edu text-center">
                    <div className="icon-circle-edu mb-1"><i className="bi bi-collection"/></div>
                    <div className="fw-bold fs-4 text-gradient-edu">30+</div>
                    <div className="text-muted small">Courses</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card-edu text-center">
                    <div className="icon-circle-edu mb-1"><i className="bi bi-people"/></div>
                    <div className="fw-bold fs-4 text-gradient-edu">1.2k+</div>
                    <div className="text-muted small">Learners</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card-edu text-center">
                    <div className="icon-circle-edu mb-1"><i className="bi bi-mortarboard"/></div>
                    <div className="fw-bold fs-4 text-gradient-edu">4.2k+</div>
                    <div className="text-muted small">Enrollments</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card-edu text-center">
                    <div className="icon-circle-edu mb-1"><i className="bi bi-journal-text"/></div>
                    <div className="fw-bold fs-4 text-gradient-edu">8k+</div>
                    <div className="text-muted small">Notes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card shadow-sm mt-3 section-soft-edu">
        <div className="card-body">
          <h5 className="mb-2 accent-underline">Our journey</h5>
          <ul className="list-unstyled m-0">
            <li className="mb-3 d-flex">
              <div className="me-3 text-primary"><i className="bi bi-check-circle"/></div>
              <div>
                <div className="fw-semibold">Initial Launch</div>
                <div className="text-muted small">Courses and enrollments go live for early learners.</div>
              </div>
            </li>
            <li className="mb-3 d-flex">
              <div className="me-3 text-primary"><i className="bi bi-journal-text"/></div>
              <div>
                <div className="fw-semibold">Notes + Attachments</div>
                <div className="text-muted small">Upload and organize study notes across courses.</div>
              </div>
            </li>
            <li className="mb-3 d-flex">
              <div className="me-3 text-warning"><i className="bi bi-fire"/></div>
              <div>
                <div className="fw-semibold">Streaks & Progress</div>
                <div className="text-muted small">Daily pings and streak tracking to build habits.</div>
              </div>
            </li>
            <li className="d-flex">
              <div className="me-3 text-primary"><i className="bi bi-stars"/></div>
              <div>
                <div className="fw-semibold">What’s next</div>
                <div className="text-muted small">More instructor tools, certifications, and peer learning events.</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">Built with React, Bootstrap, Node.js, and MongoDB.</div>
        <div className="d-flex gap-2">
          <a href="/courses" className="btn btn-warning"><i className="bi bi-collection me-1"/> Browse Courses</a>
          <a href="/contact" className="btn btn-info"><i className="bi bi-envelope me-1"/> Contact Us</a>
        </div>
      </div>
    </div>
  );
}
