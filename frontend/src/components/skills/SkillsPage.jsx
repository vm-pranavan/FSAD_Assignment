import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { skillAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlineX,
  HiOutlineStar, HiOutlineCode, HiOutlineMusicNote, HiOutlinePencil,
  HiOutlineAcademicCap, HiOutlineGlobe, HiOutlineSparkles, HiOutlineTrash,
  HiOutlinePencilAlt
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Skills.css';

const categoryIcons = {
  technology: HiOutlineCode,
  design: HiOutlinePencil,
  music: HiOutlineMusicNote,
  language: HiOutlineGlobe,
  academic: HiOutlineAcademicCap,
  sports: HiOutlineStar,
  other: HiOutlineSparkles,
};

const categoryColors = {
  technology: '#6c5ce7',
  design: '#fd79a8',
  music: '#fdcb6e',
  language: '#00cec9',
  academic: '#00b894',
  sports: '#e17055',
  other: '#a29bfe',
};

const SkillsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'technology', description: '', proficiencyLevel: 'intermediate', tags: ''
  });

  useEffect(() => {
    fetchSkills();
  }, [category, level]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSkills(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSkills = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (level) params.level = level;
      const { data } = await skillAPI.getAll(params);
      setSkills(data.skills);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (editingSkill) {
        await skillAPI.update(editingSkill._id, payload);
        toast.success('Skill updated!');
      } else {
        await skillAPI.create(payload);
        toast.success('Skill created! 🎉');
      }
      closeModal();
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillAPI.delete(id);
      toast.success('Skill deleted');
      fetchSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description,
      proficiencyLevel: skill.proficiencyLevel,
      tags: skill.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSkill(null);
    setFormData({ name: '', category: 'technology', description: '', proficiencyLevel: 'intermediate', tags: '' });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Skills Hub</h1>
          <p className="page-subtitle">Discover and share skills with your campus community</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-skill-btn">
          <HiOutlinePlus /> Offer a Skill
        </button>
      </div>

      {/* Filters */}
      <div className="skills-filters glass-card">
        <div className="filter-search">
          <HiOutlineSearch className="filter-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="skill-search"
          />
        </div>
        <div className="filter-selects">
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} id="category-filter">
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="music">Music</option>
            <option value="language">Language</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
          <select className="select" value={level} onChange={(e) => setLevel(e.target.value)} id="level-filter">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }}></div>
          ))}
        </div>
      ) : skills.length > 0 ? (
        <motion.div className="grid grid-3" layout>
          <AnimatePresence>
            {skills.map((skill) => {
              const Icon = categoryIcons[skill.category] || HiOutlineSparkles;
              const color = categoryColors[skill.category] || '#a29bfe';
              const isOwner = skill.offeredBy?._id === user?._id;

              return (
                <motion.div
                  key={skill._id}
                  className="skill-card glass-card"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="skill-card-header">
                    <div className="skill-icon" style={{ background: `${color}20`, color }}>
                      <Icon />
                    </div>
                    <span className="badge badge-primary" style={{ background: `${color}20`, color }}>
                      {skill.category}
                    </span>
                  </div>

                  <h3 className="skill-name">{skill.name}</h3>
                  <p className="skill-description">{skill.description}</p>

                  <div className="skill-tags">
                    {skill.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                    {skill.tags?.length > 3 && (
                      <span className="tag">+{skill.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="skill-footer">
                    <div className="skill-mentor">
                      <div className="avatar avatar-sm" style={{ background: color }}>
                        {getInitials(skill.offeredBy?.name)}
                      </div>
                      <div>
                        <p className="mentor-name">{skill.offeredBy?.name}</p>
                        <div className="flex items-center gap-sm">
                          <span className={`badge badge-${skill.proficiencyLevel === 'expert' ? 'warning' : skill.proficiencyLevel === 'advanced' ? 'success' : 'info'}`} style={{fontSize: '0.65rem'}}>
                            {skill.proficiencyLevel}
                          </span>
                          {skill.offeredBy?.rating > 0 && (
                            <span className="text-sm text-muted">
                              ⭐ {skill.offeredBy.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="skill-actions">
                        <button className="btn btn-icon btn-secondary" onClick={() => openEdit(skill)} title="Edit">
                          <HiOutlinePencilAlt />
                        </button>
                        <button className="btn btn-icon btn-secondary" onClick={() => handleDelete(skill._id)} title="Delete" style={{color: 'var(--accent-danger)'}}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No skills found</h3>
          <p>Try adjusting your search or filters, or be the first to offer a skill!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Offer a Skill
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingSkill ? 'Edit Skill' : 'Offer a New Skill'}</h2>
                <button className="btn btn-icon btn-secondary" onClick={closeModal}>
                  <HiOutlineX />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="input-group">
                    <label>Skill Name</label>
                    <input
                      className="input"
                      placeholder="e.g., React.js Development"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Category</label>
                      <select className="select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        <option value="technology">Technology</option>
                        <option value="design">Design</option>
                        <option value="music">Music</option>
                        <option value="language">Language</option>
                        <option value="academic">Academic</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Proficiency Level</label>
                      <select className="select" value={formData.proficiencyLevel} onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value })}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      className="input"
                      placeholder="Describe what you can teach..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Tags (comma separated)</label>
                    <input
                      className="input"
                      placeholder="e.g., react, frontend, javascript"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingSkill ? 'Save Changes' : 'Create Skill'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsPage;
