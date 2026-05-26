import TicketCard from './TicketCard';
import { STATUSES, STATUS_LABELS } from '../utils';

export default function Board({ tickets, onMove, onDelete }) {
  const grouped = {};
  STATUSES.forEach(s => { grouped[s] = []; });
  tickets.forEach(t => {
    if (grouped[t.status]) grouped[t.status].push(t);
  });

  return (
    <div className="board">
      {STATUSES.map(status => (
        <div className="board-column" key={status}>
          <div className={`column-header ${status}`}>
            <h2>{STATUS_LABELS[status]}</h2>
            <span className="column-count">{grouped[status].length}</span>
          </div>
          {grouped[status].length === 0 ? (
            <div className="empty-column">No tickets</div>
          ) : (
            grouped[status].map(ticket => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
}
