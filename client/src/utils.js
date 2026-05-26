export function formatAge(minutes) {
  if (minutes < 0) minutes = 0;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h`;
}

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export const TRANSITIONS = {
  open: { forward: 'in_progress', backward: null },
  in_progress: { forward: 'resolved', backward: 'open' },
  resolved: { forward: 'closed', backward: 'in_progress' },
  closed: { forward: null, backward: 'resolved' }
};
