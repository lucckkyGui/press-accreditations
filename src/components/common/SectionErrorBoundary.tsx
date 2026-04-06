import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class SectionErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Silent in production - no console.log
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm font-medium text-destructive mb-1">
            {this.props.fallbackTitle || "Wystąpił błąd w tej sekcji"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {this.state.error?.message || "Nieznany błąd"}
          </p>
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Spróbuj ponownie
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
