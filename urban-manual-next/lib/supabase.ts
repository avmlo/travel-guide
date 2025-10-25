import { createClient, SupabaseClient } from '@supabase/supabase-js';

const missingEnvMessage = 'Supabase environment variables are not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

let cachedClient: SupabaseClient | null = null;
let stubClient: SupabaseClient | null = null;
let configurationError: Error | null = null;

function createThrowingProxy(error: Error): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === '__esModule') return false;
      if (prop === 'then') return undefined;
      if (prop === 'toString') {
        return () => '[SupabaseClientStub]';
      }
      return createThrowingProxy(error);
    },
    apply() {
      throw error;
    },
  };

  return new Proxy(() => {
    throw error;
  }, handler);
}

function getOrCreateStub(): SupabaseClient {
  if (!stubClient) {
    const error = configurationError ?? new Error(missingEnvMessage);
    configurationError = error;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(missingEnvMessage);
    }

    stubClient = createThrowingProxy(error) as SupabaseClient;
  }

  return stubClient;
}

function createSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    configurationError = new Error(missingEnvMessage);
    return getOrCreateStub();
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return cachedClient;
}

export function getSupabaseClient(): SupabaseClient {
  return createSupabaseClient();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseEnvError(): Error {
  return configurationError ?? new Error(missingEnvMessage);
}
