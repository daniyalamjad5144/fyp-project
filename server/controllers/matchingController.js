const MentorProfile = require('../models/MentorProfile');
const { syncAllMentorProfiles } = require('../services/mentorService');

// Find mentors based on skills and availability
exports.findMentors = async (req, res) => {
    try {
        const { skill, day, gender } = req.query;

        // Auto-sync any mentor user in the database who doesn't have a MentorProfile yet
        await syncAllMentorProfiles();

        // Fetch all mentor profiles and populate the user details
        const mentors = await MentorProfile.find({})
            .populate({
                path: 'user',
                select: 'name email avatar gender role'
            })
            .sort({ rating: -1, points: -1 });

        // Ensure we only return profiles that have an active associated user with role 'mentor'
        let filteredMentors = mentors.filter(m => m.user && m.user.role === 'mentor');

        // Filter by gender if provided
        if (gender && gender !== 'any') {
            filteredMentors = filteredMentors.filter(m =>
                m.user && m.user.gender && m.user.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        // Filter by skill if provided
        if (skill && skill.trim()) {
            const regex = new RegExp(skill.trim(), 'i');
            filteredMentors = filteredMentors.filter(m =>
                Array.isArray(m.skills) && m.skills.some(s => s && regex.test(s))
            );
        }

        // Filter by day if provided
        if (day && day.trim()) {
            const regex = new RegExp(day.trim(), 'i');
            filteredMentors = filteredMentors.filter(m =>
                Array.isArray(m.availability) && m.availability.some(a => a && a.day && regex.test(a.day))
            );
        }

        res.json(filteredMentors);
    } catch (err) {
        console.error('❌ findMentors Error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get a specific mentor by ID (supports MentorProfile ID or User ID)
exports.getMentorById = async (req, res) => {
    try {
        let mentor = null;

        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            mentor = await MentorProfile.findById(req.params.id)
                .populate('user', ['name', 'email', 'avatar', 'gender', 'role']);

            // Fallback: check if the id provided was actually the User ID
            if (!mentor) {
                mentor = await MentorProfile.findOne({ user: req.params.id })
                    .populate('user', ['name', 'email', 'avatar', 'gender', 'role']);
            }
        }

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.json(mentor);
    } catch (err) {
        console.error('❌ Get mentor by ID error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
