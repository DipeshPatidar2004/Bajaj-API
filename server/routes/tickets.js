const express = require('express');
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');

const router = express.Router();

const createValidation = [
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('customerEmail')
    .notEmpty().withMessage('Customer email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be one of: low, medium, high, urgent')
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ error: messages.join('. ') });
  }
  next();
}

router.post('/', createValidation, handleValidationErrors, async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    const result = Ticket.addDerivedFields(ticket);
    res.status(201).json(result);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(req.query.status)) {
        return res.status(400).json({ error: 'Invalid status filter. Must be one of: open, in_progress, resolved, closed' });
      }
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(req.query.priority)) {
        return res.status(400).json({ error: 'Invalid priority filter. Must be one of: low, medium, high, urgent' });
      }
      filter.priority = req.query.priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let results = tickets.map(t => Ticket.addDerivedFields(t));

    if (req.query.breached === 'true') {
      results = results.filter(t => t.slaBreached === true);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    const enriched = tickets.map(t => Ticket.addDerivedFields(t));

    const stats = {
      byStatus: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      breachedOpen: 0
    };

    enriched.forEach(t => {
      stats.byStatus[t.status]++;
      stats.byPriority[t.priority]++;
      if (t.slaBreached && (t.status === 'open' || t.status === 'in_progress')) {
        stats.breachedOpen++;
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { status, subject, description, customerEmail, priority } = req.body;

    if (status && status !== ticket.status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: open, in_progress, resolved, closed' });
      }

      if (!Ticket.isValidTransition(ticket.status, status)) {
        return res.status(400).json({
          error: `Invalid status transition from '${ticket.status}' to '${status}'. Allowed transitions from '${ticket.status}': ${Ticket.ALLOWED_TRANSITIONS[ticket.status].join(', ')}`
        });
      }

      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      }

      if (ticket.status === 'resolved' && status !== 'closed') {
        ticket.resolvedAt = null;
      }

      ticket.status = status;
    }

    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (customerEmail !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
      ticket.customerEmail = customerEmail;
    }
    if (priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: 'Priority must be one of: low, medium, high, urgent' });
      }
      ticket.priority = priority;
    }

    await ticket.save();
    const result = Ticket.addDerivedFields(ticket);
    res.json(result);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
