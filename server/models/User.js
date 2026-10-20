const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { 
        type: String, 
        trim: true,
        default: function() {
            return this.email ? this.email.split('@')[0] : 'User';
        }
    },
    role: { type: String, default: 'learner' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
