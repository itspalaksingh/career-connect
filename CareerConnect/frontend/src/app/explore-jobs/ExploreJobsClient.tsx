'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowRight, FaBriefcase, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { getJobId, searchJobs, type JobListing } from '@/data/jobs';
import SiteFooter from '../components/SiteFooter';

type Filters = { keyword: string; location: string; type: string; workMode: string; experienceLevel: string; minSalary: string; maxSalary: string };
const emptyFilters: Filters = { keyword: '', location: '', type: '', workMode: '', experienceLevel: '', minSalary: '', maxSalary: '' };

export default function ExploreJobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [filters, setFilters] = useState<Filters>(() => {
    const params = new URLSearchParams(query);
    return Object.fromEntries(Object.keys(emptyFilters).map((key) => [key, params.get(key) || ''])) as Filters;
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsSourceMessage, setJobsSourceMessage] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(query);
    setFilters(Object.fromEntries(Object.keys(emptyFilters).map((key) => [key, params.get(key) || ''])) as Filters);
    setPage(1);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams(query);
    params.set('page', String(page));
    params.set('limit', '9');
    let active = true;
    setLoading(true);
    setError('');

    searchJobs(params)
      .then((data) => {
        if (!active) return;
        setJobs(data.jobs);
        setTotal(data.total);
        setPages(data.pages);
        setJobsSourceMessage(data.sourceMessage || '');
      })
      .catch((loadError: Error) => { if (active) setError(loadError.message || 'Could not connect to the jobs service.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [query, page, retryCount]);

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()); });
    setPage(1);
    router.push(`/explore-jobs${params.size ? `?${params.toString()}` : ''}`);
  };
  const clearSearch = () => {
    setFilters(emptyFilters);
    setPage(1);
    router.push('/explore-jobs');
  };

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <div className="container py-5">
          <span className="explore-eyebrow">YOUR NEXT STEP STARTS HERE</span>
          <h1>Find an opportunity that fits.</h1>
          <p>Search real openings by role, location, and the way you want to work.</p>
          <form className="explore-search-panel" onSubmit={submitSearch}>
            <label className="explore-search-field"><FaSearch aria-hidden="true" /><span className="visually-hidden">Job title or keyword</span><input value={filters.keyword} onChange={(event) => updateFilter('keyword', event.target.value)} placeholder="Job title, skill or company" /></label>
            <label className="explore-search-field"><FaMapMarkerAlt aria-hidden="true" /><span className="visually-hidden">Location</span><input value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} placeholder="City or remote" /></label>
            <button className="btn btn-primary rounded-pill px-4" type="submit">Search jobs</button>
          </form>
        </div>
      </section>

      <section className="container explore-results py-5">
        <div className="explore-results-heading">
          <div><span className="explore-eyebrow">CAREERCONNECT OPPORTUNITIES</span><h2>Explore jobs</h2></div>
          <p>{loading ? 'Finding matching roles…' : `${total} ${total === 1 ? 'opportunity' : 'opportunities'} found`}</p>
        </div>
        {jobsSourceMessage && <p className="small text-secondary mb-3" role="status">{jobsSourceMessage}</p>}

        <div className="explore-layout">
          <form className="explore-filter-card" onSubmit={submitSearch}>
            <div className="d-flex justify-content-between align-items-center mb-3"><h3>Refine search</h3><button type="button" className="explore-clear" onClick={clearSearch}>Clear</button></div>
            <label className="explore-filter-label" htmlFor="explore-type">Job type</label>
            <select id="explore-type" className="form-select" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}><option value="">Any type</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select>
            <label className="explore-filter-label" htmlFor="explore-mode">Work mode</label>
            <select id="explore-mode" className="form-select" value={filters.workMode} onChange={(event) => updateFilter('workMode', event.target.value)}><option value="">Any work mode</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
            <label className="explore-filter-label" htmlFor="explore-experience">Experience</label>
            <select id="explore-experience" className="form-select" value={filters.experienceLevel} onChange={(event) => updateFilter('experienceLevel', event.target.value)}><option value="">Any experience</option><option>Entry-level</option><option>Mid-level</option><option>Senior</option></select>
            <label className="explore-filter-label" htmlFor="explore-min-salary">Minimum salary (₹ / year)</label>
            <input id="explore-min-salary" className="form-control" type="number" min="0" value={filters.minSalary} onChange={(event) => updateFilter('minSalary', event.target.value)} placeholder="No minimum" />
            <label className="explore-filter-label" htmlFor="explore-max-salary">Maximum salary (₹ / year)</label>
            <input id="explore-max-salary" className="form-control" type="number" min="0" value={filters.maxSalary} onChange={(event) => updateFilter('maxSalary', event.target.value)} placeholder="No maximum" />
            <button className="btn btn-primary rounded-pill w-100 mt-4" type="submit">Apply filters</button>
          </form>

          <div className="explore-job-list" aria-live="polite">
            {loading ? <div className="explore-state-card" role="status"><span className="spinner-border spinner-border-sm text-primary" /> Loading opportunities…</div> : error ? <div className="explore-state-card" role="alert"><strong>We couldn’t load jobs just now.</strong><span>{error}</span><button className="btn btn-outline-primary rounded-pill align-self-start" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button></div> : jobs.length ? jobs.map((job, index) => (
              <article className="explore-job-card" key={getJobId(job) || `${job.company}-${job.title}-${index}`}>
                <div className="explore-company-mark"><FaBriefcase aria-hidden="true" /></div>
                <div className="explore-job-content">
                  <div className="explore-job-topline"><span>{job.type}</span>{job.workMode && <span>{job.workMode}</span>}</div>
                  <h3><Link href={`/jobs/${getJobId(job)}`}>{job.title}</Link></h3>
                  <p className="explore-company-name">{job.company}</p>
                  <div className="explore-job-meta"><span><FaMapMarkerAlt aria-hidden="true" />{job.location}</span>{job.experienceLevel && <span>{job.experienceLevel}</span>}{job.salary && <span>{job.salary}</span>}</div>
                  {job.description && <p className="explore-job-description">{job.description}</p>}
                  <div className="explore-job-footer"><span>{job.deadline ? `Apply by ${new Date(job.deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : 'Open for applications'}</span><Link href={`/jobs/${getJobId(job)}`} className="explore-job-link">View details <FaArrowRight aria-hidden="true" /></Link></div>
                </div>
              </article>
            )) : <div className="explore-state-card"><span className="explore-empty-icon"><FaBriefcase aria-hidden="true" /></span><strong>No matching jobs yet</strong><span>Try a broader search or clear the filters. New opportunities will appear here as employers post them.</span><button className="btn btn-outline-primary rounded-pill align-self-center" type="button" onClick={clearSearch}>Clear filters</button></div>}

            {!loading && !error && pages > 1 && <nav className="explore-pagination" aria-label="Job search pages"><button className="btn btn-outline-primary rounded-pill" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn btn-outline-primary rounded-pill" type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
