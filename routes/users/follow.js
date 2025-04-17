const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Follow = require('../../models/Follow');
const {authenticateUser} = require('../../middleware/auth');

// Follow a user
router.post('/follow/:userId', authenticateUser, async (req, res) => {
    try {
        const followerId = req.user.id; // From auth middleware
        const followeeId = req.params.userId;

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: followerId, 
            followee: followeeId
        });

        if (existingFollow) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Create new follow relationship
        const newFollow = new Follow({
            follower: followerId,
            followee: followeeId
        });

        await newFollow.save();

        // Update follower and followee counts
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(followeeId, { $inc: { followersCount: 1 } });

        res.status(201).json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unfollow a user
router.delete('/unfollow/:userId', authenticateUser, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followeeId = req.params.userId;

        // Remove follow relationship
        const result = await Follow.findOneAndDelete({
            follower: followerId,
            followee: followeeId
        });

        if (!result) {
            return res.status(404).json({ message: 'Not following this user' });
        }

        // Update follower and followee counts
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(followeeId, { $inc: { followersCount: -1 } });

        res.status(200).json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const followers = await Follow.find({ followee: userId })
            .populate('follower', 'name email picture')
            .skip(skip)
            .limit(limit);

        const total = await Follow.countDocuments({ followee: userId });

        res.json({
            followers,
            totalFollowers: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get users a user is following
router.get('/:userId/following', async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const following = await Follow.find({ follower: userId })
            .populate('followee', 'name email picture')
            .skip(skip)
            .limit(limit);

        const total = await Follow.countDocuments({ follower: userId });

        res.json({
            following,
            totalFollowing: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check if current user follows a specific user
router.get('/check-follow/:userId', authenticateUser, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followeeId = req.params.userId;

        const follow = await Follow.findOne({
            follower: followerId,
            followee: followeeId
        });

        res.json({ isFollowing: !!follow });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;