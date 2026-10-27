'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBriefcase, FaBars, FaTimes } from 'react-icons/fa';

export default function SiteNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (active) setUserRole(data.user?.role || 'Candidate');
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUserRole('');
      closeMenu();
      router.push('/login');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg career-navbar site-navbar" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand career-brand me-auto" href="/" onClick={closeMenu}>
          <span className="career-brand-mark"><FaBriefcase aria-hidden="true" /></span>
          <span>CareerConnect<span className="career-brand-dot">.</span></span>
        </Link>

        <button
          className="btn btn-outline-primary d-lg-none ms-2"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="careerconnect-navbar"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        <div
          id="careerconnect-navbar"
          className={`navbar-collapse ${menuOpen ? 'd-flex' : 'd-none'} d-lg-flex flex-column flex-lg-row align-items-stretch align-items-lg-center`}
        >
          <div className="navbar-nav ms-lg-auto align-items-stretch align-items-lg-center gap-lg-2 pt-3 pt-lg-0">
            <Link className="nav-link px-3" href="/" onClick={closeMenu}>Home</Link>
            <Link className="nav-link px-3" href="/explore-jobs" onClick={closeMenu}>Explore jobs</Link>
            <Link className="nav-link px-3" href="/about" onClick={closeMenu}>About us</Link>
            <div className="career-nav-actions">
              <Link className="btn btn-outline-primary rounded-pill px-4" href="/saved-jobs" onClick={closeMenu}>Saved jobs</Link>
              {userRole ? (
                <>
                  <Link className="btn btn-outline-primary rounded-pill px-4" href="/dashboard" onClick={closeMenu}>Dashboard</Link>
                  <Link className="btn btn-primary rounded-pill px-4" href="/profile" onClick={closeMenu}>Profile</Link>
                  <button className="btn btn-outline-primary rounded-pill px-4" type="button" onClick={logout}>Log out</button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-primary rounded-pill px-4" href="/login" onClick={closeMenu}>Log in</Link>
                  <Link className="btn btn-primary rounded-pill px-4" href="/signup" onClick={closeMenu}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
