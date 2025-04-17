const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Ensure no duplicate follow relationships
    indexes: [
        { 
            fields: { follower: 1, followee: 1 }, 
            unique: true 
        }
    ]
});

const Follow = mongoose.model('Follow', FollowSchema);
module.exports = Follow;