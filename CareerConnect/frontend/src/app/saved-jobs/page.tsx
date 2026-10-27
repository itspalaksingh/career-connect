
'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { getJobId, type JobListing } from '@/data/jobs';
import { FaBookmark, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

const savedJobsEvent = 'careerconnect-saved-jobs-change';

function subscribeToSavedJobs(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(savedJobsEvent, onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(savedJobsEvent, onChange);
  };
}

function getSavedJobsSnapshot() {
  return localStorage.getItem('careerconnect-saved-jobs') || '[]';
}

function parseSavedJobIds(storedJobs: string) {
  try {
    const parsedJobs: unknown = JSON.parse(storedJobs);
    return Array.isArray(parsedJobs) &&
      parsedJobs.every((item) => typeof item === 'string')
      ? parsedJobs
      : [];
  } catch {
    return [];
  }
}

const getServerSavedJobsSnapshot = () => '[]';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const savedJobsSnapshot = useSyncExternalStore(
    subscribeToSavedJobs,
    getSavedJobsSnapshot,
    getServerSavedJobsSnapshot
  );
  const savedJobIds = parseSavedJobIds(savedJobsSnapshot);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (sessionResponse) => {
        if (sessionResponse.ok) {
          setIsLoggedIn(true);
          const legacyIds = parseSavedJobIds(localStorage.getItem('careerconnect-saved-jobs') || '[]');
          await Promise.all(legacyIds.map((id) => fetch(`/api/saved-jobs/${encodeURIComponent(id)}`, {
            method: 'POST', credentials: 'include',
          })));
          localStorage.removeItem('careerconnect-saved-jobs');
          const response = await fetch('/api/saved-jobs', { credentials: 'include' });
          if (!response.ok) throw new Error('Could not load saved jobs.');
          return response.json() as Promise<JobListing[]>;
        }
        const response = await fetch('/api/jobs?limit=30');
        if (!response.ok) throw new Error('Could not load saved jobs.');
        const data = await response.json() as { jobs: JobListing[] };
        const ids = parseSavedJobIds(localStorage.getItem('careerconnect-saved-jobs') || '[]');
        return data.jobs.filter((job) => ids.includes(getJobId(job)));
      })
      .then((loadedJobs) => {
        if (active) setSavedJobs(loadedJobs);
      })
      .catch(() => {
        if (active) setLoadError('Saved jobs could not be loaded right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const removeSavedJob = async (id: string) => {
    if (isLoggedIn) {
      const response = await fetch(`/api/saved-jobs/${encodeURIComponent(id)}`, {
        method: 'DELETE', credentials: 'include',
      });
      if (!response.ok) {
        setLoadError('Could not remove this saved job. Please try again.');
        return;
      }
      setSavedJobs((current) => current.filter((job) => getJobId(job) !== id));
      return;
    }
    const updatedIds = savedJobIds.filter((savedId) => savedId !== id);

    localStorage.setItem(
      'careerconnect-saved-jobs',
      JSON.stringify(updatedIds)
    );

    window.dispatchEvent(new Event(savedJobsEvent));
  };

  return (
    <main className="container py-5 min-vh-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <p className="text-primary fw-bold mb-2">CAREERCONNECT</p>
          <h1 className="fw-bold">My Saved Jobs</h1>
          <p className="text-secondary">
          {isLoggedIn ? 'Your saved jobs, synced to your account.' : 'Log in to sync saved jobs across your devices.'}
          </p>
        </div>

        <Link href="/" className="btn btn-outline-primary rounded-pill">
          Browse Jobs
        </Link>
      </div>

      {loading ? (
        <p className="text-secondary" role="status">Loading your saved jobs…</p>
      ) : loadError && savedJobs.length === 0 ? (
        <div className="alert alert-warning" role="alert">{loadError}</div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center border rounded-4 p-5">
          <FaBookmark size={36} className="text-secondary mb-3" />
          <h2 className="h4 fw-bold">No saved jobs yet</h2>
          <p className="text-secondary">
            Explore opportunities and save jobs you like.
          </p>
          <Link href="/#jobs" className="btn btn-primary rounded-pill px-4">
            Explore Jobs
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {savedJobs.map((job) => (
            <div className="col-md-6 col-lg-4" key={getJobId(job)}>
              <article className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <span className="badge text-bg-primary mb-3">{job.type}</span>
                  <h2 className="h5 fw-bold">{job.title}</h2>
                  <p className="text-secondary mb-3">{job.company}</p>

                  <p className="small mb-2">
                    <FaMapMarkerAlt className="me-2" />
                    {job.location}
                  </p>
                  <p className="small mb-4">
                    <FaMoneyBillWave className="me-2" />
                    {job.salary || 'Compensation not listed'}
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <Link
                      href={`/jobs/${getJobId(job)}`}
                      className="btn btn-primary rounded-pill"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger rounded-pill"
                      onClick={() => removeSavedJob(getJobId(job))}
                    >
                      Remove Saved Job
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
      {!isLoggedIn && <p className="text-secondary small mt-4">Guest bookmarks stay in this browser. <Link href="/login">Log in</Link> to save them to your account.</p>}
    </main>
  );
}
