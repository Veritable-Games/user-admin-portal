const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate, isModeratorOrAdmin } = require('../middleware/auth');

// Get all posts
router.get('/', postController.getPosts);

// Create a new post
router.post('/', authenticate, postController.createPost);

// Get post categories
router.get('/categories', postController.getCategories);

// Get post tags
router.get('/tags', postController.getTags);

// Get a single post by ID or slug
router.get('/:postId', postController.getPost);

// Update a post
router.put('/:postId', authenticate, postController.updatePost);

// Delete a post
router.delete('/:postId', authenticate, postController.deletePost);

// Add a comment to a post
router.post('/:postId/comments', authenticate, postController.addComment);

// Vote on a post
router.post('/:postId/vote', authenticate, postController.votePost);

// Get post revisions
router.get('/:postId/revisions', authenticate, postController.getRevisions);

// Get related posts
router.get('/:postId/related', postController.getRelatedPosts);

module.exports = router;
