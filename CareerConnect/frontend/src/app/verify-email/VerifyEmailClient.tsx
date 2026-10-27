'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailClient({ token }: { token: string }) {
  const [message, setMessage] = useState(token ? 'Verifying your email…' : 'This verification link is incomplete.');
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (response) => { const data = await response.json(); setMessage(data.message || (response.ok ? 'Email verified.' : 'This link could not be verified.')); })
      .catch(() => setMessage('Could not connect to the server.'));
  }, [token]);
  return <main className="auth-page-background min-vh-100 d-flex align-items-center py-5"><div className="container"><div className="auth-card card border-0 rounded-4 p-4 p-md-5 mx-auto text-center" style={{ maxWidth: 480 }}><h1 className="h2 fw-bold">Email verification</h1><p className="text-secondary" role="status">{message}</p><Link href="/login" className="btn btn-primary rounded-pill">Continue to login</Link></div></div></main>;
}
