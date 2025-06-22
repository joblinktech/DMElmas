import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { signUp } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<RegisterFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) throw error;
      
      toast.success('Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre adresse.');
      setShowEmailNotice(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error((error as Error).message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-md">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="votre@email.com"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide'
                    }
                  })}
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.email && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="input-label">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className={`input-field pl-10 ${errors.password ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.password && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="input-label">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="••••••••"
                  {...register('confirmPassword', { 
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: value => value === password || 'Les mots de passe ne correspondent pas'
                  })}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.confirmPassword && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" className="text-white" />
              ) : (
                'S\'inscrire'
              )}
            </button>
          </form>
          
          {showEmailNotice && (
            <div className="bg-info-50 border-l-4 border-info-500 p-4 mb-6 text-info-900">
              <p className="font-semibold mb-1">Vérification de l'email requise</p>
              <p>Un email de confirmation vient de vous être envoyé. Merci de cliquer sur le lien reçu pour activer votre compte.</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-grey-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

// Modernisation UI/UX :
// - Formulaires : champs arrondis, labels, focus, erreurs
// - Boutons : classes utilitaires, transitions, feedback
// - Feedback visuel : loaders, messages
// - Responsive : paddings, tailles de texte
// - Accessibilité : focus visible, aria-labels