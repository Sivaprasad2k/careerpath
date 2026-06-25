export default function LoadingSpinner({ className = 'h-8 w-8' }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-brand-500/10 border-t-brand-500 ${className}`} />
  )
}
