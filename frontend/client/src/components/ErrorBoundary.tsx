import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <pre className="bg-gray-100 p-4 rounded max-w-2xl overflow-auto">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}