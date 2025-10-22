export function Footer() {
  const handleCookieSettings = () => {
    // Trigger cookie preferences modal
    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
  };

  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            AVMLO LLC
          </a>
          <span className="text-xs text-gray-400">,</span>
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            TAPI GUIDE PROJECT
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            INSTAGRAM
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            TWITTER
          </a>
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            SAVEE
          </a>
          <span className="text-xs text-gray-400">|</span>
          <button
            onClick={handleCookieSettings}
            className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
          >
            COOKIE SETTINGS
          </button>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold">
            © {new Date().getFullYear()} ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}

