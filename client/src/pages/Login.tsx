import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLocation("/account");
      }
    }
    checkUser();
  }, [setLocation]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setLocation("/account");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto">
          <button 
            onClick={() => setLocation("/")}
            className="text-[clamp(32px,6vw,72px)] font-bold uppercase leading-none tracking-tight hover:opacity-60 transition-opacity"
          >
            The Urban Manual
          </button>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold uppercase mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-sm text-gray-600">
              {isSignUp
                ? "Sign up to save your favorite destinations"
                : "Access your saved places and travel history"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 bg-black text-white hover:bg-gray-800 text-xs font-bold uppercase"
            >
              {loading ? "Loading..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  disabled={loading}
                  className="h-12 bg-[#efefef] border-none"
                />
              </div>

              <div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={loading}
                  minLength={6}
                  className="h-12 bg-[#efefef] border-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 border-2 border-black bg-white text-black hover:bg-black hover:text-white text-xs font-bold uppercase"
                disabled={loading}
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-xs font-bold uppercase hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setLocation("/")}
              className="text-xs font-bold uppercase hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

