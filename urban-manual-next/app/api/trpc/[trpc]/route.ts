import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { router } from '@/lib/trpc/server';

// Simple app router - we'll add routers progressively
const appRouter = router({});

export type AppRouter = typeof appRouter;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
