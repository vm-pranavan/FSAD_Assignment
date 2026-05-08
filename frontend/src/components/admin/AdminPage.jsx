import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineTrash, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await userAPI.getAll(params);
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.update(userId, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const avatarColors = ['#6c5ce7', '#00cec9', '#fd79a8', '#00b894', '#e17055', '#0984e3'];

  return (
    <div className="page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title"><HiOutlineShieldCheck style={{ display: 'inline' }} /> Admin Panel</h1>
          <p className="page-subtitle">Manage users and platform settings</p>
        </div>

        <div className="admin-filters glass-card">
          <div className="filter-search">
            <HiOutlineSearch className="filter-icon" />
            <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} id="admin-search" />
          </div>
          <select className="select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} id="admin-role-filter">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="table-container glass-card">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Rating</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : users.length > 0 ? (
                users.map((u, i) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                          {getInitials(u.name)}
                        </div>
                        <span className="font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <select className="select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ padding: '6px 30px 6px 10px', fontSize: '0.75rem' }}>
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-muted">{u.department || '—'}</td>
                    <td>{u.rating > 0 ? `⭐ ${u.rating.toFixed(1)}` : '—'}</td>
                    <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-icon btn-secondary" onClick={() => handleDelete(u._id)} title="Delete" style={{ color: 'var(--accent-danger)' }}>
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center text-muted" style={{ padding: 40 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
