import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brass">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you requested is not available in this workspace.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
