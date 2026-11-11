import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void };

export default class ModelErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
