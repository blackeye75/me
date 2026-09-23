import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="label not-found-code">404 · Page not found</p>
      <h1 className="not-found-title">404</h1>
      <div className="not-found-row">
        <p>This page doesn’t exist, or it moved.</p>
        <Link href="/">Back to the homepage →</Link>
      </div>
    </main>
  );
}
