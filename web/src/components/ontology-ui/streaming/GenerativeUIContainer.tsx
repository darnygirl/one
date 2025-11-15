/**
 * GenerativeUIContainer Component
 * Container for generative UI components with error boundaries and sandboxing
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerativeUIContainerProps {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  loadingMessage?: string;
  sandbox?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface GenerativeUIContainerState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  GenerativeUIContainerProps,
  GenerativeUIContainerState
> {
  constructor(props: GenerativeUIContainerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GenerativeUI Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn('p-4', this.props.className)}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rendering Error</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">
                {this.state.error?.message || 'Failed to render generative UI'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    return (
      <GenerativeUIContent
        {...this.props}
        onError={undefined} // Don't pass down to avoid recursion
      />
    );
  }
}

function GenerativeUIContent({
  children,
  className,
  loading = false,
  loadingMessage = 'Generating UI...',
  sandbox = true,
}: Omit<GenerativeUIContainerProps, 'onError'>) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex items-center justify-center p-8 rounded-lg border bg-muted/50',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </motion.div>
    );
  }

  const containerClass = cn(
    'generative-ui-container rounded-lg border bg-card',
    sandbox && 'isolate overflow-hidden',
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={containerClass}
    >
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}

export function GenerativeUIContainer(props: GenerativeUIContainerProps) {
  return <ErrorBoundary {...props} />;
}
