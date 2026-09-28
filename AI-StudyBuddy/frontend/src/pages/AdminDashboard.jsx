import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api, { getErrorMessage } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage message={error} onRetry={load} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Admin Dashboard</h1>
      <p className="muted">Application-wide usage statistics.</p>

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-number">{stats.totalUsers}</span><span className="stat-label">Total Users</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalStudents}</span><span className="stat-label">Students</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalAdmins}</span><span className="stat-label">Admins</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalMaterials}</span><span className="stat-label">Study Materials</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalSummaries}</span><span className="stat-label">Summaries</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalFlashcards}</span><span className="stat-label">Flashcards</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalQuizzes}</span><span className="stat-label">Quizzes</span></div>
        <div className="stat-card"><span className="stat-number">{stats.totalStudyPlans}</span><span className="stat-label">Study Plans</span></div>
      </div>

      <div className="dashboard-section">
        <h2>Recently Joined Users</h2>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
