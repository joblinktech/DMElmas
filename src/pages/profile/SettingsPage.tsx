import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Phone, MapPin, AlertCircle, Save } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DISTRICTS, validateIvorianPhone } from '../../lib/utils';

interface SettingsFormData {
  full_name: string;
  phone: string;
  district: string;
}

const SettingsPage: React.FC = () => {
  const { user, userProfile, updateUserProfile } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty } 
  } = useForm<SettingsFormData>({
    defaultValues: {
      full_name: userProfile?.full_name || '',
      phone: userProfile?.phone || '',
      district: userProfile?.district || '',
    }
  });
  
  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await updateUserProfile({
        full_name: data.full_name,
        phone: data.phone,
        district: data.district,
      });
      
      if (error) throw error;
      
      toast.success('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error((error as Error).message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Paramètres du compte</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field bg-grey-50"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-grey-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>
            
            <div>
              <label htmlFor="full_name" className="input-label">
                Nom complet
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  className={`input-field pl-10 ${errors.full_name ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="Votre nom complet"
                  {...register('full_name', { 
                    required: 'Le nom complet est requis',
                    minLength: {
                      value: 3,
                      message: 'Le nom doit contenir au moins 3 caractères'
                    }
                  })}
                  disabled={isLoading}
                />
                <User className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.full_name && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.full_name.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="input-label">
                Numéro de téléphone
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  className={`input-field pl-10 ${errors.phone ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="+225 XX XX XX XX XX"
                  {...register('phone', { 
                    required: 'Le numéro de téléphone est requis',
                    validate: value => 
                      validateIvorianPhone(value) || 
                      'Veuillez entrer un numéro de téléphone ivoirien valide'
                  })}
                  disabled={isLoading}
                />
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.phone && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}
              <p className="text-xs text-grey-500 mt-1">
                Format: +225 XX XX XX XX XX ou 07 XX XX XX XX
              </p>
            </div>
            
            <div>
              <label htmlFor="district" className="input-label">
                Quartier à Daloa
              </label>
              <div className="relative">
                <select
                  id="district"
                  className={`input-field pl-10 ${errors.district ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                  {...register('district', { 
                    required: 'Le quartier est requis'
                  })}
                  disabled={isLoading}
                >
                  <option value="">Sélectionnez votre quartier</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-grey-400" />
              </div>
              {errors.district && (
                <p className="input-error flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.district.message}
                </p>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-outline mr-3"
                disabled={isLoading}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={isLoading || !isDirty}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" className="text-white" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

// Modernisation UI/UX :
// - Formulaires : champs arrondis, labels, focus, erreurs
// - Boutons : classes utilitaires, transitions, feedback
// - Feedback visuel : loaders, messages
// - Responsive : paddings, tailles de texte
// - Accessibilité : focus visible, aria-labels