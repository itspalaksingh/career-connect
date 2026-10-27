
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJobId, searchJobs, type JobListing } from '@/data/jobs';
import SiteFooter from './components/SiteFooter';

type SearchFilters = { keyword: string; location: string; type: string; workMode: string; minSalary: string; maxSalary: string };

import {
  FaSearch,
  FaBriefcase,
  FaArrowRight,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaClipboardCheck,
  FaUsers,
} from 'react-icons/fa';

const jobPaths = [
  { title: 'Full-time roles', detail: 'Build your next chapter', query: 'type=Full-time', icon: FaBriefcase },
  { title: 'Internships', detail: 'Learn by doing', query: 'type=Internship', icon: FaGraduationCap },
  { title: 'Remote work', detail: 'Find work from anywhere', query: 'workMode=Remote', icon: FaMapMarkerAlt },
  { title: 'Entry level', detail: 'Take your first step', query: 'experienceLevel=Entry-level', icon: FaArrowRight },
];

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ keyword: '', location: '', type: '', workMode: '', minSalary: '', maxSalary: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobRailRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsSourceMessage, setJobsSourceMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), limit: '6' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });

    searchJobs(params)
      .then((data) => {
        if (!active) return;
        setJobs(data.jobs);
        setTotalJobs(data.total);
        setTotalPages(data.pages);
        setJobsSourceMessage(data.sourceMessage || '');
        setError('');
      })
      .catch(() => {
        if (active) setError('Jobs load nahi ho paayi. Backend check karo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [filters, page, retryCount]);

  const filteredJobs = jobs;
  const scrollJobs = (direction: 'previous' | 'next') => {
    const rail = jobRailRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: (direction === 'next' ? 1 : -1) * rail.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  return (
    <main className="career-home">
      {/* Hero Section */}
      <section id="home" className="career-hero py-5">
        <div className="container py-lg-5 career-hero-content">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 mb-3">
                A smarter way to find your next move
              </span>

              <h1 className="display-4 fw-bold lh-sm mb-4">
                Find work that moves you <span className="text-primary">forward.</span>
              </h1>

              <p className="lead text-secondary mb-4">
                Discover roles that fit your skills, goals, and the life you want to build.
              </p>

              {/* Search Form */}
              <form
                className="career-search-panel bg-white p-3 rounded-4 shadow-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  const params = new URLSearchParams();
                  Object.entries({ keyword, location, type: jobType, workMode, minSalary, maxSalary }).forEach(([key, value]) => {
                    if (value.trim()) params.set(key, value.trim());
                  });
                  router.push(`/explore-jobs${params.size ? `?${params.toString()}` : ''}`);
                }}
              >
                <div className="row g-3">
                  <div className="col-md-5">
                    <label htmlFor="job-keyword" className="form-label small fw-semibold">
                      Job title or keyword
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FaSearch />
                      </span>

                      <input
                        id="job-keyword"
                        className="form-control border-start-0"
                        placeholder="e.g. Developer"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="job-location" className="form-label small fw-semibold">
                      Location
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaMapMarkerAlt />
                      </span>

                      <input
                        id="job-location"
                        className="form-control"
                        placeholder="e.g. Remote"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="job-type-filter" className="form-label small fw-semibold">Job type</label>
                    <select id="job-type-filter" className="form-select" value={jobType} onChange={(event) => setJobType(event.target.value)}>
                      <option value="">All types</option>
                      <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <details className="search-extra-filters">
                      <summary>More filters <span>Salary and work mode</span></summary>
                      <div className="row g-3 pt-3">
                        <div className="col-md-4"><label htmlFor="min-salary-filter" className="form-label small fw-semibold">Minimum annual salary (₹)</label><input id="min-salary-filter" className="form-control" type="number" min={0} value={minSalary} onChange={(event) => setMinSalary(event.target.value)} placeholder="e.g. 400000" /></div>
                        <div className="col-md-4"><label htmlFor="max-salary-filter" className="form-label small fw-semibold">Maximum annual salary (₹)</label><input id="max-salary-filter" className="form-control" type="number" min={0} value={maxSalary} onChange={(event) => setMaxSalary(event.target.value)} placeholder="e.g. 1200000" /></div>
                        <div className="col-md-4"><label htmlFor="work-mode-filter" className="form-label small fw-semibold">Work mode</label><select id="work-mode-filter" className="form-select" value={workMode} onChange={(event) => setWorkMode(event.target.value)}><option value="">Any work mode</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div>
                      </div>
                    </details>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100 py-2"
                      type="submit"
                    >
                      Search Jobs
                    </button>
                  </div>
                </div>
              </form>

              <p className="small text-secondary mt-3">
                Explore opportunities and take the next step in your career.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="career-hero-card bg-white rounded-5 shadow p-4 p-md-5">
                <div
                  className="career-hero-icon d-flex align-items-center justify-content-center bg-primary-subtle rounded-4 mb-4"
                  style={{ height: 180 }}
                >
                  <FaGraduationCap size={90} />
                </div>

                <h3 className="fw-bold">
                  Your next opportunity awaits.
                </h3>

                <p className="text-secondary mb-4">
                  Find opportunities that help you learn, grow, and succeed.
                </p>

                <a
                  href="/explore-jobs"
                  className="btn btn-outline-primary rounded-pill"
                  aria-label="Explore all jobs"
                >
                  Browse jobs <FaArrowRight className="ms-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section id="jobs" className="py-5">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
            <div>
              <p className="text-primary fw-semibold mb-2">
                OPPORTUNITIES
              </p>
              <h2 className="fw-bold mb-2">Featured Jobs</h2>
              <p className="text-secondary mb-0">
                Discover opportunities for your next career move.
              </p>
              {jobsSourceMessage && <p className="small text-secondary mt-2 mb-0" role="status">{jobsSourceMessage}</p>}
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary">
                {totalJobs} opportunities found
              </span>
              <Link className="home-view-all" href="/explore-jobs">View all jobs <FaArrowRight aria-hidden="true" /></Link>
              <div className="d-flex gap-2" aria-label="Job carousel controls">
                <button className="jobs-carousel-arrow" type="button" aria-label="Scroll to previous jobs" onClick={() => scrollJobs('previous')}>
                  <FaChevronLeft aria-hidden="true" />
                </button>
                <button className="jobs-carousel-arrow" type="button" aria-label="Scroll to next jobs" onClick={() => scrollJobs('next')}>
                  <FaChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="jobs-carousel-track" id="jobs-carousel" ref={jobRailRef} role="region" aria-label="Featured job opportunities">
            {loading ? (
              <div className="job-slide job-slide-message" role="status">Loading jobs...</div>
            ) : error ? (
              <div className="job-slide job-slide-message">
                <div className="alert alert-warning w-100 d-flex flex-column align-items-center justify-content-center gap-2" role="alert">
                  <span>{error}</span>
                  <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => { setLoading(true); setRetryCount((count) => count + 1); }}>Try again</button>
                </div>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <div
                  className="job-slide"
                  key={getJobId(job) || `${job.company}-${job.title}-${index}`}
                >
                  <article className="job-carousel-card">
                    <div className="job-carousel-card-body">
                      <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                        <div className="job-card-icon">
                          <FaBriefcase size={24} />
                        </div>

                        <span className="job-type-badge">
                          {job.type}
                        </span>
                      </div>

                      <h3 className="job-card-title">{job.title}</h3>
                      <p className="job-card-company">{job.company}</p>

                      <p className="job-card-location">
                        <FaMapMarkerAlt aria-hidden="true" />
                        {job.location}
                      </p>

                      {job.description && <p className="job-card-description">{job.description}</p>}

                      <div className="job-card-footer">
                        <span>Explore this opportunity</span>
                        <Link
                          href={`/jobs/${getJobId(job)}`}
                          className="job-card-link"
                          aria-label={`View details for ${job.title} at ${job.company}`}
                        >
                          <FaArrowRight aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))
            ) : (
              <div className="job-slide job-slide-message">
                <div className="alert alert-light border text-center py-4 w-100">
                  No matching jobs found. Try another keyword or location.
                </div>
              </div>
            )}
          </div>

          {!loading && !error && totalPages > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-3 mt-4" aria-label="Jobs pages">
              <button className="btn btn-outline-primary rounded-pill" disabled={page <= 1} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>Previous</button>
              <span className="text-secondary">Page {page} of {totalPages}</span>
              <button className="btn btn-outline-primary rounded-pill" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next</button>
            </nav>
          )}
        </div>
      </section>

      <section className="job-paths-section py-5">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
            <div>
              <p className="text-primary fw-semibold mb-2">MAKE YOUR SEARCH YOURS</p>
              <h2 className="fw-bold mb-2">Explore jobs your way</h2>
              <p className="text-secondary mb-0">Start with the kind of opportunity you’re looking for.</p>
            </div>
            <Link href="/explore-jobs" className="home-view-all">See every opportunity <FaArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="row g-3">
            {jobPaths.map(({ title, detail, query, icon: Icon }) => (
              <div className="col-12 col-sm-6 col-xl-3" key={title}>
                <Link className="job-path-card" href={`/explore-jobs?${query}`}>
                  <span className="job-path-icon"><Icon aria-hidden="true" /></span>
                  <span className="job-path-copy"><strong>{title}</strong><small>{detail}</small></span>
                  <FaArrowRight className="job-path-arrow" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-steps-section py-5">
        <div className="container py-3">
          <div className="text-center home-steps-heading"><p className="text-primary fw-semibold mb-2">A SEARCH THAT MOVES WITH YOU</p><h2 className="fw-bold">From first search to next step.</h2><p className="text-secondary">Keep the useful parts of your job search in one place.</p></div>
          <div className="row g-3 g-lg-4 mt-2">
            <div className="col-md-4"><article className="home-step-card"><span className="home-step-number">01</span><span className="home-step-icon"><FaSearch aria-hidden="true" /></span><h3>Find your fit</h3><p>Search open roles by keyword, location, job type, and work mode.</p><Link href="/explore-jobs">Explore jobs <FaArrowRight aria-hidden="true" /></Link></article></div>
            <div className="col-md-4"><article className="home-step-card"><span className="home-step-number">02</span><span className="home-step-icon"><FaHeart aria-hidden="true" /></span><h3>Save the good ones</h3><p>Bookmark promising roles so you can come back when you’re ready.</p><Link href="/saved-jobs">View saved jobs <FaArrowRight aria-hidden="true" /></Link></article></div>
            <div className="col-md-4"><article className="home-step-card"><span className="home-step-number">03</span><span className="home-step-icon"><FaClipboardCheck aria-hidden="true" /></span><h3>Keep moving</h3><p>Apply to roles and follow your application progress from one place.</p><Link href="/applications">Track applications <FaArrowRight aria-hidden="true" /></Link></article></div>
          </div>
        </div>
      </section>

      <section className="container recruiter-cta-wrap py-5">
        <div className="recruiter-cta"><span className="recruiter-cta-icon"><FaUsers aria-hidden="true" /></span><div><span>HIRING FOR YOUR TEAM?</span><h2>Meet the people ready for their next move.</h2><p className="mb-0">Create an account, then request recruiter access from your profile.</p></div><Link className="btn btn-light rounded-pill px-4" href="/signup">Get started <FaArrowRight aria-hidden="true" /></Link></div>
      </section>

      {/* About Section */}
      <section id="about" className="career-about-section py-5 bg-light">
        <div className="container py-4 text-center">
          <h2 className="fw-bold mb-3">
            Your journey starts with one step.
          </h2>

          <p
            className="text-secondary mx-auto"
            style={{ maxWidth: 650 }}
          >
            CareerConnect brings students, freshers, and employers together
            through meaningful career opportunities.
          </p>

          <Link href="/about" className="btn btn-outline-primary rounded-pill px-4 me-2">Meet CareerConnect</Link>
          <Link href="/explore-jobs" className="btn btn-primary rounded-pill px-4">Explore Opportunities</Link>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
