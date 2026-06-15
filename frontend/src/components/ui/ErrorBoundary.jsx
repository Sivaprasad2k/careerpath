import React from 'react'
import { ShieldAlertIcon } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-darkBg text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="card max-w-md bg-darkCard border border-darkBorder p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="p-4 bg-red-950/20 text-red-500 rounded-full">
              <ShieldAlertIcon size={36} />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase">Something went wrong</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              An unexpected client-side exception crashed the component tree view. You can safely attempt a hard reload or go back home.
            </p>
            {this.state.error && (
              <pre className="w-full text-left p-3.5 bg-darkBg border border-darkBorder/40 rounded-lg text-[10px] text-red-400 font-mono overflow-auto max-h-40 leading-normal">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 justify-center py-2"
              >
                Reload Window
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="btn-secondary flex-1 justify-center py-2"
              >
                Go Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
