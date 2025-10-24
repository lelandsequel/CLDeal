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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/admin" component={Admin} />
      <Route path="/agentic-search" component={AgenticSearch} />
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
