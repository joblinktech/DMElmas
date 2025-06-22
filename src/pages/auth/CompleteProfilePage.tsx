import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DISTRICTS, validateIvorianPhone } from '../../lib/utils';

interface ProfileFormData {
  full_name: string;
  phone: string;
  district: string;
}

const CompleteProfilePage: React.FC = () => {
  const { user, createUserProfile } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ProfileFormData>();
  
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour compléter votre profil');
      }
      
      const { error } = await createUserProfile({
        email: user.email || '',
        full_name: data.full_name,
        phone: data.phone,
        district: data.district,
      });
      
      if (error) throw error;
      
      toast.success('Profil complété avec succès !');
      navigate('/');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Erreur lors de la création du profil');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-md">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Compléter votre profil</h1>
          <p className="text-grey-600 text-center mb-6">
            Ces informations sont nécessaires pour utiliser DaloaMarket
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small\" className="text-white" />
              ) : (
                'Compléter mon profil'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;