const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String, // Format: "10:00 AM - 10:30 AM"
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    symptoms: {
      type: String,
      default: '',
    },
    consultationType: {
      type: String,
      enum: ['in-clinic', 'video'],
      default: 'in-clinic',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cash'],
      default: 'cash',
    },
    amount: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to facilitate fast slot collision lookup
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
