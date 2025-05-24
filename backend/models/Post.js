const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true
  },
  content: { 
    type: String, 
    required: true 
  },
  contentType: {
    type: String,
    enum: ['markdown', 'richtext', 'html'],
    default: 'markdown'
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: {
    type: String,
    default: 'general'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  viewCount: {
    type: Number,
    default: 0
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    content: { 
      type: String, 
      required: true 
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    votes: { 
      type: Number, 
      default: 0 
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  attachments: [{
    filename: String,
    originalname: String,
    path: String,
    mimetype: String,
    size: Number,
    uploaded: {
      type: Date,
      default: Date.now
    }
  }],
  revisions: [{
    content: String,
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }],
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  related: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

// Pre-save hook to generate slug from title
postSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Add unique identifier if this is a new document
    if (this.isNew) {
      this.slug = `${this.slug}-${Date.now().toString().slice(-4)}`;
    }
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  next();
});

// Method to increment view count
postSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add a revision
postSchema.methods.addRevision = async function(content, editor, reason) {
  this.revisions.push({
    content: this.content, // Save the current content as revision
    timestamp: new Date(),
    editor,
    reason
  });
  
  this.content = content; // Update the content
  return this.save();
};

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('Post', postSchema);
