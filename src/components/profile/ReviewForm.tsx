import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  reviewedId: string; // utilisateur à noter
  listingId?: string; // annonce concernée
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ reviewedId, listingId, onSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Merci de donner une note entre 1 et 5 étoiles.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const reviewerId = data?.user?.id;
      if (!reviewerId) {
        toast.error('Vous devez être connecté pour laisser un avis.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('reviews').insert({
        reviewed_id: reviewedId,
        reviewer_id: reviewerId,
        listing_id: listingId ?? '', // chaîne vide si non fourni
        rating,
        comment: comment || '',      // chaîne vide si non fourni
      });
      if (error) throw error;
      toast.success('Avis envoyé ! Merci pour votre retour.');
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    } catch {
      toast.error('Erreur lors de l’envoi de l’avis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={star <= rating ? 'text-primary' : 'text-grey-300'}
            aria-label={`Donner ${star} étoile${star > 1 ? 's' : ''}`}
          >
            <Star className="h-7 w-7" fill={star <= rating ? '#fbbf24' : 'none'} />
          </button>
        ))}
      </div>
      <textarea
        className="input-field w-full min-h-[80px]"
        placeholder="Votre commentaire (optionnel)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
        disabled={loading}
      />
      <button
        type="submit"
        className="btn-primary px-8 py-2"
        disabled={loading || rating === 0}
      >
        {loading ? 'Envoi...' : 'Envoyer mon avis'}
      </button>
    </form>
  );
};

export default ReviewForm;
