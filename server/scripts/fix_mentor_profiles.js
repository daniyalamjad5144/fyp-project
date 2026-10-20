require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');

async function fixMentors() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const mentors = await User.find({ role: 'mentor' });
    console.log(`Found ${mentors.length} mentor user(s).`);

    for (const mentor of mentors) {
        let profile = await MentorProfile.findOne({ user: mentor._id });
        if (!profile) {
            profile = new MentorProfile({
                user: mentor._id,
                bio: `Hello! I'm ${mentor.name}. I'm here to help you grow and succeed through peer mentorship.`,
                university: 'Peer Learning Network',
                degree: 'Peer Mentorship',
                skills: ['Peer Mentoring', 'Coursework Help', 'General Studies'],
                isApproved: true,
                rating: 5.0,
                reviewCount: 0,
                points: 100,
                level: 'Rookie',
                availability: [
                    { day: 'Monday', slots: ['10:00 AM', '02:00 PM', '04:00 PM'] },
                    { day: 'Wednesday', slots: ['10:00 AM', '02:00 PM'] },
                    { day: 'Friday', slots: ['02:00 PM', '04:00 PM'] }
                ]
            });
            await profile.save();
            console.log(`✅ Created MentorProfile for: ${mentor.name} (${mentor.email})`);
        } else {
            // Ensure approved
            if (!profile.isApproved) {
                profile.isApproved = true;
                await profile.save();
            }
            console.log(`⏭️  Profile already exists for: ${mentor.name} (${mentor.email})`);
        }
    }

    const allProfiles = await MentorProfile.find({}).populate('user', 'name email role');
    console.log('\n--- All MentorProfiles in DB ---');
    allProfiles.forEach(p => {
        console.log(`Profile: ${p._id} | User: ${p.user?.name} (${p.user?.email}) | Approved: ${p.isApproved}`);
    });

    process.exit(0);
}

fixMentors().catch(e => { console.error(e); process.exit(1); });
