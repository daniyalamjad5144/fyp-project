require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');

const seedData = async () => {
    try {
        // Database is already connected from server.js
        // Clear existing data (optional - comment out if you want to keep existing users)
        // await User.deleteMany({ role: 'mentor' });
        // await MentorProfile.deleteMany({});
        // console.log('🗑️  Cleared existing mentor data');

        // Create mentor users
        const mentorUsers = [
            {
                name: 'Sarah Johnson',
                email: 'sarahjohnson@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'female',
                isVerified: true
            },
            {
                name: 'Michael Chen',
                email: 'michael.chen@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'male',
                isVerified: true
            },
            {
                name: 'Emily Rodriguez',
                email: 'emily.rodriguez@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'female',
                isVerified: true
            },
            {
                name: 'David Kim',
                email: 'david.kim@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'male',
                isVerified: true
            },
            {
                name: 'Jessica Williams',
                email: 'jessica.williams@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'female',
                isVerified: true
            },
            {
                name: 'Alex Thompson',
                email: 'alex.thompson@university.edu',
                password: await bcrypt.hash('password123', 10),
                role: 'mentor',
                gender: 'male',
                isVerified: true
            }
        ];

        // Check if mentors already exist
        for (const mentorData of mentorUsers) {
            const existingUser = await User.findOne({ email: mentorData.email });
            if (existingUser) {
                console.log(`⏭️  Skipping ${mentorData.name} - already exists`);
                continue;
            }

            const user = new User(mentorData);
            await user.save();
            console.log(`✅ Created user: ${user.name}`);

            // Create mentor profile
            const profileData = getMentorProfileData(user._id, user.name);
            const profile = new MentorProfile(profileData);
            await profile.save();
            console.log(`✅ Created profile for: ${user.name}`);
        }

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📝 Sample Credentials:');
        console.log('Email: sarahjohnson@university.edu');
        console.log('Password: password123');
        console.log('\n(All mentors use password: password123)');

        // process.exit(0); // Removed for programmatic usage
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        // process.exit(1); // Removed for programmatic usage
    }
};

