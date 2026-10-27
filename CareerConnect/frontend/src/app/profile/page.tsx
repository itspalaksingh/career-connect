'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Profile = {
  headline: string;
  location: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  resumeUrl: string;
};

const emptyProfile: Profile = { headline: '', location: '', bio: '', skills: [], experienceYears: 0, resumeUrl: '' };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [skills, setSkills] = useState('');
  const [role, setRole] = useState('Candidate');
  const [requestStatus, setRequestStatus] = useState('None');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' }).then(async (response) => {
      if (!response.ok) throw new Error('Please log in to edit your profile.');
      const data = await response.json();
      const loaded = data.user.profile || emptyProfile;
      setProfile({ ...emptyProfile, ...loaded });
      setSkills((loaded.skills || []).join(', '));
      setRole(data.user.role);
      setRequestStatus(data.user.recruiterRequestStatus || 'None');
    }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/profile', {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean) }),
    });
    const data = await response.json();
    setMessage(response.ok ? 'Profile saved.' : data.message || 'Could not save profile.');
  };

  const requestRecruiter = async () => {
    const response = await fetch('/api/profile/request-recruiter', { method: 'POST', credentials: 'include' });
    const data = await response.json();
    setMessage(data.message || 'Could not submit the request.');
    if (response.ok) setRequestStatus('Pending');
  };

  return (
    <main className="container py-5 min-vh-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div><p className="text-primary fw-bold mb-2">CAREERCONNECT</p><h1 className="fw-bold">Your profile</h1><p className="text-secondary mb-0">Help employers understand what you bring to the role.</p></div>
        <Link href="/" className="btn btn-outline-primary rounded-pill">Back to jobs</Link>
      </div>
      {loading ? <p role="status">Loading profile…</p> : (
        <div className="row g-4">
          <section className="col-lg-8">
            <form className="card border-0 shadow-sm rounded-4 p-4 p-md-5" onSubmit={saveProfile}>
              <div className="mb-3"><label className="form-label fw-semibold" htmlFor="headline">Professional headline</label><input id="headline" className="form-control" maxLength={120} value={profile.headline} onChange={(event) => setProfile({ ...profile, headline: event.target.value })} placeholder="e.g. Frontend developer focused on accessible products" /></div>
              <div className="row g-3 mb-3">
                <div className="col-md-7"><label className="form-label fw-semibold" htmlFor="profile-location">Preferred location</label><input id="profile-location" className="form-control" value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} placeholder="Patna, Remote…" /></div>
                <div className="col-md-5"><label className="form-label fw-semibold" htmlFor="experience-years">Experience (years)</label><input id="experience-years" type="number" min={0} max={60} className="form-control" value={profile.experienceYears} onChange={(event) => setProfile({ ...profile, experienceYears: Number(event.target.value) })} /></div>
              </div>
              <div className="mb-3"><label className="form-label fw-semibold" htmlFor="profile-skills">Skills</label><input id="profile-skills" className="form-control" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, JavaScript, Figma" /><div className="form-text">Separate skills with commas.</div></div>
              <div className="mb-3"><label className="form-label fw-semibold" htmlFor="resume-url">Resume link (HTTPS)</label><input id="resume-url" type="url" className="form-control" value={profile.resumeUrl} onChange={(event) => setProfile({ ...profile, resumeUrl: event.target.value })} placeholder="https://…" /></div>
              <div className="mb-4"><label className="form-label fw-semibold" htmlFor="profile-bio">About you</label><textarea id="profile-bio" className="form-control" rows={5} maxLength={1200} value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="A short professional introduction" /></div>
              <button className="btn btn-primary rounded-pill px-4 align-self-start">Save profile</button>
              {message && <p className="alert alert-info mt-3 mb-0" role="status">{message}</p>}
            </form>
          </section>
          <aside className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <span className="badge text-bg-primary align-self-start mb-3">{role}</span>
              <h2 className="h5 fw-bold">Want to hire on CareerConnect?</h2>
              {role === 'Candidate' ? <>
                <p className="text-secondary">Recruiter access is reviewed by an administrator before job-posting tools are enabled.</p>
                <button className="btn btn-outline-primary rounded-pill" disabled={requestStatus === 'Pending'} onClick={requestRecruiter}>{requestStatus === 'Pending' ? 'Request pending' : requestStatus === 'Rejected' ? 'Request again' : 'Request recruiter access'}</button>
              </> : <p className="text-secondary mb-0">{role === 'Admin' ? 'Admin access enabled.' : 'Recruiter tools are ready.'}</p>}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
