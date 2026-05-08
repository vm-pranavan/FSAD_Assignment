import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, skillAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  HiOutlineLightBulb,
  HiOutlineCalendar,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const COLORS = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#00b894', '#e17055'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await sessionAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="dashboard-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }}></div>
          ))}
        </div>
      </div>
    );
  }

  const categoryData = stats?.categoryStats?.map((c) => ({
    name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : 'Other',
    value: c.count
  })) || [];

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div className="page-header" variants={item}>
          <h1 className="page-title">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your skill exchanges</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div className="grid grid-4 dashboard-stats" variants={item}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)', color: '#a29bfe' }}>
              <HiOutlineCalendar />
            </div>
            <div className="stat-value">{stats?.totalSessions || 0}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 184, 148, 0.15)', color: '#55efc4' }}>
              <HiOutlineCheck />
            </div>
            <div className="stat-value">{stats?.completedSessions || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.15)', color: '#fdcb6e' }}>
              <HiOutlineClock />
            </div>
            <div className="stat-value">{stats?.pendingSessions || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 206, 201, 0.15)', color: '#00cec9' }}>
              <HiOutlineLightBulb />
            </div>
            <div className="stat-value">{stats?.totalSkillsOffered || 0}</div>
            <div className="stat-label">Skills Offered</div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <motion.div className="grid grid-2 dashboard-charts" variants={item}>
          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Session Categories</h3>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#6c6c8a" fontSize={12} />
                  <YAxis stroke="#6c6c8a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a3e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#6c5ce7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>No session data yet. Start exchanging skills!</p>
              </div>
            )}
          </div>

          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3>Category Distribution</h3>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a3e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>Category data will appear as you complete sessions</p>
              </div>
            )}
            {categoryData.length > 0 && (
              <div className="chart-legend">
                {categoryData.map((entry, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Row */}
        <motion.div className="grid grid-2 dashboard-bottom" variants={item}>
          {/* Recent Sessions */}
          <div className="glass-card">
            <div className="card-header">
              <h3>Recent Sessions</h3>
              <Link to="/sessions" className="card-link">
                View all <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="recent-list">
              {stats?.recentSessions?.length > 0 ? (
                stats.recentSessions.map((session) => (
                  <div key={session._id} className="recent-item">
                    <div className="recent-info">
                      <p className="recent-title">{session.skill?.name}</p>
                      <p className="recent-meta">
                        with {session.mentor?.name === user?.name ? session.learner?.name : session.mentor?.name}
                      </p>
                    </div>
                    <span className={`badge badge-${session.status === 'completed' ? 'success' : session.status === 'pending' ? 'warning' : 'info'}`}>
                      {session.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p className="text-sm text-muted">No sessions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Mentors */}
          <div className="glass-card">
            <div className="card-header">
              <h3>Top Mentors</h3>
              <Link to="/skills" className="card-link">
                Explore <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="recent-list">
              {stats?.topMentors?.length > 0 ? (
                stats.topMentors.map((mentor, index) => {
                  const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#00b894', '#e17055'];
                  return (
                    <div key={mentor._id} className="recent-item">
                      <div className="flex items-center gap-md">
                        <div className="avatar" style={{ background: colors[index % colors.length] }}>
                          {mentor.name?.charAt(0)}
                        </div>
                        <div className="recent-info">
                          <p className="recent-title">{mentor.name}</p>
                          <p className="recent-meta">{mentor.department || 'Campus Member'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sm">
                        <HiOutlineStar style={{ color: '#fdcb6e' }} />
                        <span className="font-bold">{mentor.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p className="text-sm text-muted">No mentors rated yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
