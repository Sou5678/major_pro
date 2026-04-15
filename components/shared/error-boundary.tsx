"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? "Something went wrong." };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-danger/20 bg-danger/5 p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-danger" />
          <div>
            <p className="font-medium text-text-primary">Something went wrong</p>
            <p className="mt-1 text-sm text-text-secondary">{this.state.message}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={this.handleReset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
