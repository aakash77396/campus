// const express = require("express");
// const router = express.Router();
// const  Post  = require("./../../models/Posts");
// const multer = require("multer");
// const path = require("path");
// const { processAndUploadImage } = require('./../../utils/imageUtils');
// const fs = require('fs');

// // Configure Multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // const uploadPath = path.join(__dirname, 'uploads');
//         const uploadPath = path.join(__dirname, '../../uploads'); 
//         // Ensure upload directory exists
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// const upload = multer({ storage });

// // Post upload endpoint
// router.post("/", upload.array("files"), async (req, res) => {
//     try {
//         const { userId } = req.body;
//         if (!userId || !req.files || req.files.length === 0) {
//             return res.status(400).json({ message: "No files uploaded or invalid data" });
//         }

//         const processedImages = [];
//         const errors = [];

//         // Process each uploaded file
//         for (const file of req.files) {
//             try {
//                 const result = await processAndUploadImage(file.path);
//                 console.log("result:", result);
//                 processedImages.push(result.url);
//             } catch (error) {
//                 console.log("err:", error);
//                 errors.push({
//                     filename: file.originalname,
//                     error: error.message
//                 });
//             }
//         }

//         if (processedImages.length === 0) {
//             return res.status(400).json({
//                 message: "No images were successfully processed",
//                 errors
//             });
//         }

//         // Save to database
//         let existingPost = await Post.findOne({ userId });
//         if (existingPost) {
//             existingPost.base64Image.push(...processedImages);
//             await existingPost.save();
//         } else {
//             existingPost = await Post.create({
//                 userId,
//                 base64Image: processedImages
//             });
//         }

//         return res.status(200).json({
//             message: "Post processed successfully",
//             post: existingPost,
//             errors: errors.length > 0 ? errors : null
//         });
//     } catch (error) {
//         console.error("❌ Error processing post:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// });


// // ✅ API Endpoint to Access Post (Image Upload)
// router.get("/:userId", async (req, res) => {
//     try {
//         const { userId } = req.params;
//         console.log(`📩 Received request for posts of user: ${userId}`);

//         const posts = await Post.find({ userId }).sort({ createdAt: -1 });

//         if (!posts.length) {
//             console.log("⚠️ No posts found for this user.");
//             return res
//                 .status(404)
//                 .json({ message: "No posts found for this user" });
//         }

//         console.log("✅ Sending posts:", posts);
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error("❌ Error fetching user posts:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

// // ✅ API Endpoint to Delete Post (Image Upload)
// router.delete("/:userId/delete-image", async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { imageIndex } = req.body;

//         const post = await Post.findOne({ userId }); // Find by userId
//         if (!post) return res.status(404).json({ message: "Post not found" });

//         post.base64Image.splice(imageIndex, 1); // Remove the image
//         await post.save();

//         res.status(200).json({ message: "Image deleted successfully", post });
//     } catch (error) {
//         console.error("❌ Error deleting image:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

// //Update Caption Endpoint
// router.put("/:userId/update-caption", async (req, res) => {
//     const { userId } = req.params;
//     const { postIndex, caption } = req.body;

//     try {
//         const userPosts = await Post.findOne({ userId }); // Fetch user's posts
//         if (!userPosts) {
//             return res.status(404).json({ message: "User posts not found" });
//         }

//         if (postIndex >= 0 && postIndex < userPosts.posts.length) {
//             userPosts.posts[postIndex].caption = caption; // Update caption
//             await userPosts.save(); // Save to database
//             return res
//                 .status(200)
//                 .json({ message: "Caption updated successfully" });
//         } else {
//             return res.status(400).json({ message: "Invalid post index" });
//         }
//     } catch (error) {
//         console.error("Error updating caption:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // API to fetch random posts
// router.get("/random/:userId", async (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Find all posts by this user
//         const userPosts = await Post.find({ userId });

//         if (!userPosts.length) {
//             return res
//                 .status(404)
//                 .json({ message: "No posts found for this user" });
//         }

//         // Shuffle user posts randomly
//         const randomPost =
//             userPosts[Math.floor(Math.random() * userPosts.length)];

//         res.status(200).json(randomPost);
//     } catch (error) {
//         console.error("❌ Error fetching random post:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// router.get("/random", async (req, res) => {
//     try {
//         // Fetch all users with posts
//         const usersWithPosts = await Post.find({}).select(
//             "userId base64Image likes caption"
//         );

//         if (!usersWithPosts.length) {
//             return res.status(404).json({ message: "No posts available" });
//         }

//         // Shuffle and take one random post per user
//         const shuffledPosts = usersWithPosts.sort(() => 0.5 - Math.random());

//         res.status(200).json(shuffledPosts);
//     } catch (error) {
//         console.error("Error fetching random posts:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Post = require("../../models/Posts");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { 
  processAndUploadImage, 
  processAndUploadVideo, 
  deleteMedia 
} = require('../../utils/imageUtils');
const mongoose = require('mongoose');
const { authenticateUser } = require('../../middleware/auth');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB max file size
  files: 10 // Max 10 files per upload
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post with media
 * @access  Private
 */
