import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <h1>Profile</h1>
      <div className="card profile-card">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p className="muted">{user?.email}</p>
          <span className="badge">{user?.role}</span>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
