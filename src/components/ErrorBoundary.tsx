'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-primary">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
            <p className="text-secondary">{this.state.error?.message}</p>
            <details className="text-left text-xs text-secondary bg-secondary/20 p-4 rounded border border-primary">
              <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
              <pre className="overflow-auto">{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
