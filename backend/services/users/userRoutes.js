const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('./userController');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
