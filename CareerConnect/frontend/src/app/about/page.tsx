import Link from 'next/link';
import { FaArrowRight, FaBriefcase, FaBullseye, FaHeart, FaUsers } from 'react-icons/fa';
import SiteFooter from '../components/SiteFooter';

export const metadata = {
  title: 'About Us',
  description: 'Learn how CareerConnect helps people discover meaningful work and build their next career move.',
};

const values = [
  { icon: FaBullseye, title: 'Opportunity for everyone', text: 'We make it easier to find roles that fit your skills, goals, and stage of career.' },
  { icon: FaHeart, title: 'People come first', text: 'Clear information and a thoughtful experience help every search feel more human.' },
  { icon: FaUsers, title: 'Better together', text: 'We bring candidates and employers together to create meaningful connections.' },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <nav className="navbar career-navbar sticky-top" aria-label="Main navigation">
        <div className="container py-2">
          <Link className="navbar-brand career-brand" href="/">
            <span className="career-brand-mark"><FaBriefcase aria-hidden="true" /></span>
            <span>CareerConnect<span className="career-brand-dot">.</span></span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link className="btn btn-link text-decoration-none" href="/explore-jobs">Explore jobs</Link>
            <Link className="btn btn-primary rounded-pill px-3" href="/signup">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="about-hero">
        <div className="container py-5 py-lg-6">
          <div className="about-hero-copy">
            <span className="about-eyebrow">ABOUT CAREERCONNECT</span>
            <h1>Good work changes what’s possible.</h1>
            <p>We help students, freshers, and professionals discover opportunities that move their careers forward, while helping employers meet the people who can make a difference.</p>
            <Link href="/explore-jobs" className="btn btn-primary rounded-pill px-4 py-2 mt-2">Find your next opportunity <FaArrowRight className="ms-2" aria-hidden="true" /></Link>
          </div>
          <div className="about-hero-note" aria-label="CareerConnect mission">
            <span className="about-note-icon"><FaBriefcase aria-hidden="true" /></span>
            <p className="mb-2">A more thoughtful way to find your next step.</p>
            <span>Built around people, progress, and possibility.</span>
          </div>
        </div>
      </section>

      <section className="container about-story py-5 py-lg-6">
        <div className="row g-4 g-lg-5 align-items-start">
          <div className="col-lg-5"><span className="about-eyebrow">OUR PURPOSE</span><h2>Make the next move feel within reach.</h2></div>
          <div className="col-lg-7"><p>Finding a job can be overwhelming. CareerConnect brings useful opportunities into one place, with tools to search, save, apply, and keep track of your progress.</p><p>Whether you’re starting out, ready for a change, or building a team, our goal is to make every connection clearer and every next step easier.</p></div>
        </div>
      </section>

      <section className="about-values py-5 py-lg-6">
        <div className="container">
          <div className="mb-4 mb-lg-5"><span className="about-eyebrow">WHAT GUIDES US</span><h2 className="mt-2">A better experience, from search to next step.</h2></div>
          <div className="row g-3 g-lg-4">
            {values.map(({ icon: Icon, title, text }) => <div className="col-md-4" key={title}><article className="about-value-card"><span className="about-value-icon"><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article></div>)}
          </div>
        </div>
      </section>

      <section className="container about-cta py-5 py-lg-6">
        <div className="about-cta-panel">
          <div><span className="about-eyebrow">YOUR NEXT CHAPTER</span><h2>Start with one good opportunity.</h2><p className="mb-0">Explore roles and find the one that feels right for you.</p></div>
          <Link href="/explore-jobs" className="btn btn-light rounded-pill px-4 py-2">Explore jobs <FaArrowRight className="ms-2" aria-hidden="true" /></Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
