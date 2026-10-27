'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteFooter from '../components/SiteFooter';
import { getJobId, type JobListing } from '@/data/jobs';

type RecruiterJob = JobListing & { _id: string; applicationCount: number; status?: string };
type Applicant = { _id: string; status: string; createdAt: string; candidate: { name: string; email: string; profile?: { headline?: string; skills?: string[]; resumeUrl?: string } } };
type DashboardUser = { userId: string; name: string; email: string; role: 'Candidate' | 'Recruiter' | 'Admin' };

export default function RecruiterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [editing, setEditing] = useState<RecruiterJob | null>(null);
  const [message, setMessage] = useState('Loading recruiter dashboard…');
  const [applicationCount, setApplicationCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [recruiterRequestStatus, setRecruiterRequestStatus] = useState('None');

  const loadJobs = async () => {
    const response = await fetch('/api/jobs/mine', { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Recruiter access is required.');
    setJobs(data);
    setMessage(data.length ? '' : 'You have not posted any jobs yet.');
  };

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) router.replace('/login?next=%2Fdashboard');
        throw new Error(data.message || 'Please log in to open your dashboard.');
      }
      if (active) setUser(data.user as DashboardUser);
    }).catch((error) => { if (active) setMessage(error.message || 'Could not verify your session.'); })
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    if (user.role === 'Candidate') {
      setMessage('Loading your career dashboard…');
      Promise.all([
        fetch('/api/applications/mine', { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('Could not load your applications.'); return response.json(); }),
        fetch('/api/saved-jobs', { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('Could not load your saved jobs.'); return response.json(); }),
        fetch('/api/profile', { credentials: 'include' }).then(async (response) => { if (!response.ok) throw new Error('Could not load your recruiter access status.'); return response.json(); }),
      ]).then(([applications, savedJobs, profile]) => {
        if (!active) return;
        setApplicationCount(applications.length);
        setSavedJobsCount(savedJobs.length);
        setRecruiterRequestStatus(profile.user?.recruiterRequestStatus || 'None');
        setMessage('');
      }).catch((error) => { if (active) setMessage(error.message || 'Could not load your dashboard.'); });
    } else {
      setMessage('Loading recruiter dashboard…');
      fetch('/api/jobs/mine', { credentials: 'include' }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Recruiter access is required.');
        if (!active) return;
        setJobs(data);
        setMessage(data.length ? '' : 'You have not posted any jobs yet.');
      }).catch((error) => { if (active) setMessage(error.message); });
    }
    return () => { active = false; };
  }, [user]);

  const showApplicants = async (jobId: string) => {
    setSelectedId(jobId);
    setApplicants([]);
    const response = await fetch(`/api/jobs/${jobId}/applications`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message || 'Could not load applicants.'); return; }
    setApplicants(data);
  };

  const closeJob = async (jobId: string) => {
    const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE', credentials: 'include' });
    const data = await response.json();
    setMessage(data.message || (response.ok ? 'Job closed.' : 'Could not close job.'));
    if (response.ok) await loadJobs();
  };

  const saveEdits = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const response = await fetch(`/api/jobs/${editing._id}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editing.title, company: editing.company, location: editing.location, salary: editing.salary, description: editing.description }),
    });
    const data = await response.json();
    setMessage(data.message || (response.ok ? 'Job updated.' : 'Could not update job.'));
    if (response.ok) { setEditing(null); await loadJobs(); }
  };

  const updateApplication = async (applicationId: string, status: string) => {
    const response = await fetch(`/api/applications/${applicationId}/status`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message || 'Could not update application.'); return; }
    setApplicants((current) => current.map((item) => item._id === applicationId ? { ...item, status } : item));
  };

  const totalApplicants = jobs.reduce((total, job) => total + (job.applicationCount || 0), 0);

  if (authLoading) return <main className="dashboard-loading" role="status">Loading your dashboard…</main>;
  if (!user) return <main className="container py-5 min-vh-100"><div className="alert alert-warning" role="status">{message || 'Log in to view your dashboard.'}</div><Link className="btn btn-primary rounded-pill" href="/login?next=%2Fdashboard">Go to login</Link></main>;

  if (user.role === 'Candidate') return (
    <main className="dashboard-page">
      <section className="dashboard-hero"><div className="container py-5"><div className="d-flex flex-wrap justify-content-between align-items-end gap-3"><div><span className="dashboard-eyebrow">YOUR CAREERCONNECT DASHBOARD</span><h1>Welcome, {user.name}</h1><p>Keep your search moving and your next steps in one place.</p></div><div className="d-flex gap-2"><Link href="/explore-jobs" className="btn btn-primary rounded-pill px-4">Explore jobs</Link><Link href="/profile" className="btn btn-outline-primary rounded-pill px-4">Your profile</Link></div></div></div></section>
      <section className="container py-5">
        {message && <div className="alert alert-info" role="status">{message}</div>}
        <div className="row g-3 mb-4"><div className="col-sm-6"><Link className="candidate-dashboard-stat" href="/applications"><span>Applications</span><strong>{applicationCount}</strong><small>View your progress <span aria-hidden="true">→</span></small></Link></div><div className="col-sm-6"><Link className="candidate-dashboard-stat" href="/saved-jobs"><span>Saved jobs</span><strong>{savedJobsCount}</strong><small>Return to roles you saved <span aria-hidden="true">→</span></small></Link></div></div>
        <div className="row g-4">
          <section className="col-lg-7"><div className="candidate-dashboard-panel"><span className="dashboard-eyebrow">KEEP GOING</span><h2>Your next opportunity is one search away.</h2><p>Find roles that match your skills, save the promising ones, and track each application from your dashboard.</p><div className="d-flex flex-wrap gap-2"><Link className="btn btn-primary rounded-pill px-4" href="/explore-jobs">Find opportunities</Link><Link className="btn btn-outline-primary rounded-pill px-4" href="/applications">My applications</Link></div></div></section>
          <aside className="col-lg-5"><div className="candidate-dashboard-panel candidate-access-panel"><span className="dashboard-eyebrow">FOR EMPLOYERS</span><h2>Want to post jobs and review applicants?</h2><p>Recruiter tools are enabled after an administrator approves your access request.</p><div className="candidate-access-status">{recruiterRequestStatus === 'Pending' ? 'Your recruiter access request is under review.' : recruiterRequestStatus === 'Rejected' ? 'Your previous request was not approved. You can request again from your profile.' : 'Request recruiter access from your profile to unlock job management.'}</div><Link className="btn btn-outline-primary rounded-pill px-4 mt-3" href="/profile">{recruiterRequestStatus === 'Pending' ? 'View request status' : 'Open profile'}</Link></div></aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero"><div className="container py-5"><div className="d-flex justify-content-between align-items-center flex-wrap gap-3"><div><span className="dashboard-eyebrow">{user.role === 'Admin' ? 'ADMIN WORKSPACE' : 'RECRUITER WORKSPACE'}</span><h1>Hiring dashboard</h1><p>Welcome, {user.name}. Manage listings and review candidate applications.</p></div><div className="d-flex flex-wrap gap-2"><Link href="/post-jobs" className="btn btn-primary rounded-pill px-4">Post a job</Link>{user.role === 'Admin' && <Link href="/admin" className="btn btn-outline-primary rounded-pill px-4">Admin reviews</Link>}<Link href="/" className="btn btn-outline-primary rounded-pill px-4">View site</Link></div></div></div></section>
      <div className="container py-5">
      <div className="row g-3 mb-4"><div className="col-sm-6"><div className="card border-0 shadow-sm rounded-4 p-3"><span className="text-secondary small">Your jobs</span><strong className="fs-3">{jobs.length}</strong></div></div><div className="col-sm-6"><div className="card border-0 shadow-sm rounded-4 p-3"><span className="text-secondary small">Applications received</span><strong className="fs-3">{totalApplicants}</strong></div></div></div>
      {message && <div className="alert alert-info" role="status">{message}</div>}
      <div className="row g-4">
        <section className="col-lg-5" id="manage-jobs"><h2 className="h4 fw-bold mb-3">Manage jobs</h2><div className="d-grid gap-3">{jobs.map((job) => <article className="card border-0 shadow-sm rounded-4" key={getJobId(job)}><div className="card-body p-4"><div className="d-flex justify-content-between gap-3"><div><h3 className="h5 fw-bold">{job.title}</h3><p className="text-secondary mb-2">{job.company} · {job.location}</p></div><span className="badge rounded-pill text-bg-light align-self-start">{job.applicationCount} applicants</span></div><p className="small text-secondary">{job.status || 'Open'} · {job.type} · {job.workMode || 'On-site'}</p><div className="d-flex flex-wrap gap-2"><button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => showApplicants(job._id)}>View applicants</button><button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setEditing(job)}>Edit</button>{job.status !== 'Closed' && <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => closeJob(job._id)}>Close job</button>}</div></div></article>)}</div></section>
        <section className="col-lg-7">
          {editing && <form className="card border-0 shadow-sm rounded-4 p-4 mb-4" onSubmit={saveEdits}><div className="d-flex justify-content-between"><h2 className="h5 fw-bold">Edit listing</h2><button type="button" className="btn-close" aria-label="Cancel editing" onClick={() => setEditing(null)} /></div><div className="row g-3">{(['title','company','location','salary'] as const).map((field) => <div className="col-md-6" key={field}><label className="form-label text-capitalize">{field}</label><input className="form-control" value={editing[field] || ''} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })} /></div>)}<div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={4} value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></div></div><button className="btn btn-primary rounded-pill mt-3 align-self-start">Save changes</button></form>}
          <h2 className="h4 fw-bold mb-3" id="review-applicants">{selectedId ? 'Applicants' : 'Applicant management'}</h2>
          {!selectedId ? <p className="text-secondary">Choose a listing to review its candidates.</p> : applicants.length === 0 ? <p className="text-secondary">No applications yet for this role.</p> : <div className="d-grid gap-3">{applicants.map((item) => <article className="card border-0 shadow-sm rounded-4" key={item._id}><div className="card-body p-4"><div className="d-flex justify-content-between flex-wrap gap-2"><div><h3 className="h5 fw-bold mb-1">{item.candidate?.name}</h3><p className="text-secondary mb-1">{item.candidate?.profile?.headline || item.candidate?.email}</p><p className="small text-secondary">{(item.candidate?.profile?.skills || []).join(' · ')}</p></div><select aria-label={`Application status for ${item.candidate?.name}`} className="form-select w-auto align-self-start" value={item.status} onChange={(event) => updateApplication(item._id, event.target.value)}>{['Applied','Reviewing','Interview','Rejected','Hired'].map((status) => <option key={status}>{status}</option>)}</select></div>{item.candidate?.profile?.resumeUrl && <a href={item.candidate.profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">View resume</a>}</div></article>)}</div>}
        </section>
      </div>
      </div>
      <SiteFooter />
    </main>
  );
}
