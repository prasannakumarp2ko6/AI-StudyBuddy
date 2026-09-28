import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <div className="landing-hero">
        <h1>Study smarter with AI StudyBuddy</h1>
        <p>
          Upload your notes and let Gemini AI turn them into summaries, flashcards, quizzes, and a
          personalized study plan — all in one clean dashboard.
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Get Started Free
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
            I already have an account
          </button>
        </div>
      </div>
      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>AI Summaries</h3>
          <p>Turn long notes into concise, easy-to-review summaries in seconds.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🃏</div>
          <h3>Flashcards</h3>
          <p>Auto-generated question and answer cards built for active recall.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✅</div>
          <h3>Quizzes</h3>
          <p>Multiple-choice quizzes with instant scoring and explanations.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🗓️</div>
          <h3>Study Plans</h3>
          <p>A realistic day-by-day plan tailored to your exam date and goals.</p>
        </div>
      </div>
    </div>
  );
}
