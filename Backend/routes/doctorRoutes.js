const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// GET all specializations available
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialization');
    res.status(200).json(specialties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET logged-in doctor profile
router.get('/profile/me', verifyToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE logged-in doctor profile
router.put('/profile/me', verifyToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const { specialization, fees, experience, qualifications, about, clinicAddress, availability } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      // create if not exists
      doctor = new Doctor({
        user: req.user._id,
        specialization: specialization || 'General Physician',
        fees: fees || 500,
        experience: experience || 1,
        qualifications,
        about,
        clinicAddress,
        availability,
      });
    } else {
      if (specialization) doctor.specialization = specialization;
      if (fees !== undefined) doctor.fees = fees;
      if (experience !== undefined) doctor.experience = experience;
      if (qualifications) doctor.qualifications = qualifications;
      if (about !== undefined) doctor.about = about;
      if (clinicAddress !== undefined) doctor.clinicAddress = clinicAddress;
      if (availability) doctor.availability = availability;
    }

    await doctor.save();
    const populated = await Doctor.findById(doctor._id).populate('user', 'name email phone');
    res.status(200).json({ message: 'Doctor profile updated successfully', doctor: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE doctor profile (can be called by doctor or admin)
router.post('/create-profile', async (req, res) => {
  try {
    const { userId, specialization, fees, experience, qualifications, about, clinicAddress, availability } = req.body;

    // Check user exists and is a doctor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'doctor') {
      return res.status(400).json({ message: 'User role must be doctor' });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }

    const newDoctor = new Doctor({
      user: userId,
      specialization: specialization || 'General Physician',
      fees: fees || 500,
      experience: experience || 1,
      qualifications: qualifications || 'MBBS',
      about: about || '',
      clinicAddress: clinicAddress || 'MedConnect Clinic',
      availability: availability || [
        { day: 'Monday', slots: ['10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'] },
        { day: 'Tuesday', slots: ['10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'] },
        { day: 'Wednesday', slots: ['10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'] },
        { day: 'Thursday', slots: ['10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'] },
        { day: 'Friday', slots: ['10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'] },
      ],
    });

    await newDoctor.save();
    res.status(201).json({ message: 'Doctor profile created successfully', doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all doctors (with search, filter by specialization, max fees, etc.)
router.get('/', async (req, res) => {
  try {
    const { specialization, search, maxFees } = req.query;
    let filter = { isApproved: true };

    if (specialization && specialization !== 'All') {
      let specPattern = specialization;
      if (/cardio/i.test(specialization)) specPattern = 'Cardio';
      else if (/derma/i.test(specialization)) specPattern = 'Derma';
      else if (/pediat/i.test(specialization)) specPattern = 'Pediat';
      else if (/ortho/i.test(specialization)) specPattern = 'Ortho';
      else if (/neuro/i.test(specialization)) specPattern = 'Neuro';
      else if (/gynec|gynaec/i.test(specialization)) specPattern = 'Gynec|Gynaec';
      else if (/dent/i.test(specialization)) specPattern = 'Dent';
      else if (/psych/i.test(specialization)) specPattern = 'Psych';
      else if (/oncol/i.test(specialization)) specPattern = 'Oncol';
      else if (/physician|general/i.test(specialization)) specPattern = 'General|Physician';
      else if (/gastro/i.test(specialization)) specPattern = 'Gastro';
      else if (/pulmon|chest/i.test(specialization)) specPattern = 'Pulmon|Chest';
      else if (/ophthalm|eye/i.test(specialization)) specPattern = 'Ophthalm|Eye';
      else if (/ent|otolaryng/i.test(specialization)) specPattern = 'ENT|Otolaryng';

      filter.specialization = { $regex: specPattern, $options: 'i' };
    }

    if (maxFees) {
      filter.fees = { $lte: Number(maxFees) };
    }

    let doctors = await Doctor.find(filter)
      .populate('user', 'name email phone')
      .sort({ isOnline: -1, rating: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter((doc) => {
        const docName = doc.user ? doc.user.name : '';
        const specialty = doc.specialization || '';
        return searchRegex.test(docName) || searchRegex.test(specialty);
      });
    }

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;