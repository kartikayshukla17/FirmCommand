import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="bg-red-500 p-4">
                            <h1 className="text-white text-xl font-bold">Something went wrong</h1>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">The application encountered a critical error and could not render.</p>
                            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64 mb-4">
                                <code className="text-red-600 font-mono text-sm">
                                    {this.state.error && this.state.error.toString()}
                                </code>
                            </div>
                            <details className="text-sm text-gray-500 cursor-pointer">
                                <summary>Component Stack</summary>
                                <div className="mt-2 p-2 bg-gray-50 rounded font-mono text-xs whitespace-pre-wrap">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </div>
                            </details>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
