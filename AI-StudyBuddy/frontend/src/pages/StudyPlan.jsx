import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StudyPlanCard from '../components/StudyPlanCard';
import Button from '../components/Button';
import api, { getErrorMessage } from '../services/api';

export default function StudyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ subject: '', examDate: '', hoursPerDay: '', goals: '', topics: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/study-plan');
      setPlans(res.data.data.studyPlans);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.subject || !form.examDate || !form.hoursPerDay) {
      setFormError('Subject, exam date, and hours per day are required');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/ai/study-plan', form);
      setPlans((prev) => [res.data.data.studyPlan, ...prev]);
      setForm({ subject: '', examDate: '', hoursPerDay: '', goals: '', topics: '' });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <h1>Personalized Study Plan</h1>
      <p className="muted">Tell us about your exam and Gemini will build a day-by-day plan.</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <ErrorMessage message={formError} />
        <label>Subject</label>
        <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Organic Chemistry" />
        <label>Exam date</label>
        <input name="examDate" type="date" value={form.examDate} onChange={handleChange} />
        <label>Available study hours per day</label>
        <input name="hoursPerDay" type="number" min="1" max="16" value={form.hoursPerDay} onChange={handleChange} placeholder="e.g. 3" />
        <label>Learning goals (optional)</label>
        <input name="goals" value={form.goals} onChange={handleChange} placeholder="e.g. Pass with a strong grasp of reaction mechanisms" />
        <label>Topics to focus on (optional)</label>
        <input name="topics" value={form.topics} onChange={handleChange} placeholder="e.g. Alkenes, SN1/SN2, aromatic compounds" />
        <Button type="submit" loading={creating} style={{ marginTop: '1rem' }}>
          Generate Study Plan
        </Button>
      </form>

      <div className="dashboard-section">
        <h2>Your Study Plans</h2>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : plans.length === 0 ? (
          <EmptyState icon="🗓️" title="No study plans yet" description="Create one above to get started." />
        ) : (
          plans.map((p) => <StudyPlanCard key={p._id} plan={p} />)
        )}
      </div>
    </DashboardLayout>
  );
}
