import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(form.name, form.email, form.password, form.role);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <p className="muted">Start turning your notes into AI-powered study tools.</p>
        <ErrorMessage message={error} />
        <label>Full name</label>
        <input name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Jane Doe" />
        <label>Email</label>
        <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@example.com" />
        <label>Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
        />
        <label>Account type</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Student">Student</option>
          <option value="Admin">Admin (for demo/testing)</option>
        </select>
        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
          Create Account
        </Button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
