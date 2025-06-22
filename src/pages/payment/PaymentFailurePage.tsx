import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentType = queryParams.get('type');
  
  const getRetryAction = () => {
    switch (paymentType) {
      case 'pack':
        return () => navigate('/acheter-credits');
      case 'annonce':
        return () => navigate('/create-listing');
      case 'boost':
        return () => navigate('/profile');
      default:
        return () => navigate('/');
    }
  };
  
  const getRetryText = () => {
    switch (paymentType) {
      case 'pack':
        return 'Réessayer l\'achat de crédits';
      case 'annonce':
        return 'Créer une nouvelle annonce';
      case 'boost':
        return 'Retour au profil';
      default:
        return 'Retour à l\'accueil';
    }
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="h-20 w-20 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-error" />
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-4">Paiement annulé</h1>
          
          <p className="text-grey-600 mb-6">
            Votre paiement a été annulé ou n'a pas pu être traité. Aucun montant n'a été débité de votre compte.
          </p>
          
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 text-left">
            <h3 className="font-semibold text-orange-800 mb-2">Que s'est-il passé ?</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Le paiement a été annulé par l'utilisateur</li>
              <li>• Problème de connexion avec PayDunya</li>
              <li>• Solde insuffisant sur votre compte mobile money</li>
              <li>• Timeout de la session de paiement</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={getRetryAction()} 
              className="btn-primary"
            >
              {getRetryText()}
            </button>
            
            <Link 
              to="/help" 
              className="btn-outline"
            >
              Contacter le support
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-grey-50 rounded-lg">
            <p className="text-sm text-grey-600">
              <strong>Besoin d'aide ?</strong><br />
              Si vous rencontrez des difficultés récurrentes, n'hésitez pas à nous contacter via la page d'aide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;