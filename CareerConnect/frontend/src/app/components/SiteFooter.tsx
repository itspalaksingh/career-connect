import Link from 'next/link';
import { FaBriefcase, FaArrowRight } from 'react-icons/fa';

const groups = [
  {
    heading: 'Find opportunities',
    links: [
      { label: 'Explore all jobs', href: '/explore-jobs' },
      { label: 'Full-time roles', href: '/explore-jobs?type=Full-time' },
      { label: 'Internships', href: '/explore-jobs?type=Internship' },
      { label: 'Remote jobs', href: '/explore-jobs?workMode=Remote' },
    ],
  },
  {
    heading: 'For job seekers',
    links: [
      { label: 'Create an account', href: '/signup' },
      { label: 'Sign in', href: '/login' },
      { label: 'Saved jobs', href: '/saved-jobs' },
      { label: 'My applications', href: '/applications' },
    ],
  },
  {
    heading: 'For employers',
    links: [
      { label: 'Post a job', href: '/post-jobs' },
      { label: 'Employer sign in', href: '/login' },
      { label: 'Join CareerConnect', href: '/signup' },
    ],
  },
  {
    heading: 'CareerConnect',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Sitemap', href: '/sitemap' },
      { label: 'Browse jobs', href: '/explore-jobs' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-main">
        <div className="site-footer-brand-block">
          <Link className="site-footer-brand" href="/">
            <span className="career-brand-mark"><FaBriefcase aria-hidden="true" /></span>
            <span>CareerConnect<span className="career-brand-dot">.</span></span>
          </Link>
          <p>Good work can change what’s possible. Find your next step with a little more clarity.</p>
          <Link href="/explore-jobs" className="site-footer-cta">Explore jobs <FaArrowRight aria-hidden="true" /></Link>
        </div>
        {groups.map((group) => (
          <nav className="site-footer-column" aria-label={group.heading} key={group.heading}>
            <h2>{group.heading}</h2>
            <ul>{group.links.map((link) => <li key={`${group.heading}-${link.label}`}><Link href={link.href}>{link.label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className="site-footer-bottom">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <span>© CareerConnect. Built for your next opportunity.</span>
          <div className="d-flex align-items-center gap-3"><Link href="/sitemap">Sitemap</Link><Link href="/about">About us</Link><Link href="/explore-jobs">Explore jobs</Link></div>
        </div>
      </div>
    </footer>
  );
}
