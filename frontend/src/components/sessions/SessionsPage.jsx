import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, skillAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineCheck, HiOutlineX, HiOutlineClock,
  HiOutlineCalendar, HiOutlineStar, HiOutlineLocationMarker,
  HiOutlineChat
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Sessions.css';

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [skills, setSkills] = useState([]);
  const [reviewData, setReviewData] = useState({ rating: 5, review: '' });
  const [createData, setCreateData] = useState({
    skillId: '', mentorId: '', scheduledDate: '', duration: 60, location: 'Online', notes: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchSkills();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await sessionAPI.getAll(params);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const { data } = await skillAPI.getAll({ limit: 100 });
      setSkills(data.skills.filter(s => s.offeredBy?._id !== user?._id));
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      await sessionAPI.update(sessionId, { status });
      toast.success(`Session ${status}!`);
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.create(createData);
      toast.success('Session requested! 🎉');
      setShowCreateModal(false);
      setCreateData({ skillId: '', mentorId: '', scheduledDate: '', duration: 60, location: 'Online', notes: '' });
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.addReview(selectedSession._id, reviewData);
      toast.success('Review submitted! ⭐');
      setShowReviewModal(false);
      setSelectedSession(null);
      setReviewData({ rating: 5, review: '' });
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const openReview = (session) => {
    setSelectedSession(session);
    setShowReviewModal(true);
  };

  const handleSkillSelect = (skillId) => {
    const skill = skills.find(s => s._id === skillId);
    setCreateData({
      ...createData,
      skillId,
      mentorId: skill?.offeredBy?._id || ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'accepted': case 'in-progress': return 'info';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const avatarColors = ['#6c5ce7', '#00cec9', '#fd79a8', '#00b894', '#e17055', '#0984e3'];

  return (
    <div className="page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">Manage your skill exchange sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="create-session-btn">
          <HiOutlinePlus /> Request Session
        </button>
      </div>

      {/* Filters */}
      <div className="session-tabs">
        {['', 'pending', 'accepted', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`session-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex flex-col gap-md">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }}></div>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <motion.div className="session-list" layout>
          <AnimatePresence>
            {sessions.map((session) => {
              const isMentor = session.mentor?._id === user?._id;
              const otherPerson = isMentor ? session.learner : session.mentor;
              const colorIdx = (otherPerson?.name?.length || 0) % avatarColors.length;

              return (
                <motion.div
                  key={session._id}
                  className="session-card glass-card"
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="session-card-main">
                    <div className="avatar avatar-lg" style={{ background: avatarColors[colorIdx] }}>
                      {getInitials(otherPerson?.name)}
                    </div>
                    <div className="session-info">
                      <div className="session-top">
                        <h3>{session.skill?.name || 'Unknown Skill'}</h3>
                        <span className={`badge badge-${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="session-role">
                        {isMentor ? '🎓 Teaching' : '📚 Learning from'}{' '}
                        <strong>{otherPerson?.name}</strong>
                      </p>
                      <div className="session-meta">
                        <span><HiOutlineCalendar /> {formatDate(session.scheduledDate)}</span>
                        <span><HiOutlineClock /> {session.duration} min</span>
                        <span><HiOutlineLocationMarker /> {session.location}</span>
                      </div>
                      {session.notes && (
                        <p className="session-notes"><HiOutlineChat /> {session.notes}</p>
                      )}
                      {session.rating && (
                        <div className="session-review">
                          <div className="stars">
                            {[1, 2, 3, 4, 5].map(s => (
                              <HiOutlineStar
                                key={s}
                                className={`star ${s <= session.rating ? '' : 'empty'}`}
                                style={s <= session.rating ? { fill: '#fdcb6e', color: '#fdcb6e' } : {}}
                              />
                            ))}
                          </div>
                          {session.review && <p className="review-text">"{session.review}"</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="session-actions">
                    {session.status === 'pending' && isMentor && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(session._id, 'accepted')}>
                          <HiOutlineCheck /> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(session._id, 'cancelled')}>
                          <HiOutlineX /> Decline
                        </button>
                      </>
                    )}
                    {session.status === 'accepted' && isMentor && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(session._id, 'completed')}>
                        <HiOutlineCheck /> Mark Complete
                      </button>
                    )}
                    {session.status === 'completed' && !session.rating && !isMentor && (
                      <button className="btn btn-primary btn-sm" onClick={() => openReview(session)}>
                        <HiOutlineStar /> Leave Review
                      </button>
                    )}
                    {session.status === 'pending' && !isMentor && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(session._id, 'cancelled')}>
                        <HiOutlineX /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No sessions found</h3>
          <p>Request a session to start learning from your peers!</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <HiOutlinePlus /> Request Session
          </button>
        </div>
      )}

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request a Session</h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setShowCreateModal(false)}><HiOutlineX /></button>
              </div>
              <form onSubmit={handleCreateSession}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label>Select Skill</label>
                    <select className="select" value={createData.skillId} onChange={(e) => handleSkillSelect(e.target.value)} required>
                      <option value="">Choose a skill...</option>
                      {skills.map(s => (
                        <option key={s._id} value={s._id}>{s.name} — by {s.offeredBy?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Date & Time</label>
                      <input type="datetime-local" className="input" value={createData.scheduledDate} onChange={e => setCreateData({...createData, scheduledDate: e.target.value})} required />
                    </div>
                    <div className="input-group">
                      <label>Duration (minutes)</label>
                      <select className="select" value={createData.duration} onChange={e => setCreateData({...createData, duration: parseInt(e.target.value)})}>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Location</label>
                    <input className="input" placeholder="e.g., Library Room 3, Online" value={createData.location} onChange={e => setCreateData({...createData, location: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Notes (optional)</label>
                    <textarea className="input" placeholder="What would you like to learn?" value={createData.notes} onChange={e => setCreateData({...createData, notes: e.target.value})} rows="3" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Send Request</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviewModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Leave a Review</h2>
                <button className="btn btn-icon btn-secondary" onClick={() => setShowReviewModal(false)}><HiOutlineX /></button>
              </div>
              <form onSubmit={handleReview}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label>Rating</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`rating-star ${s <= reviewData.rating ? 'active' : ''}`}
                          onClick={() => setReviewData({...reviewData, rating: s})}
                        >
                          <HiOutlineStar />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Your Review</label>
                    <textarea className="input" placeholder="How was the session?" value={reviewData.review} onChange={e => setReviewData({...reviewData, review: e.target.value})} rows="4" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionsPage;
