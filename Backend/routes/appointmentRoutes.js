const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// BOOK APPOINTMENT (Patient)
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, consultationType } = req.body || {};

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Doctor, date, and time slot are required' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for slot collision: same doctor, same date, same timeSlot, not cancelled
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'This time slot is already booked. Please choose another available slot.',
      });
    }

    // Generate meeting link if consultationType is video
    let meetingLink = '';
    if (consultationType === 'video') {
      const randomRoom = `MedConnect-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      meetingLink = `https://meet.jit.si/${randomRoom}`;
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      symptoms: symptoms || '',
      consultationType: consultationType || 'in-clinic',
      meetingLink,
      status: 'confirmed',
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error booking appointment', error: error.message });
  }
});

// GET BOOKED SLOTS (Used by Frontend to disable already reserved slots)
router.get('/booked-slots', async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date query parameters are required' });
    }

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    res.status(200).json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET PATIENT'S APPOINTMENTS (My Appointments)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET DOCTOR'S APPOINTMENTS (Doctor Schedule)
router.get('/doctor', verifyToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'name email phone gender age')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE APPOINTMENT STATUS (Cancel, Confirm, Complete)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Permission check:
    // Patient can cancel their own appointment
    // Doctor can update their appointments
    // Admin can update anything
    const isPatientOwner = appointment.patient.toString() === req.user._id.toString();

    let isDoctorOwner = false;
    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc && appointment.doctor.toString() === doc._id.toString()) {
        isDoctorOwner = true;
      }
    }

    const isAdmin = req.user.role === 'admin';

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone gender age')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(200).json({ message: `Appointment status updated to ${status}`, appointment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
