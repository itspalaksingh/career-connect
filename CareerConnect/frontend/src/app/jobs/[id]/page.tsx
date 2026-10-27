'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCheck,
  FaBookmark,
  FaClock,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { getJobId, jobs, type JobListing } from '@/data/jobs';

export default function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const staticJob = jobs.find((item) => getJobId(item) === id);
  const [remoteResult, setRemoteResult] = useState<{
    id: string;
    job: JobListing | null;
  } | null>(null);
  const [userRole, setUserRole] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Expired or incorrect');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    if (staticJob) return;

    let active = true;

    fetch(`/api/jobs/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Job not found.');
        return response.json() as Promise<JobListing>;
      })
      .then((loadedJob) => {
        if (active) setRemoteResult({ id, job: loadedJob });
      })
      .catch(() => {
        if (active) setRemoteResult({ id, job: null });
      });

    return () => {
      active = false;
    };
  }, [id, staticJob]);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => {
      if (!response.ok) {
        const stored = JSON.parse(localStorage.getItem('careerconnect-saved-jobs') || '[]') as string[];
        setIsSaved(stored.includes(id));
        return;
      }
      const data = await response.json();
      setUserRole(data.user?.role || 'Candidate');
      const savedResponse = await fetch('/api/saved-jobs', { credentials: 'include' });
      if (savedResponse.ok) {
        const savedJobs = await savedResponse.json() as JobListing[];
        setIsSaved(savedJobs.some((item) => getJobId(item) === id));
      }
      if (data.user?.role === 'Candidate') {
        const applicationsResponse = await fetch('/api/applications/mine', { credentials: 'include' });
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json() as { job: JobListing }[];
          setHasApplied(applications.some((application) => getJobId(application.job) === id));
        }
      }
    }).catch(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('careerconnect-saved-jobs') || '[]') as string[];
        setIsSaved(stored.includes(id));
      } catch { setIsSaved(false); }
    });
  }, [id]);

  const remoteJob = remoteResult?.id === id ? remoteResult.job : null;
  const job = staticJob ?? remoteJob;
  const isLoading = !staticJob && remoteResult?.id !== id;
  const toggleSaveJob = async () => {
    if (userRole) {
      const response = await fetch(`/api/saved-jobs/${encodeURIComponent(id)}`, {
        method: isSaved ? 'DELETE' : 'POST', credentials: 'include',
      });
      const data = await response.json();
      setApplicationMessage(data.message || 'Could not update saved jobs.');
      if (response.ok) setIsSaved(!isSaved);
      return;
    }
    let saved: string[] = [];
    try { saved = JSON.parse(localStorage.getItem('careerconnect-saved-jobs') || '[]') as string[]; } catch { saved = []; }
    const updated = isSaved ? saved.filter((savedId) => savedId !== id) : [...new Set([...saved, id])];
    localStorage.setItem('careerconnect-saved-jobs', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`/api/jobs/${encodeURIComponent(id)}/applications`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverLetter }),
    });
    const data = await response.json();
    setApplicationMessage(data.message || 'Could not submit application.');
    if (response.ok) setHasApplied(true);
  };

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(`/api/jobs/${encodeURIComponent(id)}/report`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reportReason, details: reportDetails }),
    });
    const data = await response.json();
    setApplicationMessage(data.message || 'Could not submit report.');
    if (response.ok) setReportOpen(false);
  };

  if (!job && isLoading) {
    return (
      <main className="job-details-page min-vh-100 d-flex align-items-center py-5">
        <div className="container text-center text-secondary" role="status">
          Loading opportunity details…
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="job-details-page min-vh-100 d-flex align-items-center py-5">
        <div className="container">
          <div className="job-not-found mx-auto text-center p-4 p-md-5">
            <span className="job-not-found-icon mb-3"><FaBriefcase /></span>
            <p className="text-primary fw-bold text-uppercase small mb-2">CareerConnect</p>
            <h1 className="h2 fw-bold mb-3">Job not found</h1>
            <p className="text-secondary mb-4">This listing may have expired or the link may be incorrect.</p>
            <Link href="/#jobs" className="btn btn-primary rounded-pill px-4">
              <FaArrowLeft className="me-2" /> Browse open roles
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="job-details-page">
      <header className="job-detail-hero">
        <div className="container position-relative py-4 py-lg-5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5">
            <Link href="/#jobs" className="job-back-link">
              <FaArrowLeft aria-hidden="true" /> <span>Back to opportunities</span>
            </Link>
            <Link href="/" className="job-detail-brand">
              CareerConnect<span>.</span>
            </Link>
          </div>

          <div className="row align-items-end g-4 pb-3 pb-lg-4">
            <div className="col-lg-8">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="job-detail-badge">{job.type}</span>
                <span className="job-detail-badge job-detail-badge-light">{job.workMode || 'On-site'}</span>
                <span className="job-detail-badge job-detail-badge-light">Actively hiring</span>
              </div>
              <h1 className="job-detail-title mb-3">{job.title}</h1>
              <p className="job-detail-company mb-4"><FaBuilding aria-hidden="true" /> {job.company}</p>
              <div className="d-flex flex-wrap gap-3 gap-md-4 job-hero-meta">
                <span><FaMapMarkerAlt aria-hidden="true" /> {job.location}</span>
                <span><FaMoneyBillWave aria-hidden="true" /> {job.salary || 'Compensation not listed'}</span>
                <span><FaGraduationCap aria-hidden="true" /> {job.experienceLevel || job.experience || 'Experience not specified'}</span>
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-flex justify-content-lg-end">
              <div className="job-hero-mark" aria-hidden="true"><FaBriefcase /></div>
            </div>
          </div>
        </div>
      </header>

      <section className="container job-detail-content py-4 py-lg-5">
        <div className="row g-4 g-xl-5">
          <div className="col-lg-8">
            <article className="job-detail-card mb-4">
              <div className="job-section-heading">
                <span className="job-section-icon"><FaBriefcase aria-hidden="true" /></span>
                <div>
                  <h2>About the role</h2>
                  <p>A little more about this opportunity</p>
                </div>
              </div>
              <p className="job-description mb-0">{job.description || 'The employer has not added a description yet.'}</p>
            </article>

            <article className="job-detail-card mb-4">
              <div className="job-section-heading">
                <span className="job-section-icon job-section-icon-green"><FaCheck aria-hidden="true" /></span>
                <div>
                  <h2>What you’ll do</h2>
                  <p>Your day-to-day responsibilities</p>
                </div>
              </div>
              <ul className="job-responsibilities list-unstyled mb-0">
                {(job.responsibilities ?? []).map((responsibility) => (
                  <li key={responsibility}>
                    <span className="job-check"><FaCheck aria-hidden="true" /></span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="job-detail-card">
              <div className="job-section-heading">
                <span className="job-section-icon job-section-icon-purple"><FaGraduationCap aria-hidden="true" /></span>
                <div>
                  <h2>Skills you’ll use</h2>
                  <p>Experience with these will help you thrive</p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {(job.skills ?? []).length > 0 ? (
                  (job.skills ?? []).map((skill) => <span className="job-skill" key={skill}>{skill}</span>)
                ) : (
                  <p className="text-secondary mb-0">No specific skills were listed for this opportunity.</p>
                )}
              </div>
            </article>
          </div>

          <aside className="col-lg-4">
            <div className="job-apply-card">
              <p className="job-aside-eyebrow mb-2">COMPENSATION</p>
              <p className="job-aside-salary mb-1">{job.salary || 'Not listed'}</p>
              <p className="small text-secondary mb-4">Salary or stipend, as listed</p>
              <div className="job-fact-list">
                <div className="job-fact"><span className="job-fact-icon"><FaBuilding /></span><div><small>Company</small><strong>{job.company}</strong></div></div>
                <div className="job-fact"><span className="job-fact-icon"><FaMapMarkerAlt /></span><div><small>Location</small><strong>{job.location}</strong></div></div>
                <div className="job-fact"><span className="job-fact-icon"><FaClock /></span><div><small>Employment type</small><strong>{job.type}</strong></div></div>
                <div className="job-fact"><span className="job-fact-icon"><FaGraduationCap /></span><div><small>Experience</small><strong>{job.experienceLevel || job.experience || 'Not specified'}</strong></div></div>
                {job.deadline && <div className="job-fact"><span className="job-fact-icon"><FaClock /></span><div><small>Apply by</small><strong>{new Date(job.deadline).toLocaleDateString()}</strong></div></div>}
              </div>

<button
  type="button"
  className="btn btn-outline-primary btn-lg w-100 rounded-pill mt-4"
 onClick={() => void toggleSaveJob()}
  aria-pressed={isSaved}
>
  <FaBookmark className="me-2" aria-hidden="true" />
  {isSaved ? 'Job Saved ✓' : 'Save Job'}
</button>

{!userRole && <Link href={`/login?next=/jobs/${encodeURIComponent(id)}`} className="btn btn-primary btn-lg w-100 rounded-pill job-apply-button mt-4">Login to apply <FaArrowRight className="ms-2" aria-hidden="true" /></Link>}
{userRole === 'Candidate' && (hasApplied ? <div className="alert alert-success mt-4 mb-0">Application submitted. Track it in <Link href="/applications">My applications</Link>.</div> : <form className="mt-4" onSubmit={submitApplication}><label htmlFor="cover-letter" className="form-label fw-semibold">Cover letter (optional)</label><textarea id="cover-letter" className="form-control" rows={4} maxLength={4000} value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Briefly introduce yourself…" /><button className="btn btn-primary btn-lg w-100 rounded-pill job-apply-button mt-3">Apply now</button></form>)}
{['Recruiter', 'Admin'].includes(userRole) && <Link href={userRole === 'Admin' ? '/admin' : '/dashboard'} className="btn btn-primary w-100 rounded-pill mt-4">Open hiring dashboard</Link>}
{applicationMessage && <p className="small text-secondary mt-3 mb-0" role="status">{applicationMessage}</p>}
<button type="button" className="btn btn-link btn-sm w-100 mt-3" onClick={() => setReportOpen((open) => !open)}>Report this listing</button>
{reportOpen && (userRole ? <form className="border-top pt-3 mt-2" onSubmit={submitReport}><label className="form-label small" htmlFor="report-reason">Reason</label><select id="report-reason" className="form-select form-select-sm mb-2" value={reportReason} onChange={(event) => setReportReason(event.target.value)}><option>Expired or incorrect</option><option>Spam or scam</option><option>Discriminatory</option><option>Other</option></select><textarea className="form-control form-control-sm mb-2" maxLength={1500} rows={3} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Add details (optional)" /><button className="btn btn-outline-danger btn-sm rounded-pill w-100">Submit report</button></form> : <p className="small text-secondary text-center">Please <Link href="/login">log in</Link> to report a listing.</p>)}
            </div>
            <div className="job-tip-card mt-4">
              <span className="job-tip-label">A tip for applicants</span>
              <p className="mb-0">Tailor your resume to highlight the skills that match this role.</p>
            </div>
          </aside>
        </div>

        <div className="job-detail-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-5 pt-4">
          <Link href="/#jobs" className="job-bottom-link"><FaArrowLeft aria-hidden="true" /> Browse more opportunities</Link>
          <span>CareerConnect · Find work that moves you forward</span>
        </div>
      </section>
    </main>
  );
}
