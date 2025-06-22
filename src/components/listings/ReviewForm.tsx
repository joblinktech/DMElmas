import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import type { Review } from '../../lib/database.types';

interface ReviewFormProps {
  listingId: string;
  reviewedId: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ listingId, reviewedId, onSuccess }) => {
  const { user } = useSupabase();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean | null>(null);
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const checkAlreadyReviewed = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();
      if (error) {
        setAlreadyReviewed(false);
        return;
      }
      setAlreadyReviewed(!!data);
    };
    checkAlreadyReviewed();
  }, [user, listingId]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id (full_name)')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });
      if (!error && data) setReviews(data as ReviewWithUser[]);
      setLoadingReviews(false);
    };
    fetchReviews();
  }, [listingId, success]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!rating) {
      setError('Merci de donner une note.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        listing_id: listingId,
        rating,
        comment,
      });
      if (error) throw error;
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l’envoi de l’avis.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadyReviewed === null) {
    return <div className="text-grey-500 text-sm mt-6">Chargement...</div>;
  }
  if (alreadyReviewed) {
    return (
      <>
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 mt-6">Vous avez déjà laissé un avis pour cette annonce.</div>
        <ReviewList reviews={reviews} loading={loadingReviews} />
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="p-4 bg-green-50 rounded-lg text-green-700">Merci pour votre avis !</div>
        <ReviewList reviews={reviews} loading={loadingReviews} />
      </>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3 mt-6">
        <div>
          <label className="block font-semibold mb-1">Note</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <button
                type="button"
                key={star}
                className={star <= rating ? 'text-yellow-400' : 'text-grey-300'}
                onClick={() => setRating(star)}
                aria-label={`Donner ${star} étoile${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Commentaire (optionnel)</label>
          <textarea
            className="input-field w-full"
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Votre retour sur la transaction..."
          />
        </div>
        {error && <div className="text-error-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Envoi...' : 'Laisser un avis'}
        </button>
      </form>
      <ReviewList reviews={reviews} loading={loadingReviews} />
    </div>
  );
};

// Type pour review avec le nom du reviewer
interface ReviewWithUser extends Review {
  reviewer?: { full_name?: string };
}

// Composant pour afficher la liste des avis
const ReviewList = ({ reviews, loading }: { reviews: ReviewWithUser[]; loading: boolean }) => {
  if (loading) return <div className="text-grey-500 text-sm mt-4">Chargement des avis...</div>;
  if (!reviews.length) return <div className="text-grey-400 text-sm mt-4">Aucun avis pour cette annonce.</div>;
  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-base mb-2">Avis sur cette annonce</h3>
      {reviews.map((r) => (
        <div key={r.id} className="bg-grey-50 rounded-lg p-3 border border-grey-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-primary">
              {r.reviewer?.full_name || 'Utilisateur'}
            </span>
            <span className="flex gap-0.5 ml-2">
              {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= r.rating ? 'text-yellow-400' : 'text-grey-300'}>★</span>
              ))}
            </span>
            <span className="text-xs text-grey-500 ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          {r.comment && <div className="text-grey-800 text-sm">{r.comment}</div>}
        </div>
      ))}
    </div>
  );
};

export default ReviewForm;
