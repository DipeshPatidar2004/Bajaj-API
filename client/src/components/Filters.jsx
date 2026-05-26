export default function Filters({ priority, onPriorityChange, breached, onBreachedChange }) {
  return (
    <div className="filters-bar">
      <label htmlFor="filter-priority">Priority:</label>
      <select
        id="filter-priority"
        value={priority}
        onChange={e => onPriorityChange(e.target.value)}
      >
        <option value="">All</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <label className="breach-toggle">
        <input
          type="checkbox"
          checked={breached}
          onChange={e => onBreachedChange(e.target.checked)}
        />
        SLA Breached Only
      </label>
    </div>
  );
}
