
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PostJobPage() {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    workMode: 'On-site',
    experienceLevel: 'Entry-level',
    salary: '',
    salaryMin: '',
    salaryMax: '',
    deadline: '',
    companyLogo: '',
    description: '',
  });

  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        setRole(data.user?.role || '');
      }
    }).catch(() => setRole('')).finally(() => setCheckingAccess(false));
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Job save nahi ho paayi.');
      }

      setMessage('Job successfully post ho gayi!');
      setForm({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        workMode: 'On-site',
        experienceLevel: 'Entry-level',
        salary: '',
        salaryMin: '',
        salaryMax: '',
        deadline: '',
        companyLogo: '',
        description: '',
      });
    } catch {
      setMessage('Job save nahi hui. Check karo ki backend chal raha hai.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: 700 }}>
        <h1 className="fw-bold mb-2">Post a Job</h1>
        <p className="text-secondary mb-4">
          Add a new opportunity to CareerConnect.
        </p>

        {checkingAccess ? <p role="status">Checking recruiter access…</p> : !['Recruiter', 'Admin'].includes(role) ? (
          <div className="alert alert-info">Job posting is available to approved Recruiters. <Link href={role ? '/profile' : '/login'}>{role ? 'Request recruiter access' : 'Log in'}</Link>.</div>
        ) : <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4 p-4">
          <div className="mb-3">
            <label className="form-label">Job Title</label>
            <input
              className="form-control"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Company Name</label>
            <input
              className="form-control"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Tech Solutions"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              className="form-control"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Remote or Patna"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Job Type</label>
            <select
              className="form-select"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6"><label className="form-label">Work mode</label><select className="form-select" name="workMode" value={form.workMode} onChange={handleChange}><option>On-site</option><option>Hybrid</option><option>Remote</option></select></div>
            <div className="col-md-6"><label className="form-label">Experience level</label><select className="form-select" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}><option>Entry-level</option><option>Mid-level</option><option>Senior</option></select></div>
            <div className="col-md-6"><label className="form-label">Salary or stipend</label><input className="form-control" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹4–6 LPA" /></div>
            <div className="col-md-6"><label className="form-label">Minimum annual salary (₹)</label><input className="form-control" name="salaryMin" type="number" min={0} value={form.salaryMin} onChange={handleChange} placeholder="e.g. 400000" /></div>
            <div className="col-md-6"><label className="form-label">Maximum annual salary (₹)</label><input className="form-control" name="salaryMax" type="number" min={0} value={form.salaryMax} onChange={handleChange} placeholder="e.g. 600000" /></div>
            <div className="col-md-6"><label className="form-label">Application deadline</label><input className="form-control" type="date" name="deadline" value={form.deadline} onChange={handleChange} min={new Date().toISOString().slice(0, 10)} /></div>
            <div className="col-12"><label className="form-label">Company logo URL (optional)</label><input className="form-control" type="url" name="companyLogo" value={form.companyLogo} onChange={handleChange} placeholder="https://…" /></div>
          </div>

          <div className="mb-4">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the role and required skills..."
              required
            />
          </div>

          <button className="btn btn-primary py-2" disabled={saving}>
            {saving ? 'Posting...' : 'Post Job'}
          </button>

          {message && (
            <div className="alert alert-info mt-3 mb-0" role="status">
              {message}
            </div>
          )}
        </form>}
      </div>
    </main>
  );
}
