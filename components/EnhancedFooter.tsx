import { Link } from "wouter";

export function EnhancedFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-[1440px] mx-auto px-10 py-16">
        {/* Top Section - CTA */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-sm text-gray-400 mb-2">Let's explore</p>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                Discover amazing places
                <br />
                around the world
              </h2>
              <div className="flex gap-3">
                <Link href="/explore">
                  <a className="px-6 py-2.5 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                    Explore now
                  </a>
                </Link>
                <Link href="/account">
                  <a className="px-6 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                    Sign up
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div className="border-t border-b border-gray-800 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Logo/Brand */}
            <div className="md:col-span-3">
              <Link href="/">
                <a className="text-2xl font-semibold">TravelGuide</a>
              </Link>
            </div>

            {/* Categories */}
            <div className="md:col-span-3">
              <h3 className="text-sm text-gray-400 mb-4">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/city/tokyo">
                    <a className="text-sm hover:text-gray-300 transition-colors">Restaurants</a>
                  </Link>
                </li>
                <li>
                  <Link href="/city/paris">
                    <a className="text-sm hover:text-gray-300 transition-colors">Hotels</a>
                  </Link>
                </li>
                <li>
                  <Link href="/cities">
                    <a className="text-sm hover:text-gray-300 transition-colors">Attractions</a>
                  </Link>
                </li>
                <li>
                  <Link href="/explore">
                    <a className="text-sm hover:text-gray-300 transition-colors">Cafes & Bars</a>
                  </Link>
                </li>
                <li>
                  <Link href="/explore">
                    <a className="text-sm hover:text-gray-300 transition-colors">Cultural Spaces</a>
                  </Link>
                </li>
                <li>
                  <Link href="/explore">
                    <a className="text-sm hover:text-gray-300 transition-colors">Shopping</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-3">
              <h3 className="text-sm text-gray-400 mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/feed">
                    <a className="text-sm hover:text-gray-300 transition-colors">About us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/lists">
                    <a className="text-sm hover:text-gray-300 transition-colors">Community</a>
                  </Link>
                </li>
                <li>
                  <Link href="/account">
                    <a className="text-sm hover:text-gray-300 transition-colors">Contact</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="md:col-span-3 flex justify-end">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-12">
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Discover the world's best destinations
              <br />
              Curated experiences from travelers who've been there.
            </p>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2025 TravelGuide. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy">
              <a className="text-sm text-gray-400 hover:text-white transition-colors">Privacy policy</a>
            </Link>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

