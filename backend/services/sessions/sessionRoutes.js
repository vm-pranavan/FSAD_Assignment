const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  addReview,
  getDashboardStats
} = require('./sessionController');
const { protect } = require('../../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/', protect, getSessions);
router.get('/:id', protect, getSessionById);
router.post('/', protect, createSession);
router.put('/:id', protect, updateSession);
router.post('/:id/review', protect, addReview);

module.exports = router;
