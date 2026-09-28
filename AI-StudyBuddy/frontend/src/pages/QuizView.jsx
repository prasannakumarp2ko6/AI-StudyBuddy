import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import QuizQuestion from '../components/QuizQuestion';
import Button from '../components/Button';
import api, { getErrorMessage } from '../services/api';

export default function QuizView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/material/${id}`);
      setMaterial(res.data.data.material);
      setQuiz(res.data.data.quiz);
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

  const selectAnswer = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage message={error} /></DashboardLayout>;

  if (!quiz) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="✅"
          title="No quiz generated yet"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/materials/${id}`)}>
              Go back and generate one
            </button>
          }
        />
      </DashboardLayout>
    );
  }

  const score = quiz.questions.reduce((acc, q, i) => (answers[i] === q.correctAnswer ? acc + 1 : acc), 0);
  const allAnswered = quiz.questions.every((_, i) => answers[i]);

  return (
    <DashboardLayout>
      <h1>Quiz: {material.title}</h1>

      {submitted && (
        <div className="card score-card">
          <h2>
            Your Score: {score} / {quiz.questions.length}
          </h2>
          <p className="muted">{Math.round((score / quiz.questions.length) * 100)}% correct</p>
          <Button variant="outline" onClick={handleRetry}>
            Retry Quiz
          </Button>
        </div>
      )}

      {quiz.questions.map((q, i) => (
        <QuizQuestion
          key={i}
          question={q}
          index={i}
          selectedAnswer={answers[i]}
          onSelect={(opt) => selectAnswer(i, opt)}
          submitted={submitted}
        />
      ))}

      {!submitted && (
        <Button disabled={!allAnswered} onClick={handleSubmit} style={{ marginTop: '1rem' }}>
          Submit Quiz
        </Button>
      )}
    </DashboardLayout>
  );
}
