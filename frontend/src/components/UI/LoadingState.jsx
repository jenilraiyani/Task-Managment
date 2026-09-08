const LoadingState = ({ label = 'Loading...' }) => (
  <div className="loading-wrap">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">{label}</span>
    </div>
    <p className="text-muted small mb-0">{label}</p>
  </div>
);

export default LoadingState;
