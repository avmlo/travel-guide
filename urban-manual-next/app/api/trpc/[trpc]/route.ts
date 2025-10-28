import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { router } from '@/lib/trpc/server';
import { placesRouter } from '@/server/routers/placesRouter';

// App router with places enrichment
const appRouter = router({
  places: placesRouter,
});

export type AppRouter = typeof appRouter;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
