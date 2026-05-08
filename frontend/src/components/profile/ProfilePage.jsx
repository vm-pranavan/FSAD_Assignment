import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, skillAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineStar, HiOutlineAcademicCap, HiOutlineMail, HiOutlineSave } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Profile.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        bio: data.bio || '',
        department: data.department || '',
        year: data.year || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await authAPI.updateProfile(formData);
      setProfile(data);
      updateUser(data);
      setIsEditing(false);
      toast.success('Profile updated! ✨');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 300, borderRadius: 16, marginBottom: 24 }}></div>
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }}></div>
      </div>
    );
  }

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Profile Header */}
        <div className="profile-header glass-card">
          <div className="profile-cover">
            <div className="profile-cover-gradient"></div>
          </div>
          <div className="profile-info">
            <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
              {getInitials(profile?.name)}
            </div>
            <div className="profile-details">
              <div className="flex justify-between items-center" style={{width: '100%'}}>
                <div>
                  <h1 className="profile-name">{profile?.name}</h1>
                  <div className="profile-badges">
                    <span className="badge badge-primary">{profile?.role}</span>
                    {profile?.department && (
                      <span className="badge badge-info"><HiOutlineAcademicCap /> {profile.department}</span>
                    )}
                    {profile?.year && <span className="badge badge-success">{profile.year}</span>}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <HiOutlinePencil /> {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div className="profile-stats-row">
                <div className="profile-stat">
                  <span className="profile-stat-value">{profile?.skillsOffered?.length || 0}</span>
                  <span className="profile-stat-label">Skills Offered</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">
                    {profile?.rating > 0 ? `${profile.rating.toFixed(1)} ⭐` : '—'}
                  </span>
                  <span className="profile-stat-label">Rating</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{profile?.totalReviews || 0}</span>
                  <span className="profile-stat-label">Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form / Bio Section */}
        <div className="grid grid-2" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>
              {isEditing ? 'Edit Profile' : 'About'}
            </h3>
            {isEditing ? (
              <div className="flex flex-col gap-md">
                <div className="input-group">
                  <label>Name</label>
                  <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <input className="input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Year</label>
                  <input className="input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Bio</label>
                  <textarea className="input" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows="4" />
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                  <HiOutlineSave /> Save Changes
                </button>
              </div>
            ) : (
              <div>
                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                  {profile?.bio || 'No bio yet. Click Edit Profile to add one!'}
                </p>
                <div className="profile-contact" style={{ marginTop: 'var(--space-lg)' }}>
                  <div className="flex items-center gap-sm text-muted">
                    <HiOutlineMail /> {profile?.email}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>Skills Offered</h3>
            {profile?.skillsOffered?.length > 0 ? (
              <div className="flex flex-col gap-sm">
                {profile.skillsOffered.map(skill => (
                  <div key={skill._id} className="profile-skill-item">
                    <div>
                      <p className="font-bold text-sm">{skill.name}</p>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>{skill.category} • {skill.proficiencyLevel}</p>
                    </div>
                    <span className={`badge badge-${skill.proficiencyLevel === 'expert' ? 'warning' : 'primary'}`}>
                      {skill.proficiencyLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">No skills offered yet. Visit Skills Hub to start sharing!</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
