import { useNavigate } from 'react-router-dom';

export default function MaterialCard({ material, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="card material-card">
      <div className="material-card-header">
        <h4>{material.title}</h4>
        <span className="badge">{material.subject}</span>
      </div>
      <p className="material-preview">{material.content.slice(0, 120)}...</p>
      <div className="material-card-footer">
        <span className="muted">{new Date(material.createdAt).toLocaleDateString()}</span>
        <div className="material-card-actions">
          <button className="btn btn-sm btn-outline" onClick={() => navigate(`/materials/${material._id}`)}>
            View
          </button>
          {onDelete && (
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(material)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
