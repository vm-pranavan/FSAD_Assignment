const Skill = require('./skillModel');
const User = require('../users/userModel');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Private
const getSkills = async (req, res, next) => {
  try {
    const { category, search, level, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (level) query.proficiencyLevel = level;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('offeredBy', 'name email avatar rating department')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      skills,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Private
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('offeredBy', 'name email avatar rating bio department year')
      .populate('seekers', 'name email avatar');

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, proficiencyLevel, tags } = req.body;

    const skill = await Skill.create({
      name,
      category,
      description,
      proficiencyLevel,
      offeredBy: req.user._id,
      tags: tags || []
    });

    // Add skill to user's offered skills
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { skillsOffered: skill._id }
    });

    const populated = await Skill.findById(skill._id)
      .populate('offeredBy', 'name email avatar rating');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (owner or admin)
const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check ownership
    if (skill.offeredBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this skill' });
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('offeredBy', 'name email avatar rating');

    res.json(skill);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (owner or admin)
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.offeredBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this skill' });
    }

    // Remove from user's offered skills
    await User.findByIdAndUpdate(skill.offeredBy, {
      $pull: { skillsOffered: skill._id }
    });

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill matches for current user
// @route   GET /api/skills/match
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    // Find skills wanted by the current user
    const currentUser = await User.findById(req.user._id).populate('skillsWanted');
    const wantedCategories = currentUser.skillsWanted.map(s => s.category);
    const wantedNames = currentUser.skillsWanted.map(s => s.name.toLowerCase());

    // Find skills offered by others that match what the user wants
    const matches = await Skill.find({
      offeredBy: { $ne: req.user._id },
      isActive: true,
      $or: [
        { category: { $in: wantedCategories } },
        { name: { $regex: wantedNames.join('|'), $options: 'i' } }
      ]
    })
    .populate('offeredBy', 'name email avatar rating department')
    .limit(10);

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// @desc    Express interest in a skill (add as seeker)
// @route   POST /api/skills/:id/interest
// @access  Private
const expressInterest = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.offeredBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot express interest in your own skill' });
    }

    // Add user to seekers and skill to user's wanted list
    await Skill.findByIdAndUpdate(req.params.id, {
      $addToSet: { seekers: req.user._id }
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { skillsWanted: skill._id }
    });

    res.json({ message: 'Interest expressed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories with counts
// @route   GET /api/skills/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Skill.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getMatches,
  expressInterest,
  getCategories
};
