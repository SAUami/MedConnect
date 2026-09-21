const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    default: '1 Tablet',
  },
  frequency: {
    type: String,
    default: 'Twice a day (After meals)',
  },
  duration: {
    type: String,
    default: '5 days',
  },
  instructions: {
    type: String,
    default: '',
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
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
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    chiefComplaint: {
      type: String,
      default: '',
    },
    vitals: {
      bp: { type: String, default: '' },
      temp: { type: String, default: '' },
      pulse: { type: String, default: '' },
      weight: { type: String, default: '' },
    },
    medicines: [medicineSchema],
    instructions: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
