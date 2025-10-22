import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  hasConsented,
  acceptAllCookies,
  rejectOptionalCookies,
  saveConsent,
  getCurrentPreferences,
  type CookiePreferences,
} from "@/lib/cookieConsent";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consented = hasConsented();
    setShowBanner(!consented);

    // Load current preferences if they exist
    if (consented) {
      setPreferences(getCurrentPreferences());
    }

    // Listen for cookie preferences open event from footer
    const handleOpenPreferencesEvent = () => {
      setPreferences(getCurrentPreferences());
      setShowPreferences(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferencesEvent);

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferencesEvent);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handleOpenPreferences = () => {
    setPreferences(getCurrentPreferences());
    setShowPreferences(true);
  };

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto border-t border-gray-200 bg-white">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-xs font-bold mb-3 sm:mb-0">
                      WE USE COOKIES TO ENHANCE YOUR EXPERIENCE.{" "}
                      <button
                        onClick={handleOpenPreferences}
                        className="underline hover:no-underline"
                      >
                        MANAGE PREFERENCES
                      </button>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity border border-gray-200 px-4 py-2"
                    >
                      ACCEPT ALL
                    </button>
                    <button
                      onClick={handleRejectOptional}
                      className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
                    >
                      REJECT
                    </button>
                    <button
                      onClick={handleOpenPreferences}
                      className="text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity"
                    >
                      CUSTOMIZE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Preferences Modal */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wide text-gray-600">
              Manage your cookie settings below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide">Necessary Cookies</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black px-2 py-0.5">
                    ALWAYS ACTIVE
                  </span>
                </div>
                <Switch checked={true} disabled />
              </div>
              <p className="text-xs text-gray-600">
                Essential for the website to function. Enable core functionality such as security,
                network management, and accessibility.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wide">Analytics Cookies</h4>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                />
              </div>
              <p className="text-xs text-gray-600">
                Help us understand how visitors interact with our website by collecting and reporting
                information anonymously.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wide">Marketing Cookies</h4>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                />
              </div>
              <p className="text-xs text-gray-600">
                Used to track visitors across websites. Display ads that are relevant and engaging
                for the individual user.
              </p>
            </div>

            {/* Preference Cookies */}
            <div className="border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wide">Preference Cookies</h4>
                <Switch
                  checked={preferences.preferences}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, preferences: checked })
                  }
                />
              </div>
              <p className="text-xs text-gray-600">
                Enable the website to remember choices you make and provide enhanced, more personal
                features.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSavePreferences}
              className="flex-1 text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity bg-black text-white px-6 py-3"
            >
              Save Preferences
            </button>
            <button
              onClick={() => {
                setPreferences({
                  necessary: true,
                  analytics: true,
                  marketing: true,
                  preferences: true,
                });
              }}
              className="flex-1 text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity border border-gray-200 px-6 py-3"
            >
              Accept All
            </button>
            <button
              onClick={() => {
                setPreferences({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                  preferences: false,
                });
              }}
              className="flex-1 text-xs font-bold uppercase tracking-wide hover:opacity-70 transition-opacity border border-gray-200 px-6 py-3"
            >
              Reject Optional
            </button>
          </div>

          {/* Legal Links */}
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 pt-4 border-t border-gray-200">
            By using our website, you agree to our{" "}
            <a href="/privacy" className="underline hover:no-underline text-black">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" className="underline hover:no-underline text-black">
              Terms of Service
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
