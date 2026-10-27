'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Request = { _id: string; name: string; email: string; profile?: { headline?: string } };
type Report = { _id: string; reason: string; details: string; status: string; job?: { _id: string; title: string; company: string }; reporter?: { name: string; email: string } };
type Job = { _id: string; title: string; company: string; location: string; status?: string };

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('Loading admin workspace…');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(async (session) => {
      if (!session.ok) throw new Error('Please log in to continue.');
      const data = await session.json();
      if (data.user?.role !== 'Admin') throw new Error('Admin access is required.');
      const [requestResponse, reportResponse, jobsResponse] = await Promise.all([
        fetch('/api/admin/recruiter-requests', { credentials: 'include' }),
        fetch('/api/admin/reports', { credentials: 'include' }),
        fetch('/api/admin/jobs', { credentials: 'include' }),
      ]);
      if (![requestResponse, reportResponse, jobsResponse].every((response) => response.ok)) throw new Error('Could not load the moderation queue.');
      const [requestData, reportData, jobData] = await Promise.all([requestResponse.json(), reportResponse.json(), jobsResponse.json()]);
      setRequests(requestData); setReports(reportData); setJobs(jobData); setMessage('');
    }).catch((error) => setMessage(error.message));
  }, []);

  const processRequest = async (id: string, decision: 'approve' | 'reject') => {
    const response = await fetch(`/api/admin/recruiter-requests/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) });
    const data = await response.json(); setMessage(data.message || 'Request updated.');
    if (response.ok) setRequests((current) => current.filter((request) => request._id !== id));
  };

  const processReport = async (report: Report, status: 'Reviewed' | 'Dismissed') => {
    const response = await fetch(`/api/admin/reports/${report._id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await response.json(); setMessage(data.message || 'Report updated.');
    if (response.ok) setReports((current) => current.map((item) => item._id === report._id ? { ...item, status } : item));
  };

  const closeJob = async (job: Job) => {
    const response = await fetch(`/api/jobs/${job._id}`, { method: 'DELETE', credentials: 'include' });
    const data = await response.json(); setMessage(data.message || 'Job updated.');
    if (response.ok) setJobs((current) => current.map((item) => item._id === job._id ? { ...item, status: 'Closed' } : item));
  };

  return (
    <main className="container py-5 min-vh-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"><div><p className="text-primary fw-bold mb-2">ADMINISTRATION</p><h1 className="fw-bold">Trust & safety</h1><p className="text-secondary mb-0">Review recruiter access and reported job listings.</p></div><Link href="/" className="btn btn-outline-primary rounded-pill">View site</Link></div>
      {message && <div className="alert alert-info" role="status">{message}</div>}
      <div className="row g-4">
        <section className="col-lg-6"><h2 className="h4 fw-bold mb-3">Recruiter access requests <span className="badge text-bg-light">{requests.length}</span></h2><div className="d-grid gap-3">{requests.map((request) => <article className="card border-0 shadow-sm rounded-4" key={request._id}><div className="card-body p-4"><h3 className="h5 fw-bold">{request.name}</h3><p className="text-secondary">{request.email}</p>{request.profile?.headline && <p>{request.profile.headline}</p>}<div className="d-flex gap-2"><button className="btn btn-primary rounded-pill" onClick={() => processRequest(request._id, 'approve')}>Approve recruiter</button><button className="btn btn-outline-secondary rounded-pill" onClick={() => processRequest(request._id, 'reject')}>Decline</button></div></div></article>)}</div>{requests.length === 0 && <p className="text-secondary">No pending requests.</p>}</section>
        <section className="col-lg-6"><h2 className="h4 fw-bold mb-3">Job reports <span className="badge text-bg-light">{reports.filter((report) => report.status === 'Open').length} open</span></h2><div className="d-grid gap-3">{reports.map((report) => <article className="card border-0 shadow-sm rounded-4" key={report._id}><div className="card-body p-4"><div className="d-flex justify-content-between gap-2"><h3 className="h6 fw-bold">{report.job?.title || 'Unavailable listing'}</h3><span className="badge text-bg-light">{report.status}</span></div><p className="text-secondary mb-1">{report.job?.company} · Reported for: {report.reason}</p><p className="small">{report.details || 'No additional details.'}</p><p className="small text-secondary">By {report.reporter?.name || 'Candidate'}</p>{report.status === 'Open' && <div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => processReport(report, 'Reviewed')}>Mark reviewed</button><button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => processReport(report, 'Dismissed')}>Dismiss report</button>{report.job && <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => { const job=jobs.find((item)=>item._id===report.job?._id); if (job) closeJob(job); }}>Close job</button>}</div>}</div></article>)}</div>{reports.length === 0 && <p className="text-secondary">No job reports yet.</p>}</section>
      </div>
    </main>
  );
}
