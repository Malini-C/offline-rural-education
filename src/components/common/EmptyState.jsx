export default function EmptyState({ title, description, action = null }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {action}
    </div>
  );
}
