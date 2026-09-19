const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { verifyToken } = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, gender, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient',
      phone: phone || '',
      gender: gender || '',
      age: age || null,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        gender: newUser.gender,
        age: newUser.age,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGIN (Email or Mobile Number + Password)
router.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || phone || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Please provide email/phone number and password' });
    }

    // Check if user exists by email or phone
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { phone: loginIdentifier },
      ],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please check or use Forgot Password.' });
    }

    // If doctor logs in, mark active/online
    if (user.role === 'doctor') {
      try {
        await Doctor.findOneAndUpdate({ user: user._id }, { isOnline: true, lastLogin: new Date() });
      } catch (err) {
        console.error('Error updating doctor online status:', err);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET CURRENT USER PROFILE (/me)
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGOUT ROUTE
router.post('/logout', verifyToken, async (req, res) => {
  try {
    if (req.user && req.user.role === 'doctor') {
      await Doctor.findOneAndUpdate({ user: req.user._id }, { isOnline: false });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// FORGOT / RESET PASSWORD (Email or Phone + New Password)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone, identifier, newPassword } = req.body;
    const resetIdentifier = (identifier || email || phone || '').trim();

    if (!resetIdentifier || !newPassword) {
      return res.status(400).json({ message: 'Email or phone number and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      $or: [
        { email: resetIdentifier.toLowerCase() },
        { phone: resetIdentifier },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email or phone' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Generate JWT token for instant automatic sign-in
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: `Password updated successfully for ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error resetting password', error: error.message });
  }
});

// In-memory OTP store: cleanDigits -> { otp, expiresAt, verified }
const otpStore = new Map();

// 1. SEND OTP TO PHONE
router.post('/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ message: 'Valid phone number is required (min 8 digits)' });
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const user = await User.findOne({ phone: { $regex: cleanDigits } });

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanDigits, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      verified: false,
    });

    res.status(200).json({
      message: `Verification code sent to ${phone}`,
      otp, // included in response for seamless development & viva testing
      userExists: !!user,
      userName: user ? user.name : '',
      userRole: user ? user.role : 'patient',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// 2. VERIFY PHONE OTP
router.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanDigits);

    if (!stored) {
      return res.status(400).json({ message: 'No active OTP request found for this number. Please request a new OTP.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanDigits);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Allow generated OTP or universal dev fallback '123456'
    if (stored.otp !== otp.trim() && otp.trim() !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP code. Please enter the correct code.' });
    }

    stored.verified = true;
    otpStore.set(cleanDigits, stored);

    const user = await User.findOne({ phone: { $regex: cleanDigits } });

    res.status(200).json({
      message: 'Phone number verified successfully! You can now create your password.',
      verified: true,
      userExists: !!user,
      userName: user ? user.name : '',
      userRole: user ? user.role : 'patient',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// 3. SET PASSWORD & LOGIN
router.post('/phone/set-password-login', async (req, res) => {
  try {
    const { phone, newPassword, name, role } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ message: 'Phone number and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const stored = otpStore.get(cleanDigits);

    if (!stored || !stored.verified) {
      return res.status(403).json({ message: 'Phone number has not been verified with OTP yet.' });
    }

    // Clear OTP after successful consumption
    otpStore.delete(cleanDigits);

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let user = await User.findOne({ phone: { $regex: cleanDigits } });

    if (user) {
      // Update existing user password
      user.password = hashedPassword;
      await user.save();
    } else {
      // Register new user with this verified phone number
      const fallbackEmail = `user_${cleanDigits}@medconnect.local`;
      user = new User({
        name: name || `User ${cleanDigits.slice(-4)}`,
        email: fallbackEmail,
        password: hashedPassword,
        phone: phone,
        role: role || 'patient',
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: `Password saved successfully! Welcome, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting password and logging in', error: error.message });
  }
});

module.exports = router;