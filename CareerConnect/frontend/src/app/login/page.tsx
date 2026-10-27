
'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaBriefcase,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from 'react-icons/fa';

const subscribeToYear = () => () => {};
const getClientYear = () => String(new Date().getFullYear());
const getServerYear = () => '';

export default function LoginPage() {
  const router = useRouter();
  const currentYear = useSyncExternalStore(
    subscribeToYear,
    getClientYear,
    getServerYear
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      const response = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email.trim(),
            password,
            rememberMe,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Login failed. Please try again.');
        return;
      }

      setPassword('');
      const next = new URLSearchParams(window.location.search).get('next');
      if (next?.startsWith('/') && !next.startsWith('//')) {
        router.replace(next);
      } else {
        router.replace('/dashboard');
      }
    } catch {
      setMessage('Cannot reach the login service. Start the project with “npm run dev” and make sure MongoDB is available.');
    }
  }

  return (
    <main
      className="auth-page-background min-vh-100 d-flex align-items-center py-5"
    >
      <div className="container">
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-lg-5 col-md-8">
            <div className="text-center mb-4">
              <Link
                href="/"
                className="text-decoration-none d-inline-flex align-items-center gap-2"
              >
                <span
                  className="d-flex align-items-center justify-content-center rounded-3 text-white"
                  style={{
                    width: 46,
                    height: 46,
                    background: '#3157d5',
                  }}
                >
                  <FaBriefcase size={22} />
                </span>
                <span className="fs-3 fw-bold text-dark">
                  CareerConnect<span className="text-primary">.</span>
                </span>
              </Link>
            </div>

            <div
              className="auth-card card border-0 rounded-4 p-3 p-sm-4"
              style={{
                boxShadow: '0 20px 60px rgba(36, 65, 130, 0.10)',
              }}
            >
              <div className="card-body">
                <div className="mb-4">
                  <h1 className="h2 fw-bold mb-2">Welcome back!</h1>
                  <p className="text-secondary mb-0">
                    Sign in to continue your career journey.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaEnvelope className="text-secondary" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        className="form-control py-2"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaLock className="text-secondary" />
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control py-2"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-2 mb-4">
                    <label className="d-flex align-items-center gap-2 small">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                      />
                      Remember me
                    </label>

                    <Link
                      href="/forgot-password"
                      className="small text-primary text-decoration-none"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                  >
                    Sign In <FaArrowRight className="ms-2" />
                  </button>

                  {message && (
                    <div
                      className="alert alert-info mt-3 mb-0"
                      role="status"
                    >
                      {message}
                    </div>
                  )}
                </form>

                <div className="text-center mt-4">
                  <span className="text-secondary">
                    Don&apos;t have an account?{' '}
                  </span>
                  <Link
                    href="/signup"
                    className="fw-semibold text-primary text-decoration-none"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-secondary small mt-4">
              © {currentYear} CareerConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
