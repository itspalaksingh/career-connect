import type { Metadata } from 'next';
import Link from 'next/link';
import { FaArrowRight, FaBriefcase } from 'react-icons/fa';
import SiteFooter from '../components/SiteFooter';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Browse the main pages and job search sections on CareerConnect.',
};

const sections = [
  {
    title: 'Explore opportunities',
    description: 'Search open roles and browse popular job paths.',
    links: [
      { label: 'Explore all jobs', href: '/explore-jobs', detail: 'Search and filter current openings' },
      { label: 'Full-time roles', href: '/explore-jobs?type=Full-time', detail: 'Browse full-time opportunities' },
      { label: 'Internships', href: '/explore-jobs?type=Internship', detail: 'Discover internships and early career roles' },
      { label: 'Remote jobs', href: '/explore-jobs?workMode=Remote', detail: 'Find remote opportunities' },
      { label: 'Entry-level roles', href: '/explore-jobs?experienceLevel=Entry-level', detail: 'Start your career search' },
    ],
  },
  {
    title: 'Your CareerConnect account',
    description: 'Sign in to save jobs and keep track of applications.',
    links: [
      { label: 'Create an account', href: '/signup', detail: 'Join CareerConnect' },
      { label: 'Sign in', href: '/login', detail: 'Access your account' },
      { label: 'Saved jobs', href: '/saved-jobs', detail: 'Return to roles you bookmarked' },
      { label: 'My applications', href: '/applications', detail: 'Check the progress of your applications' },
    ],
  },
  {
    title: 'For employers',
    description: 'Manage roles and connect with candidates.',
    links: [
      { label: 'Post a job', href: '/post-jobs', detail: 'Create and manage a job listing' },
      { label: 'Recruiter dashboard', href: '/dashboard', detail: 'Review your listings and applicants' },
    ],
  },
  {
    title: 'About CareerConnect',
    description: 'Learn about the people-first job search experience.',
    links: [{ label: 'About us', href: '/about', detail: 'Our purpose and what guides us' }],
  },
];

export default function SitemapPage() {
  return (
    <main className="sitemap-page">
      <header className="explore-header">
        <div className="container d-flex align-items-center justify-content-between gap-3">
          <Link className="navbar-brand career-brand" href="/"><span className="career-brand-mark"><FaBriefcase aria-hidden="true" /></span><span>CareerConnect<span className="career-brand-dot">.</span></span></Link>
          <nav className="d-flex align-items-center gap-3" aria-label="Main navigation"><Link className="explore-header-link" href="/explore-jobs">Explore jobs</Link><Link className="explore-header-link" href="/about">About us</Link></nav>
        </div>
      </header>
      <section className="sitemap-hero"><div className="container py-5"><span className="explore-eyebrow">FIND YOUR WAY</span><h1>CareerConnect sitemap</h1><p>Quick links to job search, account tools, employer features, and more.</p><Link href="/explore-jobs" className="btn btn-primary rounded-pill px-4">Browse opportunities <FaArrowRight className="ms-2" aria-hidden="true" /></Link></div></section>
      <section className="container sitemap-content py-5"><div className="row g-3 g-lg-4">{sections.map((section) => <div className="col-md-6" key={section.title}><section className="sitemap-card"><span className="explore-eyebrow">CAREERCONNECT</span><h2>{section.title}</h2><p>{section.description}</p><ul>{section.links.map((link) => <li key={link.href}><Link href={link.href}><span><strong>{link.label}</strong><small>{link.detail}</small></span><FaArrowRight aria-hidden="true" /></Link></li>)}</ul></section></div>)}</div><p className="sitemap-xml-note">For search engines and other crawlers, view the <Link href="/sitemap.xml">XML sitemap</Link>.</p></section>
      <SiteFooter />
    </main>
  );
}