router.post("/", authenticateUser, upload.array("media", 10), async (req, res) => {
  try {
    const { userId,name, caption, location, tags, visibility } = req.body;
    
    // Validate request
    if (!userId || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Media files and userId are required" });
    }

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const processedMedia = [];
    const errors = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        let result;
        let mediaType;

        if (file.mimetype.startsWith('image/')) {
          result = await processAndUploadImage(file.path, { 
            resize: { width: 1920 } // Max width while keeping aspect ratio
          });
          mediaType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          result = await processAndUploadVideo(file.path);
          mediaType = 'video';
        }

        processedMedia.push({
          type: mediaType,
          url: result.url,
          thumbnail: result.thumbnail || null,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          duration: result.duration || null
        });
      } catch (error) {
        console.error("Error processing media:", error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    if (processedMedia.length === 0) {
      return res.status(400).json({
        message: "No media was successfully processed",
        errors
      });
    }

    // Create new post
    const newPost = await Post.create({
      userId,
      name : name || "Campus Mitra",
      caption: caption || "",
      location: location || "",
      media: processedMedia,
      tags: tags ? JSON.parse(tags) : [],
      visibility: visibility || 'public'
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * @route   GET /api/posts
 * @desc    Get paginated posts for feed
 * @access  Private
 */
router.get("/feed", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id; // From auth middleware
    
    // Get posts from user's connections and public posts
    // (This would require a User model with a connections array)
    const posts = await Post.find({
      $or: [
        { visibility: 'public' },
        { userId },
        // { userId: { $in: userConnections } } // Uncomment when you have connections
      ],
      isArchived: false
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('userId', 'username profilePicture displayName')
    .lean();

    const totalPosts = await Post.countDocuments({
      $or: [
        { visibility: 'public' },
        { userId },
        // { userId: { $in: userConnections } }
      ],
      isArchived: false
    });

    res.status(200).json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      totalPosts
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get posts by user ID
 * @access  Private
 */
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const requestingUserId = req.user._id; // From auth middleware
    
    // Check if user exists (would require User model)
    // const userExists = await User.exists({ _id: userId });
    // if (!userExists) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    
    // Build query based on visibility permissions
    let query = { 
      userId: mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      isArchived: false
    };
    
    // If not the owner, only show public posts
    if (requestingUserId.toString() !== userId) {
      query.visibility = 'public';
      // Could add check for 'friends' level visibility if you implement connections
    }
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'username profilePicture displayName')
      .lean();
      
    const totalPosts = await Post.countDocuments(query);
    
    if (!posts.length) {
      return res.status(200).json({ 
        message: "No posts found for this user",
        posts: [],
        currentPage: parseInt(page),
        totalPages: 0,
        totalPosts: 0
      });
    }
    
    res.status(200).json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      totalPosts
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   GET /api/posts/:postId
 * @desc    Get a single post by ID
 * @access  Private
 */
router.get("/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const requestingUserId = req.user._id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    const post = await Post.findById(postId)
      .populate('userId', 'username profilePicture displayName')
      .populate('comments.userId', 'username profilePicture displayName')
      .lean();
      
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check visibility permissions
    if (post.visibility !== 'public' && post.userId._id.toString() !== requestingUserId.toString()) {
      // Check if user is a friend for 'friends' visibility
      // const isFriend = await checkIfUserIsFriend(requestingUserId, post.userId);
      // if (post.visibility === 'friends' && !isFriend) {
      //   return res.status(403).json({ message: "You don't have permission to view this post" });
      // }
      return res.status(403).json({ message: "You don't have permission to view this post" });
    }
    
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update a post
 * @access  Private
 */
router.put("/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, location, visibility, tags } = req.body;
    const userId = req.user._id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    // Find the post and check ownership
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Verify post ownership
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You don't have permission to edit this post" });
    }
    
    // Update fields
    if (caption !== undefined) post.caption = caption;
    if (location !== undefined) post.location = location;
    if (visibility !== undefined) post.visibility = visibility;
    if (tags !== undefined) post.tags = JSON.parse(tags);
    
    await post.save();
    
    res.status(200).json({
      message: "Post updated successfully",
      post
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete a post
 * @access  Private
 */
router.delete("/:postId", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    // Find the post and check ownership
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Verify post ownership
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You don't have permission to delete this post" });
    }
    
    // Delete media from cloud storage
    for (const media of post.media) {
      try {
        await deleteMedia(media.publicId, media.type);
      } catch (error) {
        console.error("Error deleting media:", error);
        // Continue deletion even if media removal fails
      }
    }
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like/unlike a post
 * @access  Private
 */
router.post("/:postId/like", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id; // From auth middleware
    console.log(userId,postId);
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
      await post.save();
      return res.status(200).json({ 
        message: "Post liked successfully",
        liked: true,
        likeCount: post.likes.length
      });
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({ 
        message: "Post unliked successfully",
        liked: false,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   POST /api/posts/:postId/comment
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post("/:postId/comment", authenticateUser, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const name = req.user.name;
    const userId = req.user._id; // From auth middleware
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Comment text is required" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Add comment
    post.comments.push({
      userId,
      text,
      name,
      createdAt: new Date()
    });
    
    await post.save();
    
    // Get the newly added comment with user details
    const newComment = post.comments[post.comments.length - 1];
    const populatedPost = await Post.findById(postId)
      .populate('comments.userId', 'username profilePicture displayName');
    
    const populatedComment = populatedPost.comments.id(newComment._id);
    
    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   DELETE /api/posts/:postId/comment/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete("/:postId/comment/:commentId", authenticateUser, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Find the comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user is the comment author or post owner
    if (comment.userId.toString() !== userId.toString() && 
        post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You don't have permission to delete this comment" });
    }
    
    // Remove the comment
    post.comments.pull(commentId);
    await post.save();
    
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   POST /api/posts/:postId/comment/:commentId/like
 * @desc    Like/unlike a comment
 * @access  Private
 */
router.post("/:postId/comment/:commentId/like", authenticateUser, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id; // From auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Find the comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user already liked the comment
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId.toString());
    
    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(userId);
      await post.save();
      return res.status(200).json({
        message: "Comment liked successfully",
        liked: true,
        likeCount: comment.likes.length
      });
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({
        message: "Comment unliked successfully",
        liked: false,
        likeCount: comment.likes.length
      });
    }
  } catch (error) {
    console.error("Error liking/unliking comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   GET /api/posts/explore/random
 * @desc    Get random posts for explore page
 * @access  Private
 */
router.get("/explore/random", authenticateUser, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get random public posts
    const posts = await Post.aggregate([
      { $match: { visibility: 'public', isArchived: false } },
      { $sample: { size: parseInt(limit) } },
      { $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: {
          _id: 1,
          caption: 1,
          media: 1,
          createdAt: 1,
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' },
          'user._id': 1,
          'user.username': 1,
          'user.profilePicture': 1,
          'user.displayName': 1
        }
      }
    ]);
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;