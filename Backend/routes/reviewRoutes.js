const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// ADD REVIEW (Patient)
router.post('/', verifyToken, authorizeRoles('patient'), async (req, res) => {
  try {
    const { doctorId, rating, comment, appointmentId } = req.body;

    if (!doctorId || !rating) {
      return res.status(400).json({ message: 'Doctor ID and rating are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const review = new Review({
      doctor: doctorId,
      patient: req.user._id,
      appointment: appointmentId || undefined,
      rating: Number(rating),
      comment: comment || '',
    });

    await review.save();

    // Re-calculate average rating for this doctor
    const allReviews = await Review.find({ doctor: doctorId });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    doctor.rating = Number(avgRating.toFixed(1));
    doctor.totalReviews = allReviews.length;
    await doctor.save();

    const populatedReview = await Review.findById(review._id).populate('patient', 'name');

    res.status(201).json({
      message: 'Review submitted successfully',
      review: populatedReview,
      updatedRating: doctor.rating,
      totalReviews: doctor.totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding review', error: error.message });
  }
});

// GET REVIEWS FOR A DOCTOR
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reviews', error: error.message });
  }
});

module.exports = router;
