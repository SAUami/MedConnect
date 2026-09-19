const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// CREATE PRESCRIPTION (Doctor)
router.post('/create', verifyToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, instructions, followUpDate } = req.body;

    if (!appointmentId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Appointment ID, diagnosis, and at least one medicine are required.' });
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify current doctor owns this appointment
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to prescribe for this appointment' });
    }

    // Check if prescription already exists for this appointment
    let prescription = await Prescription.findOne({ appointment: appointmentId });
    if (prescription) {
      prescription.diagnosis = diagnosis;
      prescription.medicines = medicines;
      prescription.instructions = instructions || '';
      prescription.followUpDate = followUpDate || '';
      await prescription.save();
    } else {
      prescription = new Prescription({
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: doctorProfile._id,
        diagnosis,
        medicines,
        instructions: instructions || '',
        followUpDate: followUpDate || '',
      });
      await prescription.save();
    }

    // Mark appointment status as completed
    appointment.status = 'completed';
    await appointment.save();

    const populatedRx = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phone gender age')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment');

    res.status(201).json({
      message: 'Prescription created successfully and appointment marked as completed',
      prescription: populatedRx,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating prescription', error: error.message });
  }
});

// GET LOGGED-IN PATIENT PRESCRIPTIONS
router.get('/my-prescriptions', verifyToken, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET PRESCRIPTION BY APPOINTMENT ID
router.get('/appointment/:appointmentId', verifyToken, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
      .populate('patient', 'name email phone gender age')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found for this appointment' });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET PATIENT MEDICAL HISTORY (Past Prescriptions Timeline)
router.get('/patient/:patientId', verifyToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Only patient themselves, or a doctor, or an admin can access
    const isSelf = req.user._id.toString() === patientId;
    const isDoctorOrAdmin = ['doctor', 'admin'].includes(req.user.role);

    if (!isSelf && !isDoctorOrAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view this medical record timeline' });
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
