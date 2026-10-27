'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await response.json(); setMessage(data.message || 'Could not reset password.');
    } catch { setMessage('Could not connect to the server.'); }
    finally { setBusy(false); }
  };
  return <main className="auth-page-background min-vh-100 d-flex align-items-center py-5"><div className="container"><div className="auth-card card border-0 rounded-4 p-4 p-md-5 mx-auto" style={{ maxWidth: 480 }}><h1 className="h2 fw-bold">Choose a new password</h1>{token ? <form onSubmit={submit}><label htmlFor="new-password" className="form-label fw-semibold">New password</label><input id="new-password" className="form-control mb-3" type="password" minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="btn btn-primary w-100 rounded-pill" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form> : <p className="text-secondary">This password reset link is incomplete.</p>}{message && <p className="alert alert-info mt-3 mb-0" role="status">{message}</p>}<Link href="/login" className="text-center mt-3">Back to login</Link></div></div></main>;
}
