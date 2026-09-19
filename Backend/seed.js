const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Review = require('./models/Review');

const standardSlots = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:30 AM - 12:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '06:00 PM - 06:30 PM',
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const doctorsData = [
  {
    name: 'Dr. Rajesh Sharma',
    email: 'dr.rajesh@medconnect.com',
    password: 'doctor123',
    phone: '+91 98765 43210',
    specialization: 'Cardiologist',
    fees: 800,
    experience: 15,
    qualifications: 'MBBS, MD (Cardiology), FACC',
    about: 'Senior Consultant Cardiologist with over 15 years of experience in managing hypertension, heart failure, and preventive cardiology.',
    clinicAddress: 'Apollo Heart Clinic, Sector 18, Noida',
    rating: 4.9,
    totalReviews: 28,
  },
  {
    name: 'Dr. Priya Patel',
    email: 'dr.priya@medconnect.com',
    password: 'doctor123',
    phone: '+91 98111 22334',
    specialization: 'Dermatologist',
    fees: 600,
    experience: 9,
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    about: 'Specialist in clinical dermatology, acne treatments, hair disorders, and modern laser skincare therapy.',
    clinicAddress: 'SkinCare Wellness Center, Indiranagar, Bengaluru',
    rating: 4.8,
    totalReviews: 34,
  },
  {
    name: 'Dr. Amit Verma',
    email: 'dr.amit@medconnect.com',
    password: 'doctor123',
    phone: '+91 97234 56789',
    specialization: 'General Physician',
    fees: 400,
    experience: 11,
    qualifications: 'MBBS, DNB (Internal Medicine)',
    about: 'Experienced family physician providing comprehensive primary healthcare, seasonal viral management, and diabetic care.',
    clinicAddress: 'MedLife Family Clinic, Connaught Place, New Delhi',
    rating: 4.7,
    totalReviews: 45,
  },
  {
    name: 'Dr. Ananya Sen',
    email: 'dr.ananya@medconnect.com',
    password: 'doctor123',
    phone: '+91 99012 34567',
    specialization: 'Pediatrician',
    fees: 500,
    experience: 12,
    qualifications: 'MBBS, MD (Pediatrics)',
    about: 'Caring child specialist dedicated to infant nutrition, pediatric immunization, and adolescent healthcare.',
    clinicAddress: 'Little Steps Children Clinic, Salt Lake, Kolkata',
    rating: 4.9,
    totalReviews: 52,
  },
  {
    name: 'Dr. Vikram Malhotra',
    email: 'dr.vikram@medconnect.com',
    password: 'doctor123',
    phone: '+91 98333 44556',
    specialization: 'Orthopedic Surgeon',
    fees: 900,
    experience: 16,
    qualifications: 'MBBS, MS (Orthopedics), Fellowship Joint Replacement',
    about: 'Specialist in joint replacement, sports injury recovery, arthroscopy, and spine rehabilitation.',
    clinicAddress: 'Metro Ortho & Spine Care, Bandra West, Mumbai',
    rating: 4.9,
    totalReviews: 39,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // 1. Clear existing sample records to keep database clean
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Existing collections cleaned');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);
    const doctorPasswordHash = await bcrypt.hash('doctor123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    // 2. Create Admin
    const admin = new User({
      name: 'System Admin',
      email: 'admin@medconnect.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+91 90000 00000',
    });
    await admin.save();
    console.log('👑 Admin user created: admin@medconnect.com');

    // 3. Create Demo Patients
    const patientRahul = new User({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: defaultPasswordHash,
      role: 'patient',
      phone: '+91 98888 11111',
      gender: 'male',
      age: 28,
    });
    await patientRahul.save();

    const patientAnjali = new User({
      name: 'Anjali Gupta',
      email: 'anjali@gmail.com',
      password: defaultPasswordHash,
      role: 'patient',
      phone: '+91 97777 22222',
      gender: 'female',
      age: 25,
    });
    await patientAnjali.save();
    console.log('🧑 Demo patients created: rahul@gmail.com, anjali@gmail.com');

    // 4. Create Doctors
    const createdDoctors = [];
    for (const docData of doctorsData) {
      const user = new User({
        name: docData.name,
        email: docData.email,
        password: doctorPasswordHash,
        role: 'doctor',
        phone: docData.phone,
      });
      await user.save();

      const doctor = new Doctor({
        user: user._id,
        specialization: docData.specialization,
        fees: docData.fees,
        experience: docData.experience,
        qualifications: docData.qualifications,
        about: docData.about,
        clinicAddress: docData.clinicAddress,
        rating: docData.rating,
        totalReviews: docData.totalReviews,
        isApproved: true,
        availability: days.map((day) => ({
          day,
          slots: standardSlots,
        })),
      });
      await doctor.save();
      createdDoctors.push({ user, doctor });
    }
    console.log(`🩺 ${createdDoctors.length} Doctors created successfully`);

    // 5. Create Sample Completed Appointment with Prescription for Rahul
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

    // Past completed appointment with Dr. Amit
    const pastAppt = new Appointment({
      patient: patientRahul._id,
      doctor: createdDoctors[2].doctor._id, // Dr. Amit Verma
      date: yesterday,
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'completed',
      symptoms: 'Mild fever, sore throat, and body ache since 2 days',
      consultationType: 'in-clinic',
    });
    await pastAppt.save();

    // Prescription for past appointment
    const sampleRx = new Prescription({
      appointment: pastAppt._id,
      patient: patientRahul._id,
      doctor: createdDoctors[2].doctor._id,
      diagnosis: 'Acute Viral Pharyngitis & Mild Fever',
      medicines: [
        {
          name: 'Paracetamol 650mg',
          dosage: '1 Tablet',
          frequency: 'Thrice daily (After meals)',
          duration: '3 days',
        },
        {
          name: 'Cetirizine 10mg',
          dosage: '1 Tablet',
          frequency: 'Once daily at bedtime',
          duration: '5 days',
        },
        {
          name: 'Warm Salt Water Gargle',
          dosage: '3 times daily',
          frequency: 'Morning, Afternoon, Night',
          duration: '5 days',
        },
      ],
      instructions: 'Stay hydrated, drink warm liquids, avoid cold beverages. Rest adequately.',
      followUpDate: 'Follow up in 4 days if symptoms persist.',
    });
    await sampleRx.save();

    // Sample review from Rahul to Dr. Amit
    const sampleReview = new Review({
      doctor: createdDoctors[2].doctor._id,
      patient: patientRahul._id,
      appointment: pastAppt._id,
      rating: 5,
      comment: 'Very polite doctor! Accurately diagnosed and symptoms resolved in 2 days.',
    });
    await sampleReview.save();

    // Upcoming Appointment for Rahul with Dr. Rajesh (Cardiologist)
    const upcomingDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const upcomingAppt = new Appointment({
      patient: patientRahul._id,
      doctor: createdDoctors[0].doctor._id, // Dr. Rajesh Sharma
      date: upcomingDate,
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'confirmed',
      symptoms: 'Routine blood pressure review & cholesterol check',
      consultationType: 'video',
      meetingLink: 'https://meet.jit.si/MedConnect-TeleConsult-Rajesh',
    });
    await upcomingAppt.save();

    console.log('📋 Sample appointments, prescription, and reviews seeded successfully');
    console.log('\n--- DEMO CREDENTIALS ---');
    console.log('1. Admin: admin@medconnect.com / admin123');
    console.log('2. Doctor (Cardiology): dr.rajesh@medconnect.com / doctor123');
    console.log('3. Doctor (General): dr.amit@medconnect.com / doctor123');
    console.log('4. Patient: rahul@gmail.com / password123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
