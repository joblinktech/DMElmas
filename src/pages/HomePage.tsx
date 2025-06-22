import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, AlertCircle, TrendingUp, Users, Shield, Smartphone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CATEGORIES } from '../lib/utils';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'react-hot-toast';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingWithSeller = Listing & { seller_name: string; seller_rating: number | null };

const HomePage: React.FC = () => {
  const [latestListings, setLatestListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, user } = useSupabase();
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchLatestListings = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            users:user_id (
              full_name,
              rating
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        const formattedListings = data.map(item => ({
          ...item,
          seller_name: item.users?.full_name || 'Utilisateur',
          seller_rating: item.users?.rating || null
        }));

        setLatestListings(formattedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestListings();
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id || !isSupabaseConfigured) {
        setUserCredits(null);
        return;
      }
      // @ts-expect-error accès table custom
      const { data, error } = await (supabase as unknown)
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      if (error) {
        setUserCredits(null);
      } else {
        setUserCredits(data?.credits ?? 0);
      }
    };
    fetchCredits();
  }, [user]);

  useEffect(() => {
    if (localStorage.getItem('credit_purchase_pending')) {
      toast.success('Crédits ajoutés à votre compte !');
      localStorage.removeItem('credit_purchase_pending');
    }
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
        <section className="section-padding">
          <div className="responsive-container">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-warning-200">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-warning-600 mx-auto mb-3 sm:mb-4 lg:mb-6" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-warning-800 mb-2 sm:mb-3 lg:mb-4">Configuration Required</h2>
              <p className="text-warning-700 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                To use DaloaMarket, you need to configure your Supabase database connection.
              </p>
              <div className="bg-grey-50 rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 text-left">
                <h3 className="font-semibold mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 lg:space-y-3 text-xs sm:text-sm lg:text-base">
                  <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">supabase.com</a> and create a new project</li>
                  <li>In your Supabase dashboard, go to Settings → API</li>
                  <li>Copy your Project URL and anon/public key</li>
                  <li>Update the .env file with your actual credentials</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary to-primary-400">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative section-padding">
          <div className="responsive-container text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
              Achetez et vendez
              <span className="block text-primary-100">à Daloa</span>
            </h1>
            <p className="text-white text-sm sm:text-lg lg:text-xl opacity-95 mb-4 sm:mb-6 lg:mb-8 leading-relaxed px-2">
              La première marketplace P2P de Daloa. Trouvez des articles d'occasion près de chez vous.
            </p>
            
            {userProfile && (!userProfile.full_name || !userProfile.phone || !userProfile.district) && (
              <div className="mb-4 sm:mb-6 lg:mb-8 p-2.5 sm:p-3 lg:p-4 bg-warning-100 border border-warning-300 rounded-lg lg:rounded-xl max-w-xs sm:max-w-sm mx-auto">
                <p className="text-warning-800 font-medium mb-2 text-xs sm:text-sm lg:text-base">Profil incomplet</p>
                <Link to="/complete-profile" className="btn-primary bg-warning-600 hover:bg-warning-700 border-warning-600 text-xs sm:text-sm lg:text-base py-2 lg:py-3">
                  Compléter mon profil
                </Link>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center max-w-xs sm:max-w-md mx-auto">
              <Link to="/search" className="btn-secondary bg-white text-primary hover:bg-grey-100 flex-1 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold">
                Parcourir
              </Link>
              <Link to="/create-listing" className="btn-primary bg-secondary hover:bg-secondary-600 flex-1 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold">
                Vendre
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-5 left-5 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-5 right-5 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-white opacity-10 rounded-full"></div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="responsive-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto">
            <div className="text-center mobile-card hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-primary-100 rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-grey-900 mb-1">500+</h3>
              <p className="text-grey-600 text-xs sm:text-sm lg:text-base">Annonces publiées</p>
            </div>
            <div className="text-center mobile-card hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-secondary-100 rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-grey-900 mb-1">200+</h3>
              <p className="text-grey-600 text-xs sm:text-sm lg:text-base">Utilisateurs actifs</p>
            </div>
            <div className="text-center mobile-card hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-success-100 rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-success" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-grey-900 mb-1">100%</h3>
              <p className="text-grey-600 text-xs sm:text-sm lg:text-base">Transactions sécurisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="responsive-container">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-grey-900 mb-2 sm:mb-3 lg:mb-4">Explorez par catégorie</h2>
            <p className="text-sm sm:text-lg lg:text-xl text-grey-600">Trouvez exactement ce que vous cherchez</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/search?category=${category.id}`}
                className="group bg-gradient-to-br from-grey-50 to-white rounded-lg lg:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-3 sm:p-4 lg:p-6 text-center border border-grey-100 hover:border-primary-200 transform hover:-translate-y-1"
              >
                <div className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-grey-900 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-primary transition-colors">
                  {category.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="section-padding bg-gradient-to-br from-grey-50 to-grey-100">
        <div className="responsive-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-12 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-grey-900 mb-1 sm:mb-2">Dernières annonces</h2>
              <p className="text-sm sm:text-lg lg:text-xl text-grey-600">Découvrez les nouveautés</p>
            </div>
            <Link to="/search" className="text-primary font-semibold flex items-center hover:text-primary-700 transition-colors text-sm sm:text-base lg:text-lg flex-shrink-0">
              Voir tout 
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ml-1 sm:ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12 sm:py-16 lg:py-20">
              <LoadingSpinner size="large" />
            </div>
          ) : latestListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {latestListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  sellerName={listing.seller_name}
                  sellerRating={listing.seller_rating}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-center max-w-xl mx-auto">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-primary mx-auto mb-3 sm:mb-4 lg:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4">Aucune annonce pour le moment</h3>
              <p className="text-grey-600 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">Soyez le premier à publier une annonce !</p>
              <Link to="/create-listing" className="btn-primary text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4">
                Publier une annonce
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="responsive-container">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-grey-900 mb-2 sm:mb-3 lg:mb-4">Comment ça marche</h2>
            <p className="text-sm sm:text-lg lg:text-xl text-grey-600">Vendez et achetez en 3 étapes</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">1</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-primary rounded-full flex items-center justify-center">
                  <Smartphone className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4">Créez votre annonce</h3>
              <p className="text-grey-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Prenez des photos, décrivez votre article et fixez votre prix.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary">2</span>
                </div>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4">Discutez avec les acheteurs</h3>
              <p className="text-grey-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Recevez des messages et répondez via notre messagerie sécurisée.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-success-100 to-success-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-success">3</span>
                </div>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4">Vendez en toute simplicité</h3>
              <p className="text-grey-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Rencontrez l'acheteur dans votre quartier en toute sécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-secondary via-secondary-600 to-secondary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative responsive-container text-center">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
            Prêt à vendre vos articles ?
          </h2>
          <p className="text-white opacity-95 mb-6 sm:mb-8 lg:mb-10 text-sm sm:text-base lg:text-lg leading-relaxed">
            Rejoignez DaloaMarket et commencez à vendre dès aujourd'hui !
          </p>
          <Link to="/create-listing" className="btn-primary bg-white text-secondary hover:bg-grey-100 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 font-semibold">
            Publier une annonce
          </Link>
        </div>
      </section>

      {/* Credits Display */}
      {user && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50">
          <div className="bg-white rounded-lg lg:rounded-xl shadow-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex items-center gap-1.5 sm:gap-2 lg:gap-3 border border-primary-200">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="font-semibold text-grey-700 text-xs sm:text-sm lg:text-base">Crédits:</span>
            <span className="text-sm sm:text-lg lg:text-xl font-bold text-primary">
              {userCredits !== null ? userCredits : <LoadingSpinner size="small" />}
            </span>
            <Link to="/acheter-credits" className="btn-primary py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-xs lg:text-sm ml-1">
              Acheter
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;