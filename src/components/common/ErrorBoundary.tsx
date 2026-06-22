import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    private handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    private handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-svh items-center justify-center px-4">
                    <div className="flex max-w-md flex-col items-center text-center">
                        <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
                            <AlertCircle className="size-6" />
                        </div>
                        <h1 className="mt-4 text-xl font-bold tracking-tight">
                            Something went wrong
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                            An unexpected error occurred. Please try again or reload the page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="bg-muted mt-4 max-w-full overflow-auto rounded-lg p-3 text-left text-xs">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="mt-6 flex gap-3">
                            <Button variant="outline" onClick={this.handleReset}>
                                Try again
                            </Button>
                            <Button onClick={this.handleReload}>
                                <RefreshCw className="size-4" />
                                Reload page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
