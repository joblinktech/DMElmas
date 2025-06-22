import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { signIn } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const from = location.state?.from?.pathname || '/';
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) throw error;
      
      toast.success('Connexion réussie');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error((error as Error).message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-md">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
          
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
            
            {/* Lien mot de passe oublié */}
            <div className="flex justify-end mb-2">
              <Link to="/auth/reset-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" className="text-white" />
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-grey-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// Modernisation UI/UX :
// - Formulaires : champs arrondis, labels, focus, erreurs
// - Boutons : classes utilitaires, transitions, feedback
// - Feedback visuel : loaders, messages
// - Responsive : paddings, tailles de texte
// - Accessibilité : focus visible, aria-labels