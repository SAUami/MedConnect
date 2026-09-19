const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    qualifications: {
      type: String,
      default: 'MBBS, MD',
    },
    about: {
      type: String,
      default: '',
    },
    clinicAddress: {
      type: String,
      default: 'MedConnect Care Clinic, Central Avenue',
    },
    availability: [
      {
        day: {
          type: String, // e.g. "Monday", "Tuesday"
          required: true,
        },
        slots: [
          {
            type: String, // e.g. "09:00 AM - 09:30 AM"
          },
        ],
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);