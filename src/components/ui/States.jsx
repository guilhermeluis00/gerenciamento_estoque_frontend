/** Estado vazio com ícone, texto e ação opcional. */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-icon"><Icon size={26} /></div>}
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/** Placeholder animado enquanto a lista carrega. */
export function SkeletonList({ rows = 4 }) {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton" style={{ width: `${40 + ((i * 17) % 35)}%` }} />
          <span className="skeleton" style={{ width: '18%' }} />
        </div>
      ))}
    </div>
  );
}
