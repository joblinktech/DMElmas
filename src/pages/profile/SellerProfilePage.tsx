import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatPrice, getCategoryLabel } from '../../lib/utils';
import { Star } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Database } from '../../lib/database.types';

// Typage pour un avis
interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  listing_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: { full_name: string };
}

const SellerProfilePage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [listings, setListings] = useState<Database['public']['Tables']['listings']['Row'][]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sellerId ?? '')
          .single();
        if (userError) throw userError;
        setSeller(userData);

        const { data: listingsData } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', sellerId ?? '')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        setListings(listingsData || []);

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, reviewer:users!reviews_reviewer_id_fkey(full_name)')
          .eq('reviewed_id', sellerId ?? '')
          .order('created_at', { ascending: false });
        setReviews(reviewsData || []);
      } catch {
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };
    if (sellerId) fetchSeller();
  }, [sellerId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-grey-50"><LoadingSpinner size="large" /></div>;
  }
  if (!seller) {
    return <div className="min-h-screen flex items-center justify-center bg-grey-50">Vendeur introuvable</div>;
  }

  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-3xl mx-auto">
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-grey-100 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-grey-900">{seller.full_name}</h1>
              <div className="flex items-center mt-1">
                {seller.rating && (
                  <>
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="ml-1 font-medium">{seller.rating.toFixed(1)}</span>
                  </>
                )}
              </div>
              <div className="text-grey-600 text-sm mt-1">Membre depuis {formatDate(seller.created_at)}</div>
              <div className="text-grey-600 text-sm">Quartier : {seller.district}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Annonces du vendeur</h2>
          {listings.length === 0 ? (
            <div className="text-grey-500">Aucune annonce active</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map(listing => (
                <Link key={listing.id} to={`/listings/${listing.id}`} className="block border border-grey-100 rounded-lg p-3 hover:bg-grey-50">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-grey-100 flex items-center justify-center">
                      <img src={listing.photos[0] || 'https://via.placeholder.com/64'} alt={listing.title} className="h-16 w-auto max-w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">{listing.title}</div>
                      <div className="text-primary font-bold">{formatPrice(listing.price)}</div>
                      <div className="text-xs text-grey-500">{getCategoryLabel(listing.category)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">Avis sur le vendeur</h2>
          {reviews.length === 0 ? (
            <div className="text-grey-500">Aucun avis pour ce vendeur</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="border-b border-grey-100 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-primary fill-current" />
                    <span className="font-medium">{review.rating}/5</span>
                    <span className="text-xs text-grey-500 ml-2">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="text-grey-800 mb-1">{review.comment}</div>
                  <div className="text-xs text-grey-500">par {review.reviewer?.full_name || 'Utilisateur'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
