import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to the console only. There is no remote reporting in this app,
    // because no student data should leave the device.
    console.error("Unhandled application error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" role="alert">
          <h1 className="page-title">Something went wrong</h1>
          <p>
            The application encountered an unexpected error. Your saved progress
            is not affected — it is stored in this browser.
          </p>
          <pre style={{ whiteSpace: "pre-wrap", color: "var(--color-error)" }}>
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
          <button
            type="button"
            className="btn btn--primary"
            onClick={this.handleReload}
          >
            Reload the application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
