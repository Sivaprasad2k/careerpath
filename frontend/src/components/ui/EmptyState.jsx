export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-darkCard/40 border border-dashed border-darkBorder rounded-2xl p-8">
      {Icon && (
        <div className="p-4 bg-brand-500/10 text-brand-400 rounded-2xl mb-4 border border-brand-500/10 shadow-inner">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-base font-extrabold text-white mb-2">{title}</h3>
      {description && <p className="text-xs text-gray-400 mb-6 max-w-md leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

