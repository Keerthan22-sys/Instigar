import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  
  // Check if user state exists but token is missing (critical auth issue)
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error('❌ CRITICAL: User state exists but token is missing!');
        console.error('❌ This indicates localStorage was cleared or token was lost');
        console.error('❌ Redirecting to login...');
        // Clear user state and redirect will happen automatically
        window.location.href = '/auth';
      }
    }
  }, [user]);
  
  console.log('🔒 ProtectedRoute:', { path, hasUser: !!user, isLoading });

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}