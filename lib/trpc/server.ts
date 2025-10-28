import { initTRPC } from '@trpc/server';
import { cache } from 'react';

// Create context - can be extended with auth, db, etc.
export const createContext = cache(async () => {
  return {};
});

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
