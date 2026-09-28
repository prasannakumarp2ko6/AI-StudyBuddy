import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data.users);
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
      await api.delete(`/admin/users/${toDelete._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== toDelete._id));
      setToDelete(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Manage Users</h1>
      <ErrorMessage message={error} onRetry={load} />
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="badge">{u.role}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  disabled={u._id === currentUser.id}
                  onClick={() => setToDelete(u)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {toDelete && (
        <Modal
          title="Delete user?"
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          danger
        >
          <p>
            This will permanently delete <strong>{toDelete.name}</strong> and all of their study materials,
            summaries, flashcards, quizzes, and study plans.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  );
}
