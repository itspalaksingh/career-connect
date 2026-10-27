import { Suspense } from 'react';
import ExploreJobsClient from './ExploreJobsClient';

export default function ExploreJobsPage() {
  return <Suspense fallback={<main className="explore-loading"><span className="spinner-border text-primary" role="status" /><p>Loading opportunities…</p></main>}><ExploreJobsClient /></Suspense>;
}
