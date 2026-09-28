import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import api, { getErrorMessage } from '../services/api';

export default function UploadMaterial() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('text'); // 'text' | 'file'
  const [form, setForm] = useState({ title: '', subject: '', content: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.subject) {
      setError('Title and subject are required');
      return;
    }
    if (mode === 'text' && !form.content.trim()) {
      setError('Please paste some study material text');
      return;
    }
    if (mode === 'file' && !file) {
      setError('Please choose a file to upload');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'file') {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('subject', form.subject);
        fd.append('file', file);
        res = await api.post('/material/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/material/upload', form);
      }
      navigate(`/materials/${res.data.data.material._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1>Upload Study Material</h1>
      <p className="muted">Paste your notes directly or upload a text file (.txt, .md, .csv).</p>

      <form className="card form-card" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Chapter 4 - Thermodynamics" />
        <label>Subject</label>
        <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Physics" />

        <div className="tabs">
          <button type="button" className={`tab ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
            Paste Text
          </button>
          <button type="button" className={`tab ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>
            Upload File
          </button>
        </div>

        {mode === 'text' ? (
          <>
            <label>Study material content</label>
            <textarea
              name="content"
              rows={10}
              value={form.content}
              onChange={handleChange}
              placeholder="Paste your notes, textbook excerpt, or lecture transcript here..."
            />
          </>
        ) : (
          <>
            <label>Choose a file</label>
            <input type="file" accept=".txt,.md,.csv" onChange={(e) => setFile(e.target.files[0])} />
          </>
        )}

        <Button type="submit" loading={loading} style={{ marginTop: '1rem' }}>
          Upload Material
        </Button>
      </form>
    </DashboardLayout>
  );
}
