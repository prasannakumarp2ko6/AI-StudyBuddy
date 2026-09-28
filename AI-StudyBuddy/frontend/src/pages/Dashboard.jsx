import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [materialsRes, plansRes] = await Promise.all([
        api.get('/material'),
        api.get('/ai/study-plan'),
      ]);
      setMaterials(materialsRes.data.data.materials);
      setStudyPlans(plansRes.data.data.studyPlans);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner label="Loading your dashboard..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
      <p className="muted">Here's a snapshot of your study activity.</p>
      <ErrorMessage message={error} onRetry={loadData} />

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{materials.length}</span>
          <span className="stat-label">Study Materials</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{studyPlans.length}</span>
          <span className="stat-label">Study Plans</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{user?.role}</span>
          <span className="stat-label">Account Type</span>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action" onClick={() => navigate('/materials/upload')}>
          ⬆️ Upload Material
        </button>
        <button className="quick-action" onClick={() => navigate('/materials')}>
          📚 View Materials
        </button>
        <button className="quick-action" onClick={() => navigate('/study-plan')}>
          🗓️ Create Study Plan
        </button>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Materials</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/materials')}>
            View all
          </button>
        </div>
        {materials.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No study materials yet"
            description="Upload your first set of notes to generate AI-powered study tools."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/materials/upload')}>
                Upload Material
              </button>
            }
          />
        ) : (
          <div className="card-grid">
            {materials.slice(0, 3).map((m) => (
              <div key={m._id} className="card" onClick={() => navigate(`/materials/${m._id}`)} style={{ cursor: 'pointer' }}>
                <h4>{m.title}</h4>
                <span className="badge">{m.subject}</span>
                <p className="muted" style={{ marginTop: '0.5rem' }}>
                  {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Study Plans</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/study-plan')}>
            View all
          </button>
        </div>
        {studyPlans.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No study plans yet"
            description="Generate a personalized study plan based on your exam date and goals."
          />
        ) : (
          <div className="card-grid">
            {studyPlans.slice(0, 3).map((p) => (
              <div key={p._id} className="card">
                <h4>{p.subject}</h4>
                <p className="muted">Exam: {new Date(p.examDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
