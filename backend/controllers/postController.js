const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, category, contentType, status } = req.body;
    const authorId = req.user._id;

    // Create new post
    const post = new Post({
      title,
      content,
      author: authorId,
      tags: tags || [],
      category: category || 'general',
      contentType: contentType || 'markdown',
      status: status || 'published'
    });

    const savedPost = await post.save();

    // Update user's post count
    await User.findByIdAndUpdate(authorId, { $inc: { posts: 1 } });

    // Add to user's activity
    await User.findByIdAndUpdate(authorId, {
      $push: {
        activity: {
          type: 'post',
          title: savedPost.title,
          content: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
          timestamp: new Date(),
          link: `/forum/posts/${savedPost._id}`
        }
      }
    });

    // Populate author info
    const populatedPost = await Post.findById(savedPost._id).populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, author, status = 'published' } = req.query;
    
    // Build query
    const query = { status };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await Post.countDocuments(query);
    
    // Fetch posts
    const posts = await Post.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username avatar')
      .lean();
      
    // Add comment count to each post
    const postsWithCommentCount = posts.map(post => ({
      ...post,
      commentCount: post.comments?.length || 0
    }));
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      posts: postsWithCommentCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single post by ID or slug
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Determine if we're looking up by ID or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(postId);
    
    // Build query depending on the type of identifier
    const query = isObjectId ? { _id: postId } : { slug: postId };
    
    // Find and populate post
    const post = await Post.findOne(query)
      .populate('author', 'username avatar reputation')
      .populate('comments.author', 'username avatar reputation');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await post.incrementViews();
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, tags, category, status, revisionReason } = req.body;
    const userId = req.user._id;
    
    // Find post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is author or has admin/moderator privileges
    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    
    if (!isAuthor && !isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    
    // Add revision if content changed
    if (content && content !== post.content) {
      await post.addRevision(content, userId, revisionReason || 'Post updated');
    }
    
    // Update post fields
    if (title) post.title = title;
    if (tags) post.tags = tags;
    if (category) post.category = category;
    if (status && (isAdmin || isModerator)) post.status = status;
    
    await post.save();
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    // Find post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is author or has admin privileges
    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    // If moderator, only allow changing status to archived
    const isModerator = req.user.role === 'moderator';
    if (isModerator && !isAuthor) {
      post.status = 'archived';
      await post.save();
      
      return res.status(200).json({
        success: true,
        message: 'Post has been archived'
      });
    }
    
    // Delete post
    await Post.deleteOne({ _id: postId });
    
    // Update user's post count
    await User.findByIdAndUpdate(post.author, { $inc: { posts: -1 } });
    
    res.status(200).json({
      success: true,
      message: 'Post has been deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Add comment
    post.comments.push({
      content,
      author: userId,
      timestamp: new Date(),
      votes: 0
    });
    
    await post.save();
    
    // Update user's comment count
    await User.findByIdAndUpdate(userId, { $inc: { comments: 1 } });
    
    // Add to user's activity
    await User.findByIdAndUpdate(userId, {
      $push: {
        activity: {
          type: 'comment',
          title: `Comment on: "${post.title}"`,
          content: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
          timestamp: new Date(),
          link: `/forum/posts/${postId}`
        }
      }
    });
    
    // Get the updated post with populated author
    const updatedPost = await Post.findById(postId)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');
    
    res.status(201).json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vote on a post
exports.votePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    const userId = req.user._id;
    
    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user has already voted
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);
    
    // Update votes based on current status and vote type
    if (voteType === 'up') {
      if (hasUpvoted) {
        // Remove upvote
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
        post.votes -= 1;
      } else {
        // Add upvote
        post.upvotes.push(userId);
        post.votes += 1;
        
        // Remove downvote if exists
        if (hasDownvoted) {
          post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
          post.votes += 1; // Adjust for removed downvote
        }
      }
    } else if (voteType === 'down') {
      if (hasDownvoted) {
        // Remove downvote
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
        post.votes += 1;
      } else {
        // Add downvote
        post.downvotes.push(userId);
        post.votes -= 1;
        
        // Remove upvote if exists
        if (hasUpvoted) {
          post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
          post.votes -= 1; // Adjust for removed upvote
        }
      }
    }
    
    await post.save();
    
    // Update author's reputation
    const reputationChange = voteType === 'up' ? 1 : -1;
    await User.findByIdAndUpdate(post.author, { $inc: { reputation: reputationChange } });
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post categories
exports.getCategories = async (req, res) => {
  try {
    // Get all unique categories with post count
    const categories = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post tags
exports.getTags = async (req, res) => {
  try {
    // Get all unique tags with post count
    const tags = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 } // Limit to most popular tags
    ]);
    
    res.status(200).json({
      success: true,
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post revisions
exports.getRevisions = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find post
    const post = await Post.findById(postId)
      .populate('revisions.editor', 'username');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user has permissions to view revisions
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    
    if (!isAuthor && !isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to view revisions' });
    }
    
    res.status(200).json({
      success: true,
      revisions: post.revisions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get related posts
exports.getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Find posts with similar tags or category
    const relatedPosts = await Post.find({
      _id: { $ne: postId }, // Exclude current post
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ]
    })
    .limit(5)
    .sort({ timestamp: -1 })
    .select('title slug timestamp category tags')
    .lean();
    
    res.status(200).json({
      success: true,
      relatedPosts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
