import { formatAge, TRANSITIONS, STATUS_LABELS } from '../utils';

export default function TicketCard({ ticket, onMove, onDelete }) {
  const trans = TRANSITIONS[ticket.status];

  return (
    <div className={`ticket-card${ticket.slaBreached ? ' sla-breached' : ''}`}>
      <div className="ticket-subject">{ticket.subject}</div>
      <div className="ticket-meta">
        <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
        <span className="ticket-age">{formatAge(ticket.ageMinutes)}</span>
        {ticket.slaBreached && <span className="sla-indicator">SLA Breached</span>}
      </div>
      <div className="ticket-email">{ticket.customerEmail}</div>
      <div className="ticket-actions">
        {trans.backward && (
          <button onClick={() => onMove(ticket._id, trans.backward)}>
            ← {STATUS_LABELS[trans.backward]}
          </button>
        )}
        {trans.forward && (
          <button onClick={() => onMove(ticket._id, trans.forward)}>
            {STATUS_LABELS[trans.forward]} →
          </button>
        )}
        <button className="btn-delete" onClick={() => onDelete(ticket._id)} title="Delete ticket">
          ✕
        </button>
      </div>
    </div>
  );
}
