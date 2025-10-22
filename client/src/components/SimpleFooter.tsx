export function SimpleFooter() {
  return (
    <footer className="border-t border-gray-200 py-8 px-6 md:px-10">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} The Urban Manual. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">About</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Contact</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Privacy</a>
            <a href="#" className="text-xs font-bold uppercase hover:opacity-60 transition-opacity">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

