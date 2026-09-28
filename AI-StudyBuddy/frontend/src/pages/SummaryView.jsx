import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api, { getErrorMessage } from '../services/api';

export default function SummaryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/material/${id}`);
        setMaterial(res.data.data.material);
        setSummary(res.data.data.summary);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Summary: {material.title}</h1>
      {!summary ? (
        <EmptyState
          icon="📝"
          title="No summary generated yet"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/materials/${id}`)}>
              Go back and generate one
            </button>
          }
        />
      ) : (
        <div className="card summary-card">
          {summary.summary.split('\n').filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
