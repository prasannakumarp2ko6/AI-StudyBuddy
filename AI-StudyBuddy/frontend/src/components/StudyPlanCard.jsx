export default function StudyPlanCard({ plan }) {
  const planData = plan.studyPlan || {};
  return (
    <div className="card study-plan-card">
      <div className="material-card-header">
        <h4>{plan.subject}</h4>
        <span className="badge">Exam: {new Date(plan.examDate).toLocaleDateString()}</span>
      </div>
      {planData.overview && <p className="muted">{planData.overview}</p>}
      <div className="study-plan-days">
        {(planData.days || []).map((day, i) => (
          <div key={i} className="study-plan-day">
            <div className="study-plan-day-header">
              <strong>{day.date}</strong>
              <span className="badge badge-light">{day.hours}h</span>
            </div>
            <p className="study-plan-focus">{day.focus}</p>
            <ul>
              {(day.tasks || []).map((t, j) => (
                <li key={j}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
