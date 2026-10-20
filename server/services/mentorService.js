const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Ensure a user with role 'mentor' has an active MentorProfile in the database
 * @param {Object|string} userOrId - User document or User ID
 * @returns {Promise<Object|null>} MentorProfile document
 */
const ensureMentorProfile = async (userOrId) => {
    try {
        let user = userOrId;
        if (typeof userOrId === 'string' || userOrId instanceof mongoose.Types.ObjectId) {
            user = await User.findById(userOrId);
        }

        if (!user || user.role !== 'mentor') {
            return null;
        }

        let profile = await MentorProfile.findOne({ user: user._id });

        if (!profile) {
            const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Mentor');
            profile = new MentorProfile({
                user: user._id,
                bio: `Hello, I'm ${displayName}! Ready to connect, share knowledge, and help you achieve your academic goals through peer mentorship.`,
                university: 'Campus Peer Network',
                degree: 'Peer Mentorship',
                skills: ['Peer Mentoring', 'Coursework Help', 'General Studies'],
                isApproved: true,
                rating: 5.0,
                reviewCount: 0,
                points: 100,
                level: 'Rookie',
                availability: [
                    { day: 'Monday', slots: ['10:00 AM', '02:00 PM', '04:00 PM'] },
                    { day: 'Wednesday', slots: ['10:00 AM', '02:00 PM', '04:00 PM'] },
                    { day: 'Friday', slots: ['10:00 AM', '02:00 PM', '04:00 PM'] }
                ]
            });
            await profile.save();
            console.log(`✅ [MentorProfile Created] Profile automatically created for mentor: ${displayName} (${user.email})`);
        } else if (!profile.isApproved) {
            profile.isApproved = true;
            await profile.save();
        }

        return profile;
    } catch (err) {
        console.error('❌ Error ensuring mentor profile:', err.message);
        return null;
    }
};

/**
 * Sync all users with role 'mentor' to make sure each has an active profile
 */
const syncAllMentorProfiles = async () => {
    try {
        const mentors = await User.find({ role: 'mentor' });
        for (const mentor of mentors) {
            await ensureMentorProfile(mentor);
        }
    } catch (err) {
        console.error('❌ Error syncing mentor profiles:', err.message);
    }
};

module.exports = {
    ensureMentorProfile,
    syncAllMentorProfiles
};
