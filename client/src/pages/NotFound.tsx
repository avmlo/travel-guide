import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      
      <div className="px-6 md:px-10 py-20">
        <div className="max-w-[1920px] mx-auto">
          {/* 404 Section */}
          <div className="text-center max-w-2xl mx-auto">
            {/* Large 404 Number */}
            <h1 className="text-[clamp(80px,15vw,200px)] font-bold uppercase leading-none tracking-tight text-gray-900 dark:text-white mb-8">
              404
            </h1>
            
            {/* Message */}
            <div className="space-y-4 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-gray-900 dark:text-white">
                Page Not Found
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                The page you're looking for doesn't exist or has been moved.
                <br className="hidden sm:block" />
                Let's get you back on track.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setLocation("/")}
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold uppercase hover:opacity-60 transition-opacity"
              >
                Back to Home
              </button>
              <button
                onClick={() => setLocation("/cities")}
                className="px-8 py-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white text-xs font-bold uppercase hover:opacity-60 transition-opacity"
              >
                Browse Cities
              </button>
            </div>
          </div>
          
          {/* Decorative Line */}
          <div className="mt-20 border-t border-gray-200 dark:border-gray-800" />
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}

