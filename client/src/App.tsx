import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Watchlist from "./pages/Watchlist";
import Alerts from "./pages/Alerts";
import Admin from "./pages/Admin";
import AgenticSearch from "./pages/AgenticSearch";
import Map from "./pages/Map";
import SavedSearches from "./pages/SavedSearches";
import Deals from "./pages/Deals";
import Analytics from "./pages/Analytics";
import FinancialCalculator from "./pages/FinancialCalculator";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/admin" component={Admin} />
      <Route path={"/agentic-search"} component={AgenticSearch} />
      <Route path={"/map"} component={Map} />
      <Route path={"/saved-searches"} component={SavedSearches} />
      <Route path={"/deals"} component={Deals} />
      <Route path={"/analytics"} component={Analytics} />     <Route path="/calculator" component={FinancialCalculator} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
