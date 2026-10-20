require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');

async function cleanStaticUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const staticEmails = [
            'sarahjohnson@university.edu',
            'michael.chen@university.edu',
            'emily.rodriguez@university.edu',
            'david.kim@university.edu',
            'jessica.williams@university.edu',
            'alex.thompson@university.edu'
        ];

        // Find static users
        const staticUsers = await User.find({ email: { $in: staticEmails } });
        const staticIds = staticUsers.map(u => u._id);

        console.log(`🔍 Found ${staticUsers.length} static users to remove:`);
        staticUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`));

        if (staticIds.length > 0) {
            // Delete associated mentor profiles
            const profileRes = await MentorProfile.deleteMany({ user: { $in: staticIds } });
            console.log(`🗑️  Deleted ${profileRes.deletedCount} static mentor profiles.`);

            // Delete users
            const userRes = await User.deleteMany({ _id: { $in: staticIds } });
            console.log(`🗑️  Deleted ${userRes.deletedCount} static user accounts.`);
        }

        // Show remaining users
        const remaining = await User.find({}, 'name email role createdAt');
        console.log(`\n👥 Remaining Real Users in Database (${remaining.length}):`);
        remaining.forEach((u, i) => console.log(`   ${i + 1}. ${u.name || 'User'} | ${u.email} | Role: ${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error cleaning static users:', err);
        process.exit(1);
    }
}

cleanStaticUsers();
