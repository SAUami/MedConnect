const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require admin role
router.use(verifyToken, authorizeRoles('admin'));

// GET PLATFORM ANALYTICS / STATS
router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const totalPrescriptions = await Prescription.countDocuments();

    res.status(200).json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      confirmedAppointments,
      cancelledAppointments,
      totalPrescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
});

// GET ALL DOCTORS (Admin Management)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctors', error: error.message });
  }
});

// TOGGLE DOCTOR APPROVAL STATUS
router.patch('/doctors/:id/approval', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = !doctor.isApproved;
    await doctor.save();

    res.status(200).json({
      message: `Doctor status updated to ${doctor.isApproved ? 'Approved' : 'Suspended'}`,
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating doctor status', error: error.message });
  }
});

// GET ALL SYSTEM USERS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

// GET ALL APPOINTMENTS
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching appointments', error: error.message });
  }
});

module.exports = router;
