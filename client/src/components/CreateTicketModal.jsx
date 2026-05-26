import { useState } from 'react';

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.customerEmail.trim()) {
      errs.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errs.customerEmail = 'Invalid email format';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await onCreated(form);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Create New Ticket</h2>
        {apiError && <div className="error-banner" style={{ marginBottom: 12, borderRadius: 5 }}>{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              className={errors.subject ? 'error' : ''}
              value={form.subject}
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="Brief summary of the issue"
            />
            {errors.subject && <div className="field-error">{errors.subject}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={errors.description ? 'error' : ''}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Detailed description of the problem"
            />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              id="customerEmail"
              type="email"
              className={errors.customerEmail ? 'error' : ''}
              value={form.customerEmail}
              onChange={e => handleChange('customerEmail', e.target.value)}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && <div className="field-error">{errors.customerEmail}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
