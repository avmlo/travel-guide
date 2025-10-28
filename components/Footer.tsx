export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6 md:px-10 mt-20">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} The Urban Manual. All rights reserved.</p>
      </div>
    </footer>
  );
}
