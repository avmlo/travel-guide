import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieBanner } from "./components/CookieBanner";
import Home from "./pages/Home";
import DestinationDetail from "./pages/DestinationDetail";
import SavedPlaces from "./pages/SavedPlaces";
import CityPage from "./pages/CityPage";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Discovery from "./pages/Discovery";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/discover" component={Discovery} />
      <Route path="/auth/login" component={Login} />
      <Route path="/destination/:slug" component={DestinationDetail} />
      <Route path="/city/:city" component={CityPage} />
      <Route path="/saved" component={SavedPlaces} />
      <Route path="/preferences" component={Account} />
      <Route path="/account" component={Account} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
