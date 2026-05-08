const express = require('express');
const router = express.Router();
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getMatches,
  expressInterest,
  getCategories
} = require('./skillController');
const { protect } = require('../../middleware/auth');

router.get('/match', protect, getMatches);
router.get('/categories', protect, getCategories);
router.get('/', protect, getSkills);
router.get('/:id', protect, getSkillById);
router.post('/', protect, createSkill);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);
router.post('/:id/interest', protect, expressInterest);

module.exports = router;
