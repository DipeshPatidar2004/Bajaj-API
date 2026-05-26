const mongoose = require('mongoose');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved']
};

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: VALID_PRIORITIES,
      message: 'Priority must be one of: low, medium, high, urgent'
    }
  },
  status: {
    type: String,
    enum: {
      values: VALID_STATUSES,
      message: 'Status must be one of: open, in_progress, resolved, closed'
    },
    default: 'open'
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

function computeDerivedFields(ticket) {
  const now = new Date();
  const createdAt = new Date(ticket.createdAt);

  let endTime = now;
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt) {
    endTime = new Date(ticket.resolvedAt);
  }
  const ageMinutes = Math.floor((endTime - createdAt) / 60000);

  const targetMinutes = SLA_TARGETS[ticket.priority];
  let slaBreached = false;

  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    if (ticket.resolvedAt) {
      const resolveMinutes = Math.floor((new Date(ticket.resolvedAt) - createdAt) / 60000);
      slaBreached = resolveMinutes > targetMinutes;
    }
  } else {
    slaBreached = ageMinutes > targetMinutes;
  }

  return { ageMinutes, slaBreached };
}

ticketSchema.statics.addDerivedFields = function(ticketObj) {
  const plain = ticketObj.toObject ? ticketObj.toObject() : { ...ticketObj };
  const derived = computeDerivedFields(plain);
  plain.ageMinutes = derived.ageMinutes;
  plain.slaBreached = derived.slaBreached;
  return plain;
};

ticketSchema.statics.isValidTransition = function(from, to) {
  if (from === to) return true;
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed && allowed.includes(to);
};

ticketSchema.statics.ALLOWED_TRANSITIONS = ALLOWED_TRANSITIONS;
ticketSchema.statics.SLA_TARGETS = SLA_TARGETS;

module.exports = mongoose.model('Ticket', ticketSchema);
