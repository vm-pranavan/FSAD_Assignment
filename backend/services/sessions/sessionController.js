const Session = require('./sessionModel');
const User = require('../users/userModel');
const Skill = require('../skills/skillModel');

// @desc    Get all sessions for current user
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const query = {};

    // Filter by user role in session
    if (role === 'mentor') {
      query.mentor = req.user._id;
    } else if (role === 'learner') {
      query.learner = req.user._id;
    } else {
      query.$or = [
        { mentor: req.user._id },
        { learner: req.user._id }
      ];
    }

    if (status) query.status = status;

    // Admin can see all sessions
    if (req.user.role === 'admin' && req.query.all === 'true') {
      delete query.$or;
      delete query.mentor;
      delete query.learner;
    }

    const total = await Session.countDocuments(query);
    const sessions = await Session.find(query)
      .populate('mentor', 'name email avatar rating')
      .populate('learner', 'name email avatar')
      .populate('skill', 'name category proficiencyLevel')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ scheduledDate: -1 });

    res.json({
      sessions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name email avatar rating bio')
      .populate('learner', 'name email avatar bio')
      .populate('skill', 'name category description proficiencyLevel');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new session (request)
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const { skillId, mentorId, scheduledDate, duration, location, notes } = req.body;

    // Verify skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Cannot request session with yourself
    if (mentorId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create a session with yourself' });
    }

    // Check for overlapping sessions
    const existingSession = await Session.findOne({
      $or: [{ mentor: mentorId }, { learner: req.user._id }],
      scheduledDate: new Date(scheduledDate),
      status: { $in: ['pending', 'accepted', 'in-progress'] }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'There is already a session scheduled at this time' });
    }

    const session = await Session.create({
      mentor: mentorId,
      learner: req.user._id,
      skill: skillId,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      location: location || 'Online',
      notes: notes || ''
    });

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name email avatar')
      .populate('learner', 'name email avatar')
      .populate('skill', 'name category');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only mentor can accept/reject, both can cancel
    const { status, scheduledDate, duration, location, notes } = req.body;

    if (status === 'accepted' || status === 'in-progress') {
      if (session.mentor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the mentor can accept sessions' });
      }
    }

    if (status) session.status = status;
    if (scheduledDate) session.scheduledDate = new Date(scheduledDate);
    if (duration) session.duration = duration;
    if (location) session.location = location;
    if (notes !== undefined) session.notes = notes;

    await session.save();

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name email avatar')
      .populate('learner', 'name email avatar')
      .populate('skill', 'name category');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to session
// @route   POST /api/sessions/:id/review
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }

    if (session.rating) {
      return res.status(400).json({ message: 'Session already reviewed' });
    }

    session.rating = rating;
    session.review = review;
    session.reviewedBy = req.user._id;
    await session.save();

    // Update mentor's average rating
    const mentorSessions = await Session.find({
      mentor: session.mentor,
      rating: { $exists: true, $ne: null }
    });

    const avgRating = mentorSessions.reduce((acc, s) => acc + s.rating, 0) / mentorSessions.length;

    await User.findByIdAndUpdate(session.mentor, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: mentorSessions.length
    });

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name email avatar rating')
      .populate('learner', 'name email avatar')
      .populate('skill', 'name category');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/sessions/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalSessions,
      completedSessions,
      pendingSessions,
      activeSessions,
      totalSkillsOffered,
      recentSessions,
      topMentors
    ] = await Promise.all([
      Session.countDocuments({
        $or: [{ mentor: userId }, { learner: userId }]
      }),
      Session.countDocuments({
        $or: [{ mentor: userId }, { learner: userId }],
        status: 'completed'
      }),
      Session.countDocuments({
        $or: [{ mentor: userId }, { learner: userId }],
        status: 'pending'
      }),
      Session.countDocuments({
        $or: [{ mentor: userId }, { learner: userId }],
        status: { $in: ['accepted', 'in-progress'] }
      }),
      (await User.findById(userId)).skillsOffered.length,
      Session.find({
        $or: [{ mentor: userId }, { learner: userId }]
      })
        .populate('mentor', 'name avatar')
        .populate('learner', 'name avatar')
        .populate('skill', 'name category')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ rating: { $gt: 0 } })
        .select('name avatar rating totalReviews department')
        .sort({ rating: -1 })
        .limit(5)
    ]);

    // Category distribution
    const categoryStats = await Session.aggregate([
      {
        $match: {
          $or: [
            { mentor: userId },
            { learner: userId }
          ]
        }
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skill',
          foreignField: '_id',
          as: 'skillData'
        }
      },
      { $unwind: '$skillData' },
      {
        $group: {
          _id: '$skillData.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalSessions,
      completedSessions,
      pendingSessions,
      activeSessions,
      totalSkillsOffered,
      recentSessions,
      topMentors,
      categoryStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  addReview,
  getDashboardStats
};
