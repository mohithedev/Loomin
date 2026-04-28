'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 text-center">
      <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
      <h2 className="text-2xl font-bold tracking-tight mt-4">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mx-auto mt-4 italic">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
      >
        Go back home
      </Link>
    </div>
  );
}
