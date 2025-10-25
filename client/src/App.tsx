import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";

// Eager load critical pages
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy load secondary pages
const Destination = lazy(() => import("./pages/Destination"));
const SavedPlaces = lazy(() => import("./pages/SavedPlaces"));
const CityPage = lazy(() => import("./pages/CityPage"));
const Cities = lazy(() => import("./pages/Cities"));
const City = lazy(() => import("./pages/City"));
const Account = lazy(() => import("./pages/Account"));
const Profile = lazy(() => import("./pages/Profile"));
const Stats = lazy(() => import("./pages/Stats"));
const Lists = lazy(() => import("./pages/Lists"));
const ListDetail = lazy(() => import("./pages/ListDetail"));
const Feed = lazy(() => import("./pages/Feed"));
const Explore = lazy(() => import("./pages/Explore"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Brand = lazy(() => import("./pages/Brand"));
const Designer = lazy(() => import("./pages/Designer"));
const DestinationShowcase = lazy(() => import("./pages/DestinationShowcase"));
const Editorial = lazy(() => import("./pages/Editorial"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path="/auth/login" component={Login} />
        <Route path="/destination/:slug" component={Destination} />
        <Route path="/cities" component={Cities} />
        <Route path="/city/:city" component={City} />
        <Route path="/saved" component={SavedPlaces} />
        <Route path="/preferences" component={Account} />
        <Route path="/account" component={Account} />
        <Route path="/stats" component={Stats} />
        <Route path="/user/:username" component={Profile} />
        <Route path="/lists" component={Lists} />
        <Route path="/lists/:id" component={ListDetail} />
        <Route path="/feed" component={Feed} />
        <Route path="/explore" component={Explore} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/brand" component={Brand} />
        <Route path="/designer" component={Designer} />
        <Route path="/showcase" component={DestinationShowcase} />
        <Route path="/editorial" component={Editorial} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

