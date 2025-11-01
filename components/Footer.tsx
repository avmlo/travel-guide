import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6 md:px-10 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} The Urban Manual. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity dark:text-gray-300">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
