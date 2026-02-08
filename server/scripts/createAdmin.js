// Run this script to create initial admin users
// Usage: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/invento26_voting';

async function createAdmins() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create main admin
        const adminExists = await Admin.findOne({ username: 'admin' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });

            await admin.save();
            console.log('✅ Admin user created');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create controller user
        const controllerExists = await Admin.findOne({ username: 'controller' });
        if (!controllerExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('control123', salt);

            const controller = new Admin({
                username: 'controller',
                password: hashedPassword,
                role: 'controller'
            });

            await controller.save();
            console.log('✅ Controller user created');
            console.log('   Username: controller');
            console.log('   Password: control123');
            console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
        } else {
            console.log('ℹ️  Controller user already exists');
        }

        // Create Display Node
        const displayExists = await Admin.findOne({ username: 'display' });
        if (!displayExists) {
            const hashedPassword = await bcrypt.hash('display123', 10);
            await Admin.create({
                username: 'display',
                password: hashedPassword,
                role: 'display'
            });
            console.log('Display user created (display/display123)');
        } else {
            console.log('Display user already exists');
        }

        console.log('\n🎉 Setup complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createAdmins();
