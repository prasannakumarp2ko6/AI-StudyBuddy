import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import FlashcardComp from '../components/Flashcard';
import api, { getErrorMessage } from '../services/api';

export default function FlashcardsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/material/${id}`);
        setMaterial(res.data.data.material);
        setFlashcards(res.data.data.flashcards || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorMessage message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1>Flashcards: {material.title}</h1>
      {flashcards.length === 0 ? (
        <EmptyState
          icon="🃏"
          title="No flashcards generated yet"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/materials/${id}`)}>
              Go back and generate some
            </button>
          }
        />
      ) : (
        <>
          <FlashcardComp card={flashcards[index]} index={index} total={flashcards.length} />
          <div className="flashcard-nav">
            <button className="btn btn-outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              ← Previous
            </button>
            <button
              className="btn btn-outline"
              disabled={index === flashcards.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
