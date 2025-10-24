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
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Privacy from "./pages/Privacy";
import Brand from "./pages/Brand";
import Designer from "./pages/Designer";
import DestinationShowcase from "./pages/DestinationShowcase";
import Editorial from "./pages/Editorial";
import Analytics from "./pages/Analytics";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import CreateTripWithAI from "./pages/CreateTripWithAI";

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
      <Route path="/lists" component={Lists} />
      <Route path="/list/:id" component={ListDetail} />
      <Route path="/feed" component={Feed} />
      <Route path="/explore" component={Explore} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/brand/:slug" component={Brand} />
      <Route path="/designer/:slug" component={Designer} />
      <Route path="/showcase/:slug" component={DestinationShowcase} />
      <Route path="/editorial" component={Editorial} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/trips" component={Trips} />
      <Route path="/trip/:id" component={TripDetail} />
      <Route path="/trips/create-with-ai" component={CreateTripWithAI} />
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
        switchable
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
