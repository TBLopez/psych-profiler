import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
          <div className="max-w-[420px] w-full text-center">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-danger text-xl">!</span>
            </div>
            <h2 className="text-lg font-medium text-ink mb-2">Something went wrong</h2>
            <p className="text-sm text-ink-secondary mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Reload page
            </button>
            {this.props.showDetails && this.state.errorInfo && (
              <pre className="mt-4 text-left text-[10px] text-ink-muted bg-surface-raised rounded-lg p-3 overflow-auto max-h-[200px]">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
