import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { AlertCircle, ArrowLeft, CheckCircle2, Upload, CreditCard } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSupabase } from '../../contexts/SupabaseContext';
import { supabase } from '../../lib/supabase';

// --- Définition locale des constantes manquantes ---
const CATEGORIES = [
  { id: 'electronique', label: 'Électronique' },
  { id: 'maison', label: 'Maison' },
  { id: 'mode', label: 'Mode' },
  { id: 'vehicule', label: 'Véhicule' },
  { id: 'autre', label: 'Autre' },
];
const CONDITIONS = [
  { id: 'neuf', label: 'Neuf' },
  { id: 'tres_bon', label: 'Très bon état' },
  { id: 'bon', label: 'Bon état' },
  { id: 'correct', label: 'État correct' },
];
const DISTRICTS = [
  'Abattoir', 'Commerce', 'Orly', 'Tazibouo', 'Garage', 'Lycée', 'Gbokora', 'Bla', 'Autre'
];

interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  district: string;
}

const ListingCreatePage: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoErrors, setPhotoErrors] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isFirstListing, setIsFirstListing] = useState<boolean | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ListingFormData>();
  
  useEffect(() => {
    const verifyUser = async () => {
      if (!user?.id) {
        setIsCheckingUser(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setIsUserVerified(!!data);
      } catch (error) {
        console.error('Error verifying user:', error);
        setIsUserVerified(false);
      } finally {
        setIsCheckingUser(false);
      }
    };

    verifyUser();
  }, [user]);
  
  useEffect(() => {
    const checkFirstListing = async () => {
      if (!user?.id) {
        setIsFirstListing(null);
        return;
      }
      // Nouvelle logique : on regarde le champ first_listing_at du profil
      const { data, error } = await supabase
        .from('users')
        .select('first_listing_at')
        .eq('id', user.id)
        .single();
      if (error) {
        setIsFirstListing(null);
        return;
      }
      setIsFirstListing(!data?.first_listing_at); // true si null, donc gratuité
    };
    checkFirstListing();
  }, [user]);
  
  // Récupérer le solde de crédits à l'ouverture
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) {
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
  
  // Fonction pour décrémenter le crédit
  const decrementCredit = async () => {
    if (!user?.id) return false;
    // @ts-expect-error appel RPC custom
    const { error } = await (supabase as unknown).rpc('decrement_user_credit', { user_id_input: user.id });
    if (error) return false;
    setUserCredits((c) => (c !== null ? c - 1 : null));
    return true;
  };
  
  // Correction du bloc useDropzone : suppression du doublon et fermeture correcte
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(file => {
          if (file.errors[0].code === 'file-too-large') {
            return 'Image trop volumineuse (max 5MB)';
          }
          return file.errors[0].message;
        });
        setPhotoErrors(errors[0]);
        return;
      }
      if (acceptedFiles.length + photoFiles.length > 5) {
        setPhotoErrors('Maximum 5 photos autorisées');
        return;
      }
      setPhotoErrors(null);
      setPhotoFiles(prev => [...prev, ...acceptedFiles]);
    }
  });
  
  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) {
      throw new Error('Veuillez ajouter au moins une photo');
    }
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user!.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading photos:', error);
      if (error instanceof Error) {
        throw new Error(error.message || "Erreur lors de l'upload des photos");
      } else {
        throw new Error("Erreur lors de l'upload des photos");
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const saveListing = async (formData: ListingFormData, photoUrls: string[], status: 'active' | 'pending' = 'active') => {
    if (!user?.id || !isUserVerified) {
      throw new Error("Votre compte n'est pas correctement configuré");
    }
    // Création de l'annonce
    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        district: formData.district,
        photos: photoUrls,
        status: status
      })
      .select()
      .single();
    if (error) throw error;
    // Suppression de la mise à jour manuelle du champ first_listing_at (désormais géré par le trigger SQL)
    return data;
  };
  
  const onSubmit = async (data: ListingFormData) => {
    // Validation stricte : au moins une image
    if (photoFiles.length === 0) {
      setPhotoErrors('Veuillez ajouter au moins une photo');
      return;
    }
    setPhotoErrors(null);
    setIsLoading(true);

    try {
      // Upload des photos
      const photoUrls = await uploadPhotos();

      // Cas 1 : Première annonce gratuite
      if (isFirstListing) {
        const listing = await saveListing(data, photoUrls, 'active');
        toast.success('Votre première annonce a été publiée gratuitement !');
        navigate(`/listings/${listing.id}`);
        return;
      }

      // Cas 2 : Utilisateur a des crédits
      if (userCredits && userCredits > 0) {
        const decremented = await decrementCredit();
        if (!decremented) {
          toast.error('Erreur lors de la consommation du crédit.');
          setIsLoading(false);
          return;
        }
        const listing = await saveListing(data, photoUrls, 'active');
        toast.success('Annonce publiée ! 1 crédit consommé.');
        navigate(`/listings/${listing.id}`);
        return;
      }

      // Cas 3 : Pas de crédits => afficher les options de paiement
      await saveListing(data, photoUrls, 'pending');
      setShowPaymentInfo(true);
      
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Erreur lors de la création de l\'annonce');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isUserVerified) {
    return (
      <div className="min-h-screen bg-grey-50 py-8">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-card shadow-card p-6 md:p-8 text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Compte non configuré</h1>
            <p className="text-grey-600 mb-6">
              Votre compte n'est pas correctement configuré. Veuillez vous reconnecter pour résoudre ce problème.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal d'information de paiement
  if (showPaymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 -ml-2 rounded-xl hover:bg-grey-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-grey-600" />
            </button>
            <h1 className="ml-3 text-lg font-semibold text-grey-900">Annonce créée</h1>
          </div>
        </div>

        <div className="container-custom py-4 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <CheckCircle2 className="h-8 w-8 lg:h-10 lg:w-10 text-green-600" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-grey-900 mb-3 lg:mb-4">
                Annonce créée avec succès !
              </h2>
              <p className="text-grey-600 mb-6 lg:mb-8 text-base lg:text-lg leading-relaxed">
                Votre annonce a été créée mais n'est pas encore visible. Pour la publier, vous devez soit acheter des crédits, soit payer 200 FCFA.
              </p>
              {/* Options de paiement */}
              <div className="space-y-4 mb-6 lg:mb-8">
                <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 lg:p-6 border border-primary-200">
                  <h3 className="font-semibold text-primary-800 mb-2 lg:mb-3">Option 1 : Acheter des crédits</h3>
                  <p className="text-primary-700 text-sm lg:text-base mb-3 lg:mb-4">
                    Achetez un pack de crédits pour publier plusieurs annonces
                  </p>
                  <button
                    onClick={() => navigate('/acheter-credits')}
                    className="btn-primary w-full"
                  >
                    Acheter des crédits
                  </button>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-primary-50 rounded-xl p-4 lg:p-6 border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 lg:mb-3">Option 2 : Paiement mobile (200 FCFA)</h3>
                  <p className="text-orange-700 text-sm lg:text-base mb-3 lg:mb-4">
                    Payez par mobile money pour publier cette annonce immédiatement.
                  </p>
                  <p className="text-sm lg:text-base text-grey-700 mb-2">
                    <strong>MTN :</strong> +225 05 55 86 39 53
                  </p>
                  <p className="text-sm lg:text-base text-grey-700">
                    <strong>Nom :</strong> Oulobo Elmas Tresor
                  </p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-blue-600 mb-3 lg:mb-4">
                Après le paiement, envoyez la capture d'écran via WhatsApp au même numéro avec votre email pour identification.
              </p>
              <a
                href="https://wa.me/2250788000831?text=Bonjour,%20j'ai%20effectué%20le%20paiement%20de%20200%20FCFA%20pour%20publier%20mon%20annonce.%20Voici%20ma%20capture%20d'écran%20et%20mon%20email%20:"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-green-700 transition-all duration-200 text-sm lg:text-base inline-block"
              >
                Envoyer via WhatsApp
              </a>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full border-2 border-grey-300 text-grey-700 font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:border-grey-400 hover:bg-grey-50 transition-all duration-200 text-sm lg:text-base"
                >
                  Voir mes annonces
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-grey-600 hover:text-grey-900 transition-colors text-sm lg:text-base"
                >
                  Retour à l'accueil
                </button>
              </div>
              {/* Info */}
              <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2 lg:gap-3">
                  <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs lg:text-sm text-yellow-800">
                    <p className="font-medium mb-1">Traitement manuel</p>
                    <p>Votre annonce sera publiée dans les 24h après réception du paiement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-grey-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-grey-600" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-grey-900">Publier une annonce</h1>
        </div>
      </div>

      <div className="container-custom py-4 lg:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-grey-600 hover:text-grey-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <h1 className="text-3xl font-bold text-grey-900">Publier une annonce</h1>
          </div>

          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden border border-primary-100">
            {/* Header visuel */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-4 lg:px-8 py-6 lg:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white drop-shadow mb-2 sm:mb-0">Publier une annonce</h1>
              {user && (
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="bg-white/20 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full font-semibold text-sm lg:text-lg shadow">
                    Crédits : <span className="font-bold">{userCredits === null ? '...' : userCredits}</span>
                  </span>
                  <button
                    type="button"
                    className="btn-outline border-white text-white hover:bg-white/10 hover:text-white text-sm lg:text-base py-1.5 lg:py-2 px-3 lg:px-4"
                    onClick={() => navigate('/acheter-credits')}
                  >
                    Acheter des crédits
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-10 px-4 lg:px-8 py-6 lg:py-10">
              {/* Photos */}
              <div>
                <label className="input-label text-base lg:text-lg font-semibold mb-2 block">
                  Photos <span className="text-grey-500 font-normal">(max 5)</span>
                </label>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl lg:rounded-2xl p-6 lg:p-8 text-center cursor-pointer transition-colors bg-grey-50 hover:bg-primary-50/40 ${
                    photoErrors ? 'border-error-500 bg-error-50' : 'border-primary-200'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3" />
                  <p className="text-grey-700 text-base lg:text-lg font-medium">
                    Glissez-déposez vos photos ici, ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm lg:text-base text-grey-500 mt-1">
                    Formats acceptés : JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
                
                <div className="mt-4 lg:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 lg:gap-4">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg lg:rounded-xl overflow-hidden group shadow border border-grey-200">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-white/80 hover:bg-error-500 hover:text-white text-error-500 rounded-full p-1 shadow transition-colors z-10 group-hover:opacity-100 opacity-80"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                {photoErrors && (
                  <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    {photoErrors}
                  </p>
                )}
              </div>
              
              {/* Title and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <label htmlFor="title" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                    Titre de l'annonce
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm ${
                      errors.title ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                    }`}
                    placeholder="Ex: Manette PS4 en très bon état"
                    {...register('title', { 
                      required: 'Le titre est requis',
                      minLength: {
                        value: 5,
                        message: 'Le titre doit contenir au moins 5 caractères'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Le titre ne doit pas dépasser 100 caractères'
                      }
                    })}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      {errors.title.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="price" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                    Prix (FCFA)
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      type="number"
                      className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm pr-16 lg:pr-20 ${
                        errors.price ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                      }`}
                      placeholder="Ex: 15000"
                      {...register('price', { 
                        required: 'Le prix est requis',
                        min: {
                          value: 200,
                          message: 'Le prix minimum est de 200 FCFA'
                        },
                        max: {
                          value: 10000000,
                          message: 'Le prix maximum est de 10 000 000 FCFA'
                        }
                      })}
                      disabled={isLoading}
                    />
                    <span className="absolute right-3 lg:right-4 top-3 text-grey-500 font-bold text-base lg:text-lg">
                      FCFA
                    </span>
                  </div>
                  {errors.price && (
                    <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm ${
                    errors.description ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                  }`}
                  placeholder="Décrivez votre article en détail (état, caractéristiques, raison de la vente...)"
                  {...register('description', { 
                    required: 'La description est requise',
                    minLength: {
                      value: 20,
                      message: 'La description doit contenir au moins 20 caractères'
                    }
                  })}
                  disabled={isLoading}
                ></textarea>
                {errors.description && (
                  <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    {errors.description.message}
                  </p>
                )}
              </div>
              
              {/* Category and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <label htmlFor="category" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm ${
                      errors.category ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                    }`}
                    {...register('category', { 
                      required: 'La catégorie est requise'
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      {errors.category.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="condition" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                    État
                  </label>
                  <select
                    id="condition"
                    className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm ${
                      errors.condition ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                    }`}
                    {...register('condition', { 
                      required: 'L\'état est requis'
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Sélectionnez l'état</option>
                    {CONDITIONS.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                      <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      {errors.condition.message}
                    </p>
                  )}
                </div>
              </div>
              
              {/* District */}
              <div>
                <label htmlFor="district" className="input-label text-base lg:text-lg font-semibold mb-2 block">
                  Quartier à Daloa
                </label>
                <select
                  id="district"
                  className={`input-field text-base lg:text-lg px-4 lg:px-5 py-3 rounded-lg lg:rounded-xl shadow-sm ${
                    errors.district ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
                  }`}
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
                {errors.district && (
                  <p className="input-error flex items-center mt-2 text-sm lg:text-base">
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    {errors.district.message}
                  </p>
                )}
              </div>
              
              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl lg:rounded-2xl p-4 lg:p-8 border border-primary-200 shadow-sm">
                <h3 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-primary">Coût de publication</h3>
                
                {isFirstListing ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 text-base lg:text-lg">Première annonce gratuite !</p>
                        <p className="text-green-700 text-sm lg:text-base">Votre première annonce sera publiée gratuitement.</p>
                      </div>
                    </div>
                  </div>
                ) : userCredits && userCredits > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-800 text-base lg:text-lg">1 crédit sera consommé</p>
                        <p className="text-blue-700 text-sm lg:text-base mb-3 lg:mb-4">
                          Vous avez {userCredits} crédit{userCredits > 1 ? 's' : ''} disponible{userCredits > 1 ? 's' : ''}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-orange-800 text-base lg:text-lg">Paiement requis</p>
                        <p className="text-orange-700 text-sm lg:text-base">
                          Vous devrez payer 200 FCFA ou acheter des crédits pour publier cette annonce.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms */}
              <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg lg:rounded-xl p-4 lg:p-6 border border-primary-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm lg:text-base text-grey-800">
                    En publiant cette annonce, vous acceptez les
                    <a
                      href="/terms"
                      className="text-primary font-semibold underline hover:text-primary-700 transition ml-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      conditions d'utilisation
                    </a>
                    de DaloaMarket et confirmez que votre article est conforme à nos règles.
                  </p>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full flex justify-center items-center text-base lg:text-lg py-3 lg:py-4"
                disabled={isLoading || isUploading || isFirstListing === null}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" className="text-white" />
                ) : isFirstListing ? (
                  'Publier gratuitement'
                ) : userCredits && userCredits > 0 ? (
                  'Publier (1 crédit)'
                ) : (
                  'Créer l\'annonce'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCreatePage;