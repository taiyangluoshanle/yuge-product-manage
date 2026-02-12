"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          页面出错了
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {this.state.error?.message || "发生了未知错误，请尝试刷新页面"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="btn-secondary gap-1.5 text-sm"
            aria-label="重试"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
          <button
            onClick={this.handleReload}
            className="btn-primary gap-1.5 text-sm"
            aria-label="刷新页面"
          >
            <RefreshCw className="h-4 w-4" />
            刷新页面
          </button>
        </div>
      </div>
    );
  }
}

export { ErrorBoundary };
