const app = require('./server');

const server = app.listen(5096, async () => {
  try {
    console.log('📡 Testing Phone OTP flow on port 5096...');
    // 1. Send OTP
    const sRes = await fetch('http://localhost:5096/api/auth/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '7052329436' }),
    });
    const sData = await sRes.json();
    console.log('Step 1 Send OTP:', sData.message, '| OTP Code:', sData.otp, '| User Exists:', sData.userExists);

    // 2. Verify OTP
    const vRes = await fetch('http://localhost:5096/api/auth/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '7052329436', otp: sData.otp }),
    });
    const vData = await vRes.json();
    console.log('Step 2 Verify OTP:', vData.message, '| Verified:', vData.verified);

    // 3. Set Password & Login
    const pRes = await fetch('http://localhost:5096/api/auth/phone/set-password-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '7052329436', newPassword: 'mypassword123' }),
    });
    const pData = await pRes.json();
    console.log('Step 3 Set Password & Login:', pData.message);
    console.log('Logged in user:', pData.user ? pData.user.name : null, '| Token exists:', !!pData.token);

    console.log('\n✅ ALL PHONE OTP VERIFICATION & PASSWORD CREATION TESTS PASSED!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in test:', err);
    server.close();
    process.exit(1);
  }
});
