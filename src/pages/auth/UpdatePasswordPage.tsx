import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const UpdatePasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Veuillez remplir les deux champs');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe mis à jour ! Vous pouvez vous connecter.');
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-grey-50 to-grey-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-5">
        <h1 className="text-2xl font-bold text-grey-900 mb-2">Nouveau mot de passe</h1>
        <p className="text-grey-600 mb-4 text-sm">Choisissez un nouveau mot de passe pour votre compte.</p>
        <input
          type="password"
          className="input-field w-full"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field w-full"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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

export default UpdatePasswordPage;
