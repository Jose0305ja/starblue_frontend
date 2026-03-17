interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export const EmptyState = ({ icon = '🔍', title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-sb-text font-syne font-700 text-xl mb-2">{title}</h3>
    {description && <p className="text-sb-muted text-sm max-w-sm mb-6">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="btn-primary px-6 py-2.5">
        {action.label}
      </button>
    )}
  </div>
)
