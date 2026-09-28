import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import api, { getErrorMessage } from '../services/api';

export default function MaterialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/material/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runSummary = async () => {
    setActionLoading('summary');
    setActionError('');
    try {
      await api.post(`/materials/${id}/summarize`);
      await load();
      navigate(`/materials/${id}/summary`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  };

  const runFlashcards = async () => {
    setActionLoading('flashcards');
    setActionError('');
    try {
      await api.post('/ai/flashcards', { materialId: id });
      navigate(`/materials/${id}/flashcards`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  };

  const runQuiz = async () => {
    setActionLoading('quiz');
    setActionError('');
    try {
      await api.post('/ai/quiz', { materialId: id });
      navigate(`/materials/${id}/quiz`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage message={error} onRetry={load} /></DashboardLayout>;

  const { material, summary, flashcards, quiz } = data;

  return (
    <DashboardLayout>
      <div className="section-header">
        <div>
          <h1>{material.title}</h1>
          <span className="badge">{material.subject}</span>
        </div>
      </div>
      <ErrorMessage message={actionError} />

      <div className="card">
        <h3>Content Preview</h3>
        <p className="material-preview-full">{material.content.slice(0, 500)}{material.content.length > 500 ? '...' : ''}</p>
      </div>

      <div className="ai-actions-grid">
        <div className="card ai-action-card">
          <h4>📝 Summary</h4>
          <p className="muted">{summary ? 'Summary already generated.' : 'No summary yet.'}</p>
          <div className="ai-action-buttons">
            {summary && (
              <Button variant="outline" onClick={() => navigate(`/materials/${id}/summary`)}>
                View
              </Button>
            )}
            <Button loading={actionLoading === 'summary'} onClick={runSummary}>
              {summary ? 'Regenerate' : 'Generate Summary'}
            </Button>
          </div>
        </div>

        <div className="card ai-action-card">
          <h4>🃏 Flashcards</h4>
          <p className="muted">{flashcards && flashcards.length > 0 ? `${flashcards.length} flashcards saved.` : 'No flashcards yet.'}</p>
          <div className="ai-action-buttons">
            {flashcards && flashcards.length > 0 && (
              <Button variant="outline" onClick={() => navigate(`/materials/${id}/flashcards`)}>
                View
              </Button>
            )}
            <Button loading={actionLoading === 'flashcards'} onClick={runFlashcards}>
              {flashcards && flashcards.length > 0 ? 'Regenerate' : 'Generate Flashcards'}
            </Button>
          </div>
        </div>

        <div className="card ai-action-card">
          <h4>✅ Quiz</h4>
          <p className="muted">{quiz ? `${quiz.questions.length} questions saved.` : 'No quiz yet.'}</p>
          <div className="ai-action-buttons">
            {quiz && (
              <Button variant="outline" onClick={() => navigate(`/materials/${id}/quiz`)}>
                Take Quiz
              </Button>
            )}
            <Button loading={actionLoading === 'quiz'} onClick={runQuiz}>
              {quiz ? 'Regenerate' : 'Generate Quiz'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
