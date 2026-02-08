const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'invento2026_spy_secret_key_change_in_production';

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            await AuditLog.create({
                action: 'LOGIN_FAILED',
                details: { username, reason: 'User not found' },
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            await AuditLog.create({
                action: 'LOGIN_FAILED',
                details: { username, reason: 'Wrong password' },
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Log Success
        await AuditLog.create({
            action: 'LOGIN_SUCCESS',
            details: { username, role: admin.role },
            adminId: admin._id,
            ip: req.ip
        });

        // Generate JWT
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' } // Token expires in 8 hours
        );

        res.json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify token (for protected routes)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ user: admin });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Create new user (Protected by Master Key)
router.post('/onboard-user', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const masterKey = req.headers['x-master-key'];

        // Verify Master Key
        if (masterKey !== (process.env.MASTER_KEY || 'invento2026_super_secret_key')) {
            await AuditLog.create({
                action: 'ONBOARD_FAILED',
                details: { username, reason: 'Invalid Master Key' },
                ip: req.ip
            });
            return res.status(403).json({ error: 'Access Denied: Invalid Master Key' });
        }

        // Check if user already exists
        const existingUser = await Admin.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new Admin({
            username,
            password: hashedPassword,
            role: role || 'controller'
        });

        await newUser.save();

        await AuditLog.create({
            action: 'USER_ONBOARDED',
            details: { new_user: username, assigned_role: role },
            ip: req.ip
        });

        res.status(201).json({ message: `User '${username}' created with role '${newUser.role}'` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
