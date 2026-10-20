const mongoose = require('mongoose');

const MentorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [{ type: String }],
    bio: String,
    university: String,
    degree: String,
    verificationDocuments: [String],
    isApproved: { type: Boolean, default: true },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    level: {
        type: String,
        enum: ['Rookie', 'Bronze', 'Silver', 'Gold'],
        default: 'Rookie'
    },
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    badges: [{
        name: String,
        icon: String,
        earnedAt: Date
    }],
    availability: [{
        day: String,
        slots: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', MentorProfileSchema);
