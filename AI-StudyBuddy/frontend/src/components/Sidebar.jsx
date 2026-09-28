import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/materials', label: 'Study Materials', icon: '📚' },
  { to: '/materials/upload', label: 'Upload Material', icon: '⬆️' },
  { to: '/study-plan', label: 'Study Plan', icon: '🗓️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Manage Users', icon: '🧑‍🤝‍🧑' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'Admin' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar">
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
