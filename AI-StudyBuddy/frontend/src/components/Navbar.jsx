import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate(user ? '/dashboard' : '/')}>
        🎓 <span>AI StudyBuddy</span>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/profile')}>
              Profile
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