// Helper function to generate mentor profile data
function getMentorProfileData(userId, name) {
    const profiles = {
        'Sarah Johnson': {
            user: userId,
            skills: ['React', 'JavaScript', 'Node.js', 'Web Development'],
            bio: 'Full-stack developer with 3 years of experience. Passionate about teaching modern web technologies and helping students build real-world projects.',
            university: 'MIT',
            degree: 'Computer Science',
            isApproved: true,
            rating: 4.8,
            reviewCount: 24,
            points: 850,
            level: 'Bronze', // 850 > 700
            totalEarnings: 1250,
            availableBalance: 1000, // 80% of 1250
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2024-01-15') },
                { name: 'Expert Mentor', icon: '🥈', earnedAt: new Date('2024-06-20') }
            ],
            availability: [
                { day: 'Monday', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
                { day: 'Wednesday', slots: ['10:00 AM', '2:00 PM'] },
                { day: 'Friday', slots: ['11:00 AM', '3:00 PM'] }
            ]
        },
        'Michael Chen': {
            user: userId,
            skills: ['Python', 'Machine Learning', 'Data Science', 'AI'],
            bio: 'Data scientist specializing in ML and AI. Love helping students understand complex algorithms and apply them to real problems.',
            university: 'Stanford University',
            degree: 'Data Science',
            isApproved: true,
            rating: 4.9,
            reviewCount: 31,
            points: 1250,
            level: 'Gold', // 1250 > 1000
            totalEarnings: 2400,
            availableBalance: 1920, // 80% of 2400
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2023-11-10') },
                { name: 'Expert Mentor', icon: '🥈', earnedAt: new Date('2024-03-15') },
                { name: 'Master Mentor', icon: '🥇', earnedAt: new Date('2024-09-01') }
            ],
            availability: [
                { day: 'Tuesday', slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
                { day: 'Thursday', slots: ['10:00 AM', '3:00 PM'] }
            ]
        },
        'Emily Rodriguez': {
            user: userId,
            skills: ['Java', 'Spring Boot', 'Backend Development', 'Microservices'],
            bio: 'Backend engineer with expertise in Java ecosystem. Helping students master backend development and system design.',
            university: 'UC Berkeley',
            degree: 'Software Engineering',
            isApproved: true,
            rating: 4.7,
            reviewCount: 18,
            points: 620,
            level: 'Rookie', // < 700
            totalEarnings: 800,
            availableBalance: 640,
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2024-02-12') }
            ],
            availability: [
                { day: 'Monday', slots: ['4:00 PM', '5:00 PM'] },
                { day: 'Wednesday', slots: ['4:00 PM', '5:00 PM'] }
            ]
        },
        'David Kim': {
            user: userId,
            skills: ['UI/UX Design', 'Figma', 'Product Design'],
            bio: 'Product designer with a focus on user-centric design. Experience in both startups and large tech companies.',
            university: 'Rhode Island School of Design',
            degree: 'Graphic Design',
            isApproved: true,
            rating: 4.6,
            reviewCount: 15,
            points: 480,
            level: 'Rookie', // < 700
            totalEarnings: 600,
            availableBalance: 480,
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2024-03-01') }
            ],
            availability: [
                { day: 'Tuesday', slots: ['11:00 AM', '12:00 PM'] },
                { day: 'Friday', slots: ['2:00 PM', '3:00 PM'] }
            ]
        },
        'Jessica Williams': {
            user: userId,
            skills: ['Mathematics', 'Statistics', 'Probability'],
            bio: 'Math enthusiast helping students master calculus, statistics, and linear algebra.',
            university: 'Princeton University',
            degree: 'Mathematics',
            isApproved: true,
            rating: 5.0,
            reviewCount: 42,
            points: 920,
            level: 'Silver', // 920 > 900
            totalEarnings: 1800,
            availableBalance: 1440,
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2023-09-10') },
                { name: 'Expert Mentor', icon: '🥈', earnedAt: new Date('2023-12-05') },
                { name: 'Master Mentor', icon: '🥇', earnedAt: new Date('2024-04-20') }
            ],
            availability: [
                { day: 'Wednesday', slots: ['9:00 AM', '10:00 AM', '11:00 AM'] },
                { day: 'Thursday', slots: ['9:00 AM', '10:00 AM', '11:00 AM'] }
            ]
        },
        'Alex Thompson': {
            user: userId,
            skills: ['C++', 'Algorithms', 'Competitive Programming'],
            bio: 'Competitive programmer ranked in top 1% globally. Expert in data structures and algorithm optimization.',
            university: 'Carnegie Mellon University',
            degree: 'Computer Science',
            isApproved: true,
            rating: 4.6,
            reviewCount: 27,
            points: 750,
            level: 'Bronze', // 750 > 700
            totalEarnings: 1500,
            availableBalance: 1200,
            badges: [
                { name: 'Rookie Mentor', icon: '🥉', earnedAt: new Date('2023-08-15') },
                { name: 'Expert Mentor', icon: '🥈', earnedAt: new Date('2024-01-30') }
            ],
            availability: [
                { day: 'Monday', slots: ['5:00 PM', '6:00 PM', '7:00 PM'] },
                { day: 'Thursday', slots: ['5:00 PM', '6:00 PM', '7:00 PM'] }
            ]
        }
    };

    return profiles[name] || {
        user: userId,
        skills: [],
        bio: '',
        university: '',
        degree: '',
        isApproved: true,
        rating: 0,
        reviewCount: 0,
        points: 0,
        level: 'Rookie',
        totalEarnings: 0,
        badges: [],
        availability: []
    };
}

module.exports = seedData;

if (require.main === module) {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    mongoose.connect(mongoUri)
        .then(async () => {
            console.log('Connected to MongoDB Atlas. Running seed...');
            await seedData();
            console.log('Seed finished.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Failed to run seed:', err);
            process.exit(1);
        });
}
