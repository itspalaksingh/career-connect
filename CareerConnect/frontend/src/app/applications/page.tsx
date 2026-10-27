'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJobId, type JobListing } from '@/data/jobs';

type Application = { _id: string; job: JobListing; status: string; createdAt: string; coverLetter: string };

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [message, setMessage] = useState('Loading your applications…');

  useEffect(() => {
    fetch('/api/applications/mine', { credentials: 'include' }).then(async (response) => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Please log in as a Candidate to view applications.' : 'Candidate accounts can view this page.');
      const data = await response.json() as Application[];
      setItems(data);
      setMessage(data.length ? '' : 'You have not applied to a job yet.');
    }).catch((error) => setMessage(error.message));
  }, []);

  return (
    <main className="container py-5 min-vh-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"><div><p className="text-primary fw-bold mb-2">CANDIDATE SPACE</p><h1 className="fw-bold">My applications</h1><p className="text-secondary mb-0">Track each opportunity from application to decision.</p></div><Link href="/#jobs" className="btn btn-outline-primary rounded-pill">Find jobs</Link></div>
      {message && <div className="alert alert-info" role="status">{message}</div>}
      <div className="row g-4">{items.map((item) => (
        <div className="col-md-6" key={item._id}><article className="card h-100 border-0 shadow-sm rounded-4"><div className="card-body p-4">
          <div className="d-flex justify-content-between gap-3"><div><h2 className="h5 fw-bold">{item.job?.title || 'Job no longer available'}</h2><p className="text-secondary">{item.job?.company} · {item.job?.location}</p></div><span className="badge rounded-pill text-bg-primary align-self-start">{item.status}</span></div>
          <p className="small text-secondary">Applied {new Date(item.createdAt).toLocaleDateString()}</p>
          {item.job && <Link href={`/jobs/${getJobId(item.job)}`} className="btn btn-outline-primary rounded-pill">View job</Link>}
        </div></article></div>
      ))}</div>
    </main>
  );
}
