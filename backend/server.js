const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = express();
const PORT = process.env.PORT || 3005; // Changed to 3005 to avoid conflicts

// Models (now imported from their separate files)
const User = require('./models/User');
const Post = require('./models/Post');

// Route imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const contentRoutes = require('./routes/contentRoutes');

// Set up MongoDB Memory Server and connect
async function setupDatabase() {
  try {
    // Create MongoDB Memory Server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Memory Server at', mongoUri);
    return mongoServer;
  } catch (err) {
    console.error('MongoDB setup error:', err);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend')));

// CORS handling (if needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/content', contentRoutes);

// Initialize DB with sample data if empty
async function initializeDb() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Initializing database with sample data...');
      
      // Create admin user
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$3Cl9H3Gym6SSVEABqIsYAOfFyH/eFhGFRLBmDtbXkVWKj97JOiKsK', // hashed 'password123'
        role: 'admin',
        joined: new Date('2025-01-15'),
        posts: 5,
        comments: 10,
        reputation: 500,
        bio: 'System administrator',
        activity: [
          {
            type: 'post',
            title: 'Welcome to the Portal',
            content: 'This is the official launch of our new User Admin Portal!',
            timestamp: new Date(Date.now() - 604800000),
            link: '/posts/welcome-to-the-portal'
          }
        ]
      });
      
      // Create regular user
      const regularUser = new User({
        username: 'user1',
        email: 'user1@example.com',
        password: '$2b$10$3Cl9H3Gym6SSVEABqIsYAOfFyH/eFhGFRLBmDtbXkVWKj97JOiKsK', // hashed 'password123'
        role: 'user',
        joined: new Date('2025-03-15'),
        posts: 2,
        comments: 8,
        reputation: 25,
        bio: 'Regular community member',
        activity: [
          {
            type: 'comment',
            title: 'Game Design Principles',
            content: 'I think this is a great approach to procedural generation!',
            timestamp: new Date(Date.now() - 7200000),
            link: '/posts/game-design-principles'
          },
          {
            type: 'post',
            title: 'Implementing User Profiles',
            content: 'Started a new discussion about profile systems in web applications.',
            timestamp: new Date(Date.now() - 86400000),
            link: '/posts/implementing-user-profiles'
          }
        ]
      });
      
      const moderatorUser = new User({
        username: 'moderator',
        email: 'mod@example.com',
        password: '$2b$10$3Cl9H3Gym6SSVEABqIsYAOfFyH/eFhGFRLBmDtbXkVWKj97JOiKsK', // hashed 'password123'
        role: 'moderator',
        joined: new Date('2025-02-10'),
        posts: 15,
        comments: 35,
        reputation: 250,
        bio: 'Community moderator',
        activity: []
      });
      
      await Promise.all([
        adminUser.save(),
        regularUser.save(),
        moderatorUser.save()
      ]);
      
      // Create some initial posts
      const welcomePost = new Post({
        title: 'Welcome to the Forums',
        content: '## Hello Everyone!\n\nWelcome to our new community platform. This is a place where we can all collaborate, share ideas, and help each other.\n\n**Key features:**\n\n- User profiles\n- Forum discussions\n- Content management\n- Integrated editing with preview mode\n\nFeel free to introduce yourself in the comments below!',
        author: adminUser._id,
        category: 'announcements',
        tags: ['welcome', 'introduction', 'community'],
        timestamp: new Date(Date.now() - 604800000),
        status: 'published',
        comments: [
          {
            content: 'Great to be here! Looking forward to all the discussions.',
            author: regularUser._id,
            timestamp: new Date(Date.now() - 520000000),
            votes: 5
          }
        ]
      });
      
      const editingPost = new Post({
        title: 'Edit and Preview in the Same Window',
        content: '## The Challenge\n\nWhen creating a content editor, one common challenge is how to handle the edit and preview modes. Many editors use separate tabs or windows, but this can disrupt the user experience.\n\n**Benefits of a shared window:**\n\n- Maintains spatial context\n- Reduces UI clutter\n- Provides immediate feedback\n- Streamlines the editing workflow\n\nOur implementation uses visual indicators and keyboard shortcuts (Ctrl+P) to toggle between modes while keeping everything in the same place.',
        author: moderatorUser._id,
        category: 'user-experience',
        tags: ['editor', 'ux', 'interface-design'],
        timestamp: new Date(Date.now() - 300000000),
        status: 'published',
        comments: [
          {
            content: 'I love this approach! It really helps maintain context when editing.',
            author: regularUser._id,
            timestamp: new Date(Date.now() - 250000000),
            votes: 3
          },
          {
            content: 'Have you considered how this would work on mobile with limited screen space?',
            author: adminUser._id,
            timestamp: new Date(Date.now() - 200000000),
            votes: 2
          }
        ]
      });
      
      const userProfilesPost = new Post({
        title: 'Implementing User Profiles',
        content: 'User profiles are essential for building community engagement. Here\'s how we approach user profiles in our system:\n\n1. **Activity tracking** - Posts, comments, and interactions\n2. **Reputation system** - Based on community contributions\n3. **Customization** - Allow users to personalize their experience\n4. **Privacy controls** - Give users control over their information\n\nWhat features do you think are most important for user profiles?',
        author: regularUser._id,
        category: 'development',
        tags: ['profiles', 'community', 'user-experience'],
        timestamp: new Date(Date.now() - 86400000),
        status: 'published'
      });
      
      await Promise.all([
        welcomePost.save(),
        editingPost.save(),
        userProfilesPost.save()
      ]);
      
      console.log('Sample data initialized successfully');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the application
async function startApp() {
  // Setup database first
  const mongoServer = await setupDatabase();
  
  // Initialize sample data
  await initializeDb();
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
    
    // Add shutdown handler to close MongoDB connection
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
      console.log('MongoDB memory server stopped');
      process.exit(0);
    });
  });
}

// Start the application
startApp();
