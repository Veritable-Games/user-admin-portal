const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get content for homepage
router.get('/home', contentController.getHomeContent);

// Search content
router.get('/search', contentController.searchContent);

// Get dashboard stats (admin only)
router.get('/dashboard-stats', authenticate, isAdmin, contentController.getDashboardStats);

// Get editor settings and content type information
router.get('/content-types/:id', contentController.getContentTypeSettings);

// Get user activity feed
router.get('/user-activity/:userId', contentController.getUserActivity);

// Get featured content for homepage
router.get('/featured', contentController.getFeaturedContent);

module.exports = router;
