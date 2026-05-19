"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; errorMessage: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Beklenmeyen hata:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/chat";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-lunia-bg text-lunia-text px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-5xl select-none">⚠</div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Bir şeyler ters gitti</h1>
              <p className="text-lunia-muted text-sm">
                Beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-lunia-accent hover:bg-lunia-accentHover text-white rounded-xl text-sm font-medium transition-colors"
              >
                Sayfayı Yenile
              </button>
              <button
                onClick={this.handleHome}
                className="px-5 py-2.5 bg-lunia-sidebar border border-lunia-border hover:border-lunia-accent text-lunia-muted hover:text-lunia-text rounded-xl text-sm font-medium transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
