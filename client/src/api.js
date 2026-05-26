const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export function getTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.breached) params.set('breached', 'true');
  const qs = params.toString();
  return request(`/tickets${qs ? '?' + qs : ''}`);
}

export function getStats() {
  return request('/tickets/stats');
}

export function createTicket(ticketData) {
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData)
  });
}

export function updateTicket(id, updates) {
  return request(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export function deleteTicket(id) {
  return request(`/tickets/${id}`, {
    method: 'DELETE'
  });
}
