import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineLightBulb,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSparkles
} from 'react-icons/hi';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/skills', label: 'Skills Hub', icon: HiOutlineLightBulb },
  { path: '/sessions', label: 'Sessions', icon: HiOutlineCalendar },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

const adminItems = [
  { path: '/admin', label: 'Admin Panel', icon: HiOutlineUsers },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const allItems = user?.role === 'admin' ? [...menuItems, ...adminItems] : menuItems;

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          <div className="logo-icon">
            <HiOutlineSparkles />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="logo-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                SkillSwap
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {allItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              {isActive && (
                <motion.div
                  className="sidebar-active-bg"
                  layoutId="sidebar-active"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
              <Icon className="sidebar-icon" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
