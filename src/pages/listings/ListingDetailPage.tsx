import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MapPin, 
  Calendar, 
  Star, 
  MessageSquare, 
  Flag, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  User // Correction : ajout de l'import User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  formatPrice, 
  formatDate,
  getConditionLabel,
  getCategoryLabel
} from '../../lib/utils';
import { Database } from '../../lib/database.types';
import ReviewForm from '../../components/listings/ReviewForm';

type Listing = Database['public']['Tables']['listings']['Row'];
type SellerProfile = Database['public']['Tables']['users']['Row'];

interface ListingWithSeller extends Listing {
  seller: SellerProfile;
}

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSupabase();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [markingAsSold, setMarkingAsSold] = useState(false);
  // Ajout des hooks pour la gestion des actions d'annonce (modification prix, suppression)
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Ajout du state pour les annonces similaires (nécessaire pour la sidebar)
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            seller:users!listings_user_id_fkey (*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setListing(data as ListingWithSeller);
        
        // Fetch similar listings
        if (data) {
          const { data: similarData, error: similarError } = await supabase
            .from('listings')
            .select('*')
            .eq('category', data.category)
            .eq('status', 'active')
            .neq('id', data.id)
            .limit(4);
          
          if (!similarError && similarData) {
            setSimilarListings(similarData);
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Impossible de charger cette annonce');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);
  
  useEffect(() => {
    if (!user || !listing) return;
    if (user.id === listing.seller.id) return; // Pas de badge pour le propriétaire
    const checkUnread = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listing.id)
        .eq('receiver_id', user.id)
        .eq('sender_id', listing.seller.id)
        .eq('read', false);
      if (!error && count && count > 0) {
        setHasUnreadMessages(true);
      } else {
        setHasUnreadMessages(false);
      }
    };
    checkUnread();
  }, [user, listing]);
  
  const nextImage = () => {
    if (!listing?.photos) return;
    setCurrentImageIndex((prev) => 
      prev === listing.photos.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    if (!listing?.photos) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.photos.length - 1 : prev - 1
    );
  };
  
  const handleReportListing = async () => {
    if (!reportReason.trim()) {
      toast.error('Veuillez indiquer une raison');
      return;
    }
    
    setIsSubmittingReport(true);
    
    try {
      // In a real app, you would save this report to the database
      // For now, we'll just simulate a successful report
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Annonce signalée avec succès');
      setReportModalOpen(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting listing:', error);
      toast.error('Erreur lors du signalement');
    } finally {
      setIsSubmittingReport(false);
    }
  };
  
  // Fonction pour marquer comme vendu
  async function handleMarkAsSold() {
    if (!listing) return;
    setMarkingAsSold(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listing.id);
      if (error) throw error;
      toast.success('Annonce marquée comme vendue');
      setListing({ ...listing, status: 'sold' });
    } catch {
      toast.error('Erreur lors du marquage comme vendue');
    } finally {
      setMarkingAsSold(false);
    }
  }
  
  // Fonction pour modifier le prix
  async function handleUpdatePrice() {
    if (!listing || newPrice === null) return;
    setIsUpdatingPrice(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ price: newPrice })
        .eq('id', listing.id);
      if (error) throw error;
      toast.success('Prix modifié avec succès');
      setListing({ ...listing, price: newPrice });
      setEditingPrice(false);
    } catch {
      toast.error('Erreur lors de la modification du prix');
    } finally {
      setIsUpdatingPrice(false);
    }
  }

  // Fonction de suppression d'annonce
  async function handleDeleteListing() {
    if (!listing) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);
      if (error) throw error;
      toast.success('Annonce supprimée');
      navigate('/profile');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour contacter le vendeur');
      navigate('/login', { state: { from: `/listings/${id}` } });
      return;
    }
    if (listing?.seller.id === user.id) {
      toast.error('Vous ne pouvez pas contacter votre propre annonce');
      return;
    }
    navigate(`/messages/${listing?.id}/${listing?.seller.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen bg-grey-50 py-12">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-card shadow-card p-8 text-center">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Annonce introuvable</h1>
            <p className="text-grey-600 mb-6">
              Cette annonce n'existe pas ou a été supprimée.
            </p>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (
    listing &&
    listing.status !== 'active' &&
    (!user || user.id !== listing.user_id)
  ) {
    return (
      <div className="min-h-screen bg-grey-50 py-12">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-card shadow-card p-8 text-center">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Annonce non disponible</h1>
            <p className="text-grey-600 mb-6">
              Cette annonce n'est pas accessible
            </p>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-card shadow-card overflow-hidden mb-6">
              <div className="relative aspect-video">
                {listing.photos && listing.photos.length > 0 ? (
                  <>
                    <img 
                      src={listing.photos[currentImageIndex]} 
                      alt={listing.title} 
                      className="w-full h-full object-contain"
                    />
                    
                    {listing.photos.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft className="h-6 w-6 text-grey-800" />
                        </button>
                        
                        <button 
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all"
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="h-6 w-6 text-grey-800" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {listing.photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 w-2 rounded-full ${
                                index === currentImageIndex ? 'bg-primary' : 'bg-white bg-opacity-60'
                              }`}
                              aria-label={`Voir image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-grey-100">
                    <p className="text-grey-500">Aucune image disponible</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {listing.photos && listing.photos.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {listing.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={photo} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Listing Details */}
            <div className="bg-white rounded-card shadow-card p-6 mb-6">
              <h1 className="text-2xl font-bold text-grey-900 mb-2">{listing.title}</h1>
              
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(listing.price)}
              </p>
              
              <div className="flex flex-wrap gap-y-2 mb-6">
                <div className="flex items-center mr-6">
                  <MapPin className="h-5 w-5 text-grey-500 mr-1" />
                  <span className="text-grey-700">{listing.district}</span>
                </div>
                
                <div className="flex items-center mr-6">
                  <Calendar className="h-5 w-5 text-grey-500 mr-1" />
                  <span className="text-grey-700">{formatDate(listing.created_at)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-grey-50 p-3 rounded-lg">
                  <p className="text-sm text-grey-500">Catégorie</p>
                  <p className="font-medium">{getCategoryLabel(listing.category)}</p>
                </div>
                
                <div className="bg-grey-50 p-3 rounded-lg">
                  <p className="text-sm text-grey-500">État</p>
                  <p className="font-medium">{getConditionLabel(listing.condition)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-grey-700 whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Bloc avis : affic hé si l'utilisateur est connecté, n'est pas le vendeur, et n'a pas déjà noté ce vendeur pour cette annonce */}
              {user?.id && user.id !== listing.seller.id && (
                <ReviewForm listingId={listing.id} reviewedId={listing.seller.id} />
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-grey-500 flex items-center text-sm hover:text-error-600 transition-colors"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Signaler l'annonce
                </button>
              </div>
              
              {/* Marquer comme vendu, modifier prix, supprimer (actions propriétaire) */}
              {user?.id && listing && user.id === listing.seller.id && (listing.status === 'active' || listing.status === 'pending') && (
                <div className="flex flex-col gap-2 mb-4">
                  {listing.status === 'active' && (
                    <button
                      className="btn-outline btn-xs text-success-700 border-success-700 hover:bg-success-50"
                      onClick={handleMarkAsSold}
                      disabled={markingAsSold}
                    >
                      {markingAsSold ? 'Traitement...' : 'Marquer comme vendu'}
                    </button>
                  )}
                  {/* Modifier le prix (uniquement si active) */}
                  {listing.status === 'active' && (editingPrice ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={200}
                        step={100}
                        value={newPrice ?? listing.price}
                        onChange={e => setNewPrice(Number(e.target.value))}
                        className="input-field w-28 border-primary-300 focus:border-primary-500 rounded-lg"
                        disabled={isUpdatingPrice}
                      />
                      <button
                        className="btn-primary btn-xs"
                        onClick={handleUpdatePrice}
                        disabled={isUpdatingPrice}
                      >
                        {isUpdatingPrice ? 'Mise à jour...' : 'Valider'}
                      </button>
                      <button
                        className="btn-outline btn-xs"
                        onClick={() => setEditingPrice(false)}
                        disabled={isUpdatingPrice}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-outline btn-xs hover:bg-primary-50 border-primary-200 text-primary"
                      onClick={() => {
                        setEditingPrice(true);
                        setNewPrice(listing.price);
                      }}
                    >
                      Modifier le prix
                    </button>
                  ))}
                  {/* Supprimer l'annonce (active ou pending) */}
                  <button
                    className="btn-outline btn-xs text-error-700 border-error-700 hover:bg-error-50"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              )}
              {/* Confirmation de suppression */}
              {confirmDelete && (
                <div className="fixed inset-0 bg-grey-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-card shadow-card p-6 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold mb-4">Supprimer l'annonce ?</h2>
                    <p className="text-grey-700 mb-6">Cette action est irréversible. Voulez-vous vraiment supprimer cette annonce ?</p>
                    <div className="flex justify-center gap-4">
                      <button
                        className="btn-outline"
                        onClick={() => setConfirmDelete(false)}
                        disabled={isDeleting}
                      >
                        Annuler
                      </button>
                      <button
                        className="btn-primary bg-error-600 hover:bg-error-700 border-error-600"
                        onClick={handleDeleteListing}
                        disabled={isDeleting}
                      >
                        Confirmer la suppression
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Affichage du bouton "Payer maintenant" si l'annonce est en attente de paiement et que l'utilisateur est le propriétaire */}
              {user?.id && listing && user.id === listing.seller.id && listing.status === 'pending' && (
                <div className="my-6 flex flex-col items-center">
                  <div className="mb-4 text-lg text-warning-700 font-semibold">
                    Cette annonce est en attente de paiement. Elle ne sera pas visible tant que le paiement n'est pas effectué.
                  </div>
                  <button
                    className="btn-primary text-lg px-8 py-3"
                    onClick={() => navigate(`/create-listing?id=${listing.id}`)}
                  >
                    Payer maintenant pour publier
                  </button>
                  <div className="mt-2 text-base text-grey-600">
                    Toutes les informations de l'annonce seront pré-remplies, y compris le boost si sélectionné.
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-card shadow-card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Vendeur</h2>
              
              <Link to={`/profile/seller/${listing.seller.id}`} className="flex items-center mb-4 group">
                <div className="h-12 w-12 rounded-full bg-grey-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition">
                  <User className="h-6 w-6 text-grey-500" />
                </div>
                <div className="ml-3">
                  <p className="font-medium group-hover:text-primary transition">{listing.seller.full_name}</p>
                  {listing.seller.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary fill-current" />
                      <span className="text-sm ml-1">{listing.seller.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="mb-4">
                <p className="text-sm text-grey-500">Quartier</p>
                <p className="font-medium">{listing.seller.district}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-grey-500">Membre depuis</p>
                <p className="font-medium">{formatDate(listing.seller.created_at)}</p>
              </div>
              
              <button
                onClick={handleContactSeller}
                className="btn-primary w-full flex items-center justify-center relative"
                disabled={listing.seller.id === user?.id}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                {/* Point de notification si messages non lus */}
                {hasUnreadMessages && (
                  <span className="absolute left-6 top-2 h-2 w-2 rounded-full bg-error-500 animate-pulse" />
                )}
                Contacter le vendeur
              </button>
              {listing.seller.id === user?.id && (
                <p className="text-sm text-grey-500 text-center mt-2">
                  C'est votre annonce
                </p>
              )}
            </div>
            
            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div className="bg-white rounded-card shadow-card p-6">
                <h2 className="text-lg font-semibold mb-4">Annonces similaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {similarListings.map((item) => (
                    <Link 
                      key={item.id} 
                      to={`/listings/${item.id}`}
                      className="flex flex-col items-center hover:bg-grey-50 p-2 rounded-lg transition-colors border border-grey-100"
                    >
                      <div className="h-24 w-full rounded-md overflow-hidden flex-shrink-0 mb-2 flex items-center justify-center bg-grey-50">
                        <img 
                          src={item.photos[0] || 'https://via.placeholder.com/96'} 
                          alt={item.title} 
                          className="h-24 w-auto max-w-full object-cover"
                        />
                      </div>
                      <div className="w-full text-center">
                        <p className="font-medium line-clamp-1 text-sm mb-1">{item.title}</p>
                        <p className="text-primary font-bold text-base">{formatPrice(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card shadow-card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Signaler l'annonce</h2>
            
            <p className="text-grey-600 mb-4">
              Veuillez indiquer la raison pour laquelle vous signalez cette annonce.
            </p>
            
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="input-field mb-4"
              disabled={isSubmittingReport}
            >
              <option value="">Sélectionnez une raison</option>
              <option value="fake">Annonce frauduleuse</option>
              <option value="inappropriate">Contenu inapproprié</option>
              <option value="duplicate">Annonce en double</option>
              <option value="wrong_category">Mauvaise catégorie</option>
              <option value="other">Autre raison</option>
            </select>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="btn-outline"
                disabled={isSubmittingReport}
              >
                Annuler
              </button>
              
              <button
                onClick={handleReportListing}
                className="btn-primary flex items-center"
                disabled={isSubmittingReport || !reportReason}
              >
                {isSubmittingReport ? (
                  <LoadingSpinner size="small" className="text-white" />
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Signaler
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;