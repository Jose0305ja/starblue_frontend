export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className={`${s} border-2 border-sb-border2 border-t-sb-blue-lt rounded-full animate-spin`} />
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-sb-bg">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sb-muted text-sm">Cargando...</p>
    </div>
  </div>
)
