export default function StatsStrip({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-strip">
      <div className="stat-item">
        <span>Open:</span>
        <span className="stat-value">{stats.byStatus.open}</span>
      </div>
      <div className="stat-item">
        <span>In Progress:</span>
        <span className="stat-value">{stats.byStatus.in_progress}</span>
      </div>
      <div className="stat-item">
        <span>Resolved:</span>
        <span className="stat-value">{stats.byStatus.resolved}</span>
      </div>
      <div className="stat-item">
        <span>Closed:</span>
        <span className="stat-value">{stats.byStatus.closed}</span>
      </div>
      <div className={`stat-item${stats.breachedOpen > 0 ? ' breached' : ''}`}>
        <span>SLA Breached (Open):</span>
        <span className="stat-value">{stats.breachedOpen}</span>
      </div>
    </div>
  );
}
