import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Destination from "./pages/Destination";
import SavedPlaces from "./pages/SavedPlaces";
import CityPage from "./pages/CityPage";
import Cities from "./pages/Cities";
import City from "./pages/City";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Profile from "./pages/Profile";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/auth/login" component={Login} />
      <Route path="/destination/:slug" component={Destination} />
      <Route path="/cities" component={Cities} />
      <Route path="/city/:city" component={City} />
      <Route path="/saved" component={SavedPlaces} />
      <Route path="/preferences" component={Account} />
      <Route path="/account" component={Account} />
      <Route path="/user/:username" component={Profile} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
