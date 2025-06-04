import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-800 p-8">
          <h2 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p className="text-lg text-center mb-6">
            We're sorry, but there was an unexpected error. Please try refreshing the page.
          </p>
          {/* For debugging in development, you can show details */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 p-4 bg-red-200 rounded-md text-red-900 text-sm">
              <summary className="font-semibold cursor-pointer">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;