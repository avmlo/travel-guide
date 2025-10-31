'use client';

export default function MapPage() {
  return (
    <main className="px-4 md:px-6 lg:px-10 py-16 dark:text-white min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold mb-3">Map – Coming Soon</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We’re working on a beautiful, interactive map experience. Check back soon!
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}


