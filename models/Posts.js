const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  publicId: {
    type: String,
    default: null
  },
  width: Number,
  height: Number,
  duration: Number
});

const PostSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  media: [MediaSchema],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PostSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

PostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ 'likes': 1 });
PostSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Post', PostSchema);