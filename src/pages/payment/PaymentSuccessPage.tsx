import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const listingId = queryParams.get('listing_id');
  const paymentType = queryParams.get('type');
  const userId = queryParams.get('user_id');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [message, setMessage] = useState('Votre paiement a été traité avec succès !');
  
  useEffect(() => {
    const updateTransactionStatus = async () => {
      try {
        // Attendre un peu pour que le callback soit traité
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (listingId) {
          // Vérifier si l'annonce a été publiée
          const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('status')
            .eq('id', listingId)
            .single();
          
          if (!listingError && listing) {
            if (listing.status === 'active') {
              setMessage('Votre annonce a été publiée avec succès !');
            } else {
              setMessage('Paiement reçu. Votre annonce sera publiée sous peu.');
            }
          }
        } else if (paymentType === 'pack') {
          setMessage('Vos crédits ont été ajoutés à votre compte !');
          // Marquer l'achat de crédits comme réussi
          localStorage.setItem('credit_purchase_pending', 'true');
        } else if (paymentType === 'boost') {
          setMessage('Votre boost a été appliqué avec succès !');
        }
        
        // Récupérer la transaction
        if (userId) {
          const { data: transactions, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!fetchError && transactions && transactions.length > 0) {
            setTransactionId(transactions[0].id);
          }
        }
      } catch (error) {
        console.error('Error updating transaction:', error);
      } finally {
        setLoading(false);
      }
    };
    
    updateTransactionStatus();
  }, [listingId, paymentType, userId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-grey-600">Traitement de votre paiement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="h-20 w-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Paiement réussi !</h1>
          
          <p className="text-grey-600 mb-6">
            {message}
          </p>
          
          {transactionId && (
            <p className="text-sm text-grey-500 mb-6">
              Référence de transaction: {transactionId}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {listingId && (
              <Link 
                to={`/listings/${listingId}`} 
                className="btn-primary"
              >
                Voir mon annonce
              </Link>
            )}
            
            {paymentType === 'pack' && (
              <Link 
                to="/profile" 
                className="btn-primary"
              >
                Voir mes crédits
              </Link>
            )}
            
            <button 
              onClick={() => navigate('/')} 
              className="btn-secondary"
            >
              Retour à l'accueil
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              💡 <strong>Merci d'utiliser DaloaMarket !</strong><br />
              Votre paiement a été traité via PayDunya de manière sécurisée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;