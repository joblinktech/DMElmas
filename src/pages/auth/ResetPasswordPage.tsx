import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/update-password',
      });
      if (error) throw error;
      toast.success('Un email de réinitialisation a été envoyé.');
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la demande';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-grey-50 to-grey-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-5">
        <h1 className="text-2xl font-bold text-grey-900 mb-2">Réinitialiser le mot de passe</h1>
        <p className="text-grey-600 mb-4 text-sm">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        <input
          type="email"
          className="input-field w-full"
          placeholder="Votre email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
        </button>
        <button
          type="button"
          className="w-full text-primary mt-2 text-sm hover:underline"
          onClick={() => navigate('/login')}
        >
          Retour à la connexion
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
