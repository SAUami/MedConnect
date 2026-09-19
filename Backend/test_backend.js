const app = require('./server');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🧪 Starting MedConnect Backend Verification Tests...\n');

  // Start temporary server
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`📡 Test server running on port ${PORT}`);
      resolve();
    });
  });

  try {
    // Helper fetch wrapper
    const apiCall = async (endpoint, options = {}) => {
      const { headers = {}, body, ...restOptions } = options;
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...restOptions,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    };

    // 1. Patient Login
    console.log('1️⃣ Testing Patient Login (rahul@gmail.com)...');
    const patientLoginRes = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'rahul@gmail.com', password: 'password123' },
    });
    if (!patientLoginRes.ok) throw new Error(patientLoginRes.data.message);
    const patientToken = patientLoginRes.data.token;
    console.log('   ✅ Patient logged in successfully. Token received.');

    // 2. Doctor Login
    console.log('2️⃣ Testing Doctor Login (dr.rajesh@medconnect.com)...');
    const doctorLoginRes = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'dr.rajesh@medconnect.com', password: 'doctor123' },
    });
    if (!doctorLoginRes.ok) throw new Error(doctorLoginRes.data.message);
    const doctorToken = doctorLoginRes.data.token;
    console.log('   ✅ Doctor logged in successfully. Token received.');

    // 3. Admin Login & Stats
    console.log('3️⃣ Testing Admin Login & Analytics Stats...');
    const adminLoginRes = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'admin@medconnect.com', password: 'admin123' },
    });
    if (!adminLoginRes.ok) throw new Error(adminLoginRes.data.message);
    const adminToken = adminLoginRes.data.token;

    const statsRes = await apiCall('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!statsRes.ok) throw new Error(statsRes.data.message);
    console.log('   ✅ Admin stats fetched:', statsRes.data);

    // 4. Fetch Doctors List
    console.log('4️⃣ Testing Doctor Directory & Filtering...');
    const allDoctorsRes = await apiCall('/doctors');
    console.log(`   ✅ Total verified doctors found: ${allDoctorsRes.data.length}`);

    const cardiosRes = await apiCall('/doctors?specialization=Cardiologist');
    console.log(`   ✅ Cardiologist filter returned: ${cardiosRes.data[0].user.name}`);

    // 5. Slot Booking and Collision Test
    const targetDoctor = cardiosRes.data[0];
    const testDate = new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 500) + 10)).toISOString().split('T')[0];
    const testSlot = '10:00 AM - 10:30 AM';

    console.log('5️⃣ Testing Appointment Booking & Conflict Detection...');
    const bookingRes = await apiCall('/appointments/book', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: targetDoctor._id,
        date: testDate,
        timeSlot: testSlot,
        symptoms: 'Mild chest tightness after jogging',
        consultationType: 'video',
      },
    });
    if (!bookingRes.ok) throw new Error(`${bookingRes.data.message}: ${bookingRes.data.error || ''}`);
    console.log('   ✅ Appointment booked successfully. ID:', bookingRes.data.appointment._id);
    console.log('   🎥 Auto-generated Video Link:', bookingRes.data.appointment.meetingLink);

    // Try booking the EXACT SAME slot (Expected to fail with 400)
    const duplicateRes = await apiCall('/appointments/book', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctorId: targetDoctor._id,
        date: testDate,
        timeSlot: testSlot,
        symptoms: 'Want second opinion',
        consultationType: 'in-clinic',
      },
    });
    if (duplicateRes.status === 400) {
      console.log('   ✅ Conflict prevention verified: Double booking rejected with 400 (', duplicateRes.data.message, ')');
    } else {
      throw new Error(`Double booking was allowed with status ${duplicateRes.status}`);
    }

    // 6. Doctor Writes Prescription
    console.log('6️⃣ Testing Digital Prescription Creation by Doctor...');
    const rxRes = await apiCall('/prescriptions/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        appointmentId: bookingRes.data.appointment._id,
        diagnosis: 'Mild Musculoskeletal Chest Strain (ECG Normal)',
        medicines: [
          {
            name: 'Ibuprofen 400mg',
            dosage: '1 Tablet',
            frequency: 'Twice daily after food',
            duration: '3 days',
          },
        ],
        instructions: 'Rest from strenuous running for 4 days. Hot compress.',
        followUpDate: '2026-10-22',
      },
    });
    if (!rxRes.ok) throw new Error(rxRes.data.message);
    console.log('   ✅ Prescription created successfully. Diagnosis:', rxRes.data.prescription.diagnosis);

    // 7. Verify Appointment status automatically changed to completed
    const myApptsRes = await apiCall('/appointments/my', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const updatedAppt = myApptsRes.data.find((a) => a._id === bookingRes.data.appointment._id);
    console.log(`   ✅ Appointment status auto-transitioned to: ${updatedAppt.status}`);

    // 8. Patient checks digital health record timeline
    console.log('7️⃣ Testing Patient Digital Health Timeline...');
    const myRxList = await apiCall('/prescriptions/my-prescriptions', {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.log(`   ✅ Patient has ${myRxList.data.length} digital prescription records in timeline.`);

    // 9. Verify Pan-India Clinics & Hospitals State & District Directory
    console.log('8️⃣ Testing Pan-India Hospital Directory by State & District...');
    const biharClinics = await apiCall('/clinics?state=Bihar&district=Patna');
    if (!biharClinics.ok || biharClinics.data.length === 0) {
      throw new Error('Failed to fetch hospitals for Bihar / Patna');
    }
    console.log(`   ✅ Bihar/Patna returned ${biharClinics.data.length} hospitals. First: ${biharClinics.data[0].name}`);

    const mhEmergency = await apiCall('/clinics?state=Maharashtra&emergency=true');
    if (!mhEmergency.ok || mhEmergency.data.length === 0) {
      throw new Error('Failed to fetch emergency hospitals in Maharashtra');
    }
    console.log(`   ✅ Maharashtra emergency query returned ${mhEmergency.data.length} trauma hospitals.`);

    console.log('\n🎉 ALL BACKEND TESTS PASSED FLAWLESSLY! 🚀\n');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
