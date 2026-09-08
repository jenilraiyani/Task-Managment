const EmptyState = ({ icon = 'bi-inbox', title, description, action }) => (
  <div className="card empty-state-card animate-enter">
    <div className="empty-state-icon">
      <i className={`bi ${icon}`}></i>
    </div>
    <h5 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h5>
    <p className="text-muted mb-0 mx-auto" style={{ maxWidth: '32ch' }}>{description}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default EmptyState;
