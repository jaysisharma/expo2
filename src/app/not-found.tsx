import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold font-display text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 font-body mb-8">
        Page not found
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-[#218A59] text-white font-body text-sm font-semibold uppercase"
      >
        Return Home
      </Link>
    </div>
  );
}
