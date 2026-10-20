const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ensureMentorProfile } = require('../services/mentorService');

// Register User
exports.register = async (req, res) => {
    try {
        let { email, password, name, role } = req.body;

        // Only email and password are required
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Check if user already exists in DB
        console.log(`🔍 [Registration Check] Checking if user already exists in DB: ${cleanEmail}`);
        let user = await User.findOne({ email: cleanEmail });
        if (user) {
            console.log(`⚠️ [Registration] User already exists in DB: ${cleanEmail}`);
            return res.status(400).json({ message: 'User already exists with this email. Please login instead.' });
        }

        // Hash password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save user with safe hashed password
        user = new User({
            email: cleanEmail,
            password: hashedPassword,
            name: name ? name.trim() : cleanEmail.split('@')[0],
            role: role || 'learner'
        });

        await user.save();
        console.log(`✅ [MongoDB Saved] New user created and saved in database: ${user.email} (ID: ${user._id}, Role: ${user.role})`);

        // Automatically create MentorProfile if registered as mentor
        if (user.role === 'mentor') {
            await ensureMentorProfile(user);
        }

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err);
                    return res.status(500).json({ message: 'Error generating token' });
                }
                res.status(201).json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    message: 'User registered successfully and saved to database!'
                });
            }
        );

    } catch (err) {
        console.error('❌ Registration Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        const cleanEmail = email.toLowerCase().trim();
        console.log(`🔍 [Authentication Check] Checking if user exists in MongoDB: ${cleanEmail}`);

        // Check if user exists in database
        let user = await User.findOne({ email: cleanEmail });
        if (!user) {
            console.log(`❌ [Authentication Check Failed] User NOT found in database: ${cleanEmail}`);
            return res.status(400).json({
                message: 'User does not exist in database. Please register first.',
                userExists: false
            });
        }

        console.log(`✅ [Authentication Check Passed] User exists in database: ${user.name} (${user.email}). Verifying password...`);

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`❌ [Authentication Check Failed] Password mismatch for user: ${cleanEmail}`);
            return res.status(400).json({
                message: 'Incorrect password. Please try again.',
                userExists: true
            });
        }

        console.log(`🎉 [Authentication Successful] User authenticated successfully: ${cleanEmail}`);

        // Automatically ensure MentorProfile exists if user is a mentor
        if (user.role === 'mentor') {
            await ensureMentorProfile(user);
        }

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role },
                    message: 'Login successful'
                });
            }
        );

    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Check if user exists in database
exports.checkUser = async (req, res) => {
    try {
        const email = req.params.email || req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail }).select('-password');

        if (!user) {
            return res.status(200).json({
                exists: false,
                message: `User with email ${cleanEmail} is NOT in the database`
            });
        }

        return res.status(200).json({
            exists: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            message: `User exists in the database`
        });
    } catch (err) {
        console.error('❌ Check User Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
