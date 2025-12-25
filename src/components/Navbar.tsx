import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import "../styles/Navbar.css";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = () => {
    setShowMenu(false);
    
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>
          Are you sure you want to logout?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              logout();
              toast.dismiss(t.id);
              toast.success("Logged out successfully! See you soon 👋");
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Yes, Logout
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🎤</div>
        <div className="brand-info">
          <h1 className="brand-name">Voice to Text</h1>
          <p className="brand-tag">AI-Powered</p>
        </div>
      </div>

      <div className="navbar-right" ref={menuRef}>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span className="status-text">Online</span>
        </div>

        <div className="user-section" onClick={() => setShowMenu(!showMenu)}>
          <div className="user-avatar">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Premium User</span>
          </div>
          <button className="menu-toggle">
            {showMenu ? "✕" : "☰"}
          </button>
        </div>

        {showMenu && (
          <div className="user-menu">
            <div className="menu-item" onClick={() => {
              setShowMenu(false);
              toast.success("Profile feature coming soon! 🚀");
            }}>
              <span>👤</span>
              <span>Profile</span>
            </div>
            <div className="menu-item" onClick={() => {
              setShowMenu(false);
              toast.success("Settings feature coming soon! ⚙️");
            }}>
              <span>⚙️</span>
              <span>Settings</span>
            </div>
            <div className="menu-divider"></div>
            <div className="menu-item danger" onClick={handleLogout}>
              <span>🚪</span>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
