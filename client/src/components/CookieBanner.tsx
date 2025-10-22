import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto max-w-7xl mx-auto px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="bg-white border-2 border-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 hidden sm:block">
                      <div className="bg-black p-3 rounded-xl">
                        <Cookie className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        We value your privacy
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        We use cookies to enhance your browsing experience, serve personalized content,
                        and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
                        <button
                          onClick={handleOpenPreferences}
                          className="text-black font-semibold underline hover:no-underline"
                        >
                          Cookie Settings
                        </button>
                      </p>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleAcceptAll}
                          className="bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs tracking-wide"
                          size="lg"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept All
                        </Button>
                        <Button
                          onClick={handleRejectOptional}
                          variant="outline"
                          className="border-2 border-gray-900 hover:bg-gray-100 font-bold uppercase text-xs tracking-wide"
                          size="lg"
                        >
                          Reject Optional
                        </Button>
                        <Button
                          onClick={handleOpenPreferences}
                          variant="ghost"
                          className="font-bold uppercase text-xs tracking-wide"
                          size="lg"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                    </div>

                    {/* Close button (mobile) */}
                    <button
                      onClick={handleRejectOptional}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 sm:hidden"
                      aria-label="Close cookie banner"
                    >
                      <X className="h-5 w-5" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Cookie Preferences</DialogTitle>
            <DialogDescription className="text-base">
              Manage your cookie settings. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">Necessary Cookies</h4>
                  <span className="text-xs font-semibold text-white bg-black px-2 py-0.5 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are essential for the website to function properly. They enable core
                  functionality such as security, network management, and accessibility. You cannot
                  opt out of these cookies.
                </p>
              </div>
              <Switch checked={true} disabled className="mt-1" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">
                  These cookies help us understand how visitors interact with our website by collecting
                  and reporting information anonymously. This helps us improve our website and services.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
                className="mt-1"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">
                  These cookies are used to track visitors across websites. The intention is to display
                  ads that are relevant and engaging for the individual user.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
                className="mt-1"
              />
            </div>

            {/* Preference Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Preference Cookies</h4>
                <p className="text-sm text-gray-600">
                  These cookies enable the website to remember choices you make (such as your user name,
                  language, or the region you are in) and provide enhanced, more personal features.
                </p>
              </div>
              <Switch
                checked={preferences.preferences}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, preferences: checked })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleSavePreferences}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-bold uppercase text-xs tracking-wide"
              size="lg"
            >
              Save Preferences
            </Button>
            <Button
              onClick={() => {
                setPreferences({
                  necessary: true,
                  analytics: true,
                  marketing: true,
                  preferences: true,
                });
              }}
              variant="outline"
              className="flex-1 border-2 border-gray-900 hover:bg-gray-100 font-bold uppercase text-xs tracking-wide"
              size="lg"
            >
              Accept All
            </Button>
          </div>

          {/* Legal Links */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            By using our website, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-gray-900">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" className="underline hover:text-gray-900">
              Terms of Service
            </a>
            .
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
