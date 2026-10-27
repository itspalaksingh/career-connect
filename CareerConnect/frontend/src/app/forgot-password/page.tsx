'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json(); setMessage(data.message || 'Could not request a reset link.');
    } catch { setMessage('Could not connect to the server.'); }
    finally { setBusy(false); }
  };
  return <main className="auth-page-background min-vh-100 d-flex align-items-center py-5"><div className="container"><div className="auth-card card border-0 rounded-4 p-4 p-md-5 mx-auto" style={{ maxWidth: 480 }}><h1 className="h2 fw-bold">Reset your password</h1><p className="text-secondary">Enter your account email and we’ll send a secure reset link if the account exists.</p><form onSubmit={submit}><label htmlFor="reset-email" className="form-label fw-semibold">Email address</label><input id="reset-email" className="form-control mb-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="btn btn-primary w-100 rounded-pill" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form>{message && <p className="alert alert-info mt-3 mb-0" role="status">{message}</p>}<Link href="/login" className="text-center mt-3">Back to login</Link></div></div></main>;
}
