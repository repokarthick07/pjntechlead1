import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold">PJN LEADFLOW Application</h1>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.error?.message || 'Application initialization error. Reloading page...'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
