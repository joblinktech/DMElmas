import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const EmailConfirmedPage: React.FC = () => {
  const location = useLocation();
  // Supabase met l'erreur dans le hash (ex: #error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired)
  const hash = location.hash;
  const params = new URLSearchParams(hash.replace('#', ''));
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center">
      <div className="bg-white rounded-card shadow-card p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <AlertCircle className="h-16 w-16 text-error-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Lien invalide ou expiré</h1>
            <p className="text-grey-700 mb-4">
              {decodeURIComponent(errorDescription || 'Le lien de confirmation est invalide ou a expiré. Veuillez demander un nouveau lien ou vous inscrire à nouveau.')}
            </p>
            <Link to="/login" className="btn-primary w-full">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-16 w-16 text-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email confirmé !</h1>
            <p className="text-grey-700 mb-4">
              Votre adresse email a bien été confirmée. Vous pouvez maintenant vous connecter et profiter de DaloaMarket.
            </p>
            <Link to="/login" className="btn-primary w-full">
              Revenir sur DaloaMarket
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmedPage;
