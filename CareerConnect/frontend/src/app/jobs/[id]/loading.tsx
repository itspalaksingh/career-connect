export default function JobDetailsLoading() {
  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      aria-live="polite"
      role="status"
    >
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" aria-hidden="true" />
        <p className="text-secondary mb-0">Loading job details...</p>
      </div>
    </main>
  );
}
