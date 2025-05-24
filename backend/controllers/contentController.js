const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

// Get content for homepage (recent posts, popular posts, active users)
exports.getHomeContent = async (req, res) => {
  try {
    // Get recent posts
    const recentPosts = await Post.find({ status: 'published' })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('author', 'username avatar')
      .lean();
      
    // Get popular posts (by view count)
    const popularPosts = await Post.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(5)
      .populate('author', 'username avatar')
      .lean();
      
    // Get active users
    const activeUsers = await User.find()
      .sort({ lastActive: -1 })
      .limit(5)
      .select('username avatar reputation posts comments lastActive')
      .lean();
      
    // Get post counts by category
    const categoryStats = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Add comment counts to posts
    const postsWithComments = (posts) => posts.map(post => ({
      ...post,
      commentCount: post.comments?.length || 0
    }));
    
    res.status(200).json({
      success: true,
      data: {
        recentPosts: postsWithComments(recentPosts),
        popularPosts: postsWithComments(popularPosts),
        activeUsers,
        categoryStats: categoryStats.map(cat => ({
          name: cat._id,
          count: cat.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search content
exports.searchContent = async (req, res) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = {};
    
    // Search in posts if type is not specified or includes 'posts'
    if (!type || type === 'posts' || type === 'all') {
      results.posts = await Post.find({
        status: 'published',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(parseInt(limit))
      .sort({ timestamp: -1 })
      .populate('author', 'username')
      .select('title content slug category tags timestamp author')
      .lean();
    }
    
    // Search in users if type is not specified or includes 'users'
    if (!type || type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(parseInt(limit))
      .select('username avatar bio joined posts comments reputation')
      .lean();
    }
    
    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats for admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const [userCount, postCount, commentCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.aggregate([
        { $unwind: '$comments' },
        { $count: 'total' }
      ])
    ]);
    
    // Calculate new posts/users in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [newUsers24h, newPosts24h] = await Promise.all([
      User.countDocuments({ joined: { $gte: oneDayAgo } }),
      Post.countDocuments({ timestamp: { $gte: oneDayAgo } })
    ]);
    
    // Calculate new comments in last 24 hours
    const newComments24h = await Post.aggregate([
      { $unwind: '$comments' },
      { $match: { 'comments.timestamp': { $gte: oneDayAgo } } },
      { $count: 'total' }
    ]);
    
    // Get flagged content (posts with negative votes)
    const flaggedContent = await Post.find({ votes: { $lt: -5 } })
      .count();
    
    // Get pending approvals (draft posts from non-admin users)
    const pendingApprovals = await Post.find({
      status: 'draft',
      author: { $nin: await User.find({ role: 'admin' }).select('_id') }
    }).count();
    
    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        newUsers24h,
        posts: postCount,
        newPosts24h,
        comments: commentCount.length ? commentCount[0].total : 0,
        newComments24h: newComments24h.length ? newComments24h[0].total : 0,
        flaggedContent,
        pendingApprovals
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get editor settings and content type information
exports.getContentTypeSettings = (req, res) => {
  try {
    const { id } = req.params;
    
    // This would normally fetch from a database, but for demo we'll return mock data
    res.json({
      id,
      type: 'markdown', // or 'richtext', 'html'
      canEdit: true,
      editMode: {
        supportsPreview: true,
        previewShortcut: 'Ctrl+P',
        features: [
          'headings',
          'bold',
          'italic',
          'lists',
          'links',
          'images',
          'tables',
          'code'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user activity feed
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's posts
    const posts = await Post.find({ author: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('title slug timestamp category tags status')
      .lean();
    
    // Get user's comments by aggregating across all posts
    const commentActivity = await Post.aggregate([
      { $match: { 'comments.author': mongoose.Types.ObjectId(userId) } },
      { $unwind: '$comments' },
      { $match: { 'comments.author': mongoose.Types.ObjectId(userId) } },
      { $sort: { 'comments.timestamp': -1 } },
      { $limit: 10 },
      { $project: {
        _id: 1,
        title: 1,
        slug: 1,
        commentId: '$comments._id',
        commentContent: '$comments.content',
        commentTimestamp: '$comments.timestamp'
      }}
    ]);
    
    // Combine activities and sort by timestamp
    const combinedActivity = [
      ...posts.map(post => ({
        type: 'post',
        title: post.title,
        slug: post.slug,
        timestamp: post.timestamp,
        category: post.category,
        tags: post.tags,
        status: post.status
      })),
      ...commentActivity.map(comment => ({
        type: 'comment',
        postTitle: comment.title,
        postSlug: comment.slug,
        postId: comment._id,
        content: comment.commentContent,
        timestamp: comment.commentTimestamp
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({
      success: true,
      activity: combinedActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured content for homepage
exports.getFeaturedContent = async (req, res) => {
  try {
    // Get featured posts (could be based on a featured flag, but we'll use view count for demo)
    const featuredPosts = await Post.find({ status: 'published' })
      .sort({ viewCount: -1, votes: -1 })
      .limit(3)
      .populate('author', 'username avatar')
      .lean();
    
    // Add excerpt for each post
    const postsWithExcerpts = featuredPosts.map(post => ({
      ...post,
      excerpt: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      commentCount: post.comments.length
    }));
    
    res.status(200).json({
      success: true,
      featuredContent: postsWithExcerpts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
