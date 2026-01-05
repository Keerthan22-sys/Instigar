import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Login form - MUST be called before any conditional returns
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form - MUST be called before any conditional returns
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // If user is already logged in, redirect to homepage
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Don't render if user is logged in (will redirect)
  // This must come AFTER all hooks are called
  if (user) {
    return null;
  }
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    setAuthError(null);
    loginMutation.mutate(values, {
      onError: (error) => {
        setAuthError(error.message || "Failed to log in");
      }
    });
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    setAuthError(null);
    registerMutation.mutate(
      { username: values.username, password: values.password },
      {
        onError: (error) => {
          setAuthError(error.message || "Failed to register");
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Instigar - Login or Register</title>
        <meta name="description" content="Login or create an account to access the Instigar leads management platform" />
      </Helmet>
      
      <div className="flex min-h-screen w-full">
        {/* Left side - Auth form */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 p-4 md:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#0866FF] mb-2">Instigar</h1>
              <p className="text-[#606770]">Leads Management Platform</p>
            </div>
            
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#0866FF] hover:bg-[#0866FF]/90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("register")}
                      className="text-sm text-[#606770]"
                    >
                      Don't have an account? Register here
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Register to start managing your leads efficiently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#0866FF] hover:bg-[#0866FF]/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating account..." : "Register"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("login")}
                      className="text-sm text-[#606770]"
                    >
                      Already have an account? Login here
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right side - Hero section */}
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-tr from-blue-600 to-blue-400 text-white p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">Manage your leads with ease</h2>
            <p className="text-xl mb-8">
              Instigar helps you track, manage, and convert leads efficiently with powerful tools and insightful analytics.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-white bg-opacity-20 rounded-full mr-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Centralized Lead Management</h3>
                  <p>Keep all your leads in one place for better organization</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-white bg-opacity-20 rounded-full mr-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Insightful Analytics</h3>
                  <p>Track conversion rates and performance metrics</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 bg-white bg-opacity-20 rounded-full mr-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Time-Saving Automation</h3>
                  <p>Automate repetitive tasks and focus on closing deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}