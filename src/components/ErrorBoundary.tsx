import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Uncaught Error in Azhai App]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF8] text-[#110B0E] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#DFBF77] shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#701626]/10 text-[#701626] flex items-center justify-center mx-auto border border-[#C5A059]/40">
              <span className="font-serif text-2xl font-bold">🪷</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                Azhai Atelier
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#110B0E]">
                Our Boutique is Refreshing
              </h2>
              <p className="text-xs text-[#6D6268] leading-relaxed">
                An unexpected stitch occurred while rendering this page. Our team has been notified.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh View</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F7F4EE] hover:bg-[#DFBF77]/20 border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
