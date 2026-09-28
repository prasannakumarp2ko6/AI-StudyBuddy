import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import MaterialCard from '../components/MaterialCard';
import Modal from '../components/Modal';
import api, { getErrorMessage } from '../services/api';

export default function Materials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/material');
      setMaterials(res.data.data.materials);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/material/${toDelete._id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== toDelete._id));
      setToDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="section-header">
        <h1>Study Materials</h1>
        <button className="btn btn-primary" onClick={() => navigate('/materials/upload')}>
          + Upload Material
        </button>
      </div>
      <ErrorMessage message={error} onRetry={load} />
      {loading ? (
        <LoadingSpinner />
      ) : materials.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No study materials yet"
          description="Upload notes or paste text to get started."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/materials/upload')}>
              Upload Material
            </button>
          }
        />
      ) : (
        <div className="card-grid">
          {materials.map((m) => (
            <MaterialCard key={m._id} material={m} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {toDelete && (
        <Modal
          title="Delete study material?"
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          danger
        >
          <p>
            This will permanently delete "<strong>{toDelete.title}</strong>" along with its summary,
            flashcards, and quiz. This cannot be undone.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  );
}
