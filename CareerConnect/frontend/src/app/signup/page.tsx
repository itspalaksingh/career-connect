
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setMessage('Password must be between 8 and 72 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        '/api/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Signup failed. Please try again.');
        return;
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const loginData = await loginResponse.json();
      setPassword('');
      if (loginResponse.ok) {
        router.replace('/dashboard');
        return;
      }

      setMessage(loginData.message || data.message || 'Account created. Please sign in to continue.');
    } catch {
      setMessage('Could not connect to the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="signup-page-background container-fluid d-flex align-items-center justify-content-center py-5"
      style={{
        minHeight: '100vh',
      }}
    >
      <div
        className="auth-card card border-0 shadow-lg p-4 p-md-5"
        style={{ width: '100%', maxWidth: '480px', borderRadius: '20px' }}
      >
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: '70px',
              height: '70px',
              background: '#e7efff',
              color: '#0d6efd',
            }}
          >
            <FaUserPlus size={30} />
          </div>

          <h2 className="fw-bold">Create Account</h2>
          <p className="text-secondary">
            Join CareerConnect and find your next opportunity.
          </p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">
              Full Name
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          {message && (
            <div className="alert alert-info" role="status">
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account?{' '}
          <Link href="/login" className="text-primary fw-semibold text-decoration-none">
            Login
          </Link>
        </p>

        <div className="text-center mt-3">
          <Link href="/" className="text-secondary text-decoration-none">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
