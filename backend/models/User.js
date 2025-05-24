const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['user', 'moderator', 'admin'], 
    default: 'user' 
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  joined: { 
    type: Date, 
    default: Date.now 
  },
  posts: { 
    type: Number, 
    default: 0 
  },
  comments: { 
    type: Number, 
    default: 0 
  },
  reputation: { 
    type: Number, 
    default: 0 
  },
  badges: [{
    name: String,
    icon: String,
    count: Number,
    dateAwarded: Date
  }],
  preferences: {
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'system'], 
      default: 'light' 
    },
    emailNotifications: { 
      type: Boolean, 
      default: true 
    },
    forumDigest: { 
      type: String, 
      enum: ['daily', 'weekly', 'never'], 
      default: 'weekly' 
    },
    editorPreference: {
      type: String,
      enum: ['markdown', 'richtext'],
      default: 'markdown'
    }
  },
  activity: [{
    type: { 
      type: String, 
      enum: ['comment', 'post', 'project'] 
    },
    title: String,
    content: String,
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    link: String
  }],
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Update lastActive timestamp on user activity
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Helper method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Helper method to check if user is moderator
userSchema.methods.isModerator = function() {
  return this.role === 'moderator' || this.role === 'admin';
};

module.exports = mongoose.model('User', userSchema);
