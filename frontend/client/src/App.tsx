import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LeadsCenter from "@/pages/leads-center";
import WalkinsCenter from "@/pages/walkins-center";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={LeadsCenter} />
      <ProtectedRoute path="/walkins" component={WalkinsCenter} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <WouterRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
