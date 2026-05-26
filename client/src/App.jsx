import { useState, useEffect, useCallback } from 'react';
import { getTickets, getStats, createTicket, updateTicket, deleteTicket } from './api';
import Board from './components/Board';
import StatsStrip from './components/StatsStrip';
import Filters from './components/Filters';
import CreateTicketModal from './components/CreateTicketModal';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [filterPriority, setFilterPriority] = useState('');
  const [filterBreached, setFilterBreached] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setError('');
      const filters = {};
      if (filterPriority) filters.priority = filterPriority;
      if (filterBreached) filters.breached = true;
      const data = await getTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  }, [filterPriority, filterBreached]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTickets(), fetchStats()]);
    setLoading(false);
  }, [fetchTickets, fetchStats]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(formData) {
    const newTicket = await createTicket(formData);
    await Promise.all([fetchTickets(), fetchStats()]);
    return newTicket;
  }

  async function handleMove(ticketId, newStatus) {
    try {
      setError('');
      await updateTicket(ticketId, { status: newStatus });
      await Promise.all([fetchTickets(), fetchStats()]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(ticketId) {
    try {
      setError('');
      await deleteTicket(ticketId);
      await Promise.all([fetchTickets(), fetchStats()]);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <header className="app-header">
        <h1>Desk<span>Flow</span></h1>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)}>+ New Ticket</button>
        </div>
      </header>

      <StatsStrip stats={stats} />
      <Filters
        priority={filterPriority}
        onPriorityChange={setFilterPriority}
        breached={filterBreached}
        onBreachedChange={setFilterBreached}
      />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-msg">Loading tickets...</div>
      ) : (
        <Board tickets={tickets} onMove={handleMove} onDelete={handleDelete} />
      )}

      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreate}
        />
      )}
    </div>
  );
}
