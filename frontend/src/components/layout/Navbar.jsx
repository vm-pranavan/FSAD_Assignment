import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMenu,
} from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/skills?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const avatarColors = ['#6c5ce7', '#00cec9', '#fd79a8', '#00b894', '#e17055', '#0984e3'];
  const colorIndex = user?.name?.length % avatarColors.length || 0;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" id="mobile-menu-btn">
          <HiOutlineMenu />
        </button>
        <form className="search-form" onSubmit={handleSearch}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search skills, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="global-search"
          />
        </form>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" id="notifications-btn" title="Notifications">
          <HiOutlineBell />
          <span className="notification-dot"></span>
        </button>

        <div className="user-menu" ref={menuRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setShowMenu(!showMenu)}
            id="user-menu-trigger"
          >
            <div
              className="avatar avatar-sm"
              style={{ background: avatarColors[colorIndex] }}
            >
              {getInitials(user?.name)}
            </div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="user-dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="dropdown-header">
                  <div
                    className="avatar"
                    style={{ background: avatarColors[colorIndex] }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  <HiOutlineUser /> Profile
                </Link>
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowMenu(false)}
                >
                  <HiOutlineCog /> Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <HiOutlineLogout /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
