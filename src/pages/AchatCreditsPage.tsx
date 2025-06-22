import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Info
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CREDIT_PACKS = [
  { 
    id: 'starter', 
    name: 'Starter', 
    credits: 3, 
    price: 500,
    description: 'Parfait pour commencer',
    popular: false
  },
  { 
    id: 'regular', 
    name: 'Regular', 
    credits: 10, 
    price: 1500,
    description: 'Le plus populaire',
    popular: true
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    credits: 30, 
    price: 3500,
    description: 'Pour les vendeurs actifs',
    popular: false
  },
];

interface PurchaseFormData {
  selectedPack: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  screenshot: File | null;
}

const AchatCreditsPage: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'explanation' | 'form' | 'success'>('explanation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    selectedPack: '',
    phoneNumber: '',
    email: user?.email || '',
    fullName: '',
    screenshot: null
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedPack || !formData.phoneNumber || !formData.email || !formData.fullName || !formData.screenshot) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convertir le fichier en base64
      const screenshotBase64 = await convertFileToBase64(formData.screenshot);
      
      // Envoyer la demande via la fonction Netlify
      const response = await fetch('/.netlify/functions/send-credit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPack: formData.selectedPack,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          fullName: formData.fullName,
          screenshotBase64: screenshotBase64,
          screenshotFilename: formData.screenshot.name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
      
      toast.success('Demande envoyée avec succès !');
      setCurrentStep('success');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPack = CREDIT_PACKS.find(pack => pack.id === formData.selectedPack);

  if (currentStep === 'explanation') {
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
            <h1 className="ml-3 text-lg font-semibold text-grey-900">Acheter des crédits</h1>
          </div>
        </div>

        <div className="container-custom py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-grey-600 hover:text-grey-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <h1 className="text-3xl font-bold text-grey-900">Acheter des crédits</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Explanation Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-6 lg:p-8 mb-6">
              <div className="text-center mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Info className="h-8 w-8 lg:h-10 lg:w-10 text-orange-600" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-grey-900 mb-3 lg:mb-4">
                  Processus d'achat avec envoi automatique
                </h2>
                <p className="text-grey-600 text-base lg:text-lg leading-relaxed">
                  Effectuez votre paiement puis envoyez-nous la preuve. Votre demande sera traitée automatiquement par email.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm lg:text-base">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-900 mb-1 lg:mb-2">Choisissez votre pack</h3>
                    <p className="text-grey-600 text-sm lg:text-base">Sélectionnez le nombre de crédits souhaité</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm lg:text-base">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-900 mb-1 lg:mb-2">Effectuez le paiement</h3>
                    <p className="text-grey-600 text-sm lg:text-base">
                      Envoyez le montant via :
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-grey-700 font-medium text-sm lg:text-base">
                        <strong>Orange Money / Wave :</strong> +225 07 88 00 08 31
                      </p>
                      <p className="text-grey-700 font-medium text-sm lg:text-base">
                        <strong>MTN Mobile Money :</strong> +225 05 55 86 39 53
                      </p>
                    </div>
                    <p className="text-grey-600 text-xs mt-2">Nom du bénéficiaire : Oulobo Elmas Tresor</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm lg:text-base">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-900 mb-1 lg:mb-2">Envoyez la preuve de paiement</h3>
                    <p className="text-grey-600 text-sm lg:text-base">Téléchargez la capture d'écran de votre paiement et remplissez le formulaire. Notre équipe vérifiera manuellement votre paiement sous 24h maximum.</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8">
                <h3 className="font-semibold text-primary-800 mb-3 lg:mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Informations de paiement
                </h3>
                <div className="space-y-2 text-sm lg:text-base">
                  <p className="text-primary-700">
                    <strong>Orange Money / Wave :</strong> +225 07 88 00 08 31
                  </p>
                  <p className="text-primary-700">
                    <strong>MTN Mobile Money :</strong> +225 05 55 86 39 53
                  </p>
                  <p className="text-primary-700">
                    <strong>Nom :</strong> Oulobo Elmas Tresor
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('form')}
                className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-semibold py-3 lg:py-4 px-6 rounded-xl lg:rounded-2xl hover:from-primary-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-base lg:text-lg"
              >
                Continuer vers l'achat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => setCurrentStep('explanation')}
              className="p-2 -ml-2 rounded-xl hover:bg-grey-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-grey-600" />
            </button>
            <h1 className="ml-3 text-lg font-semibold text-grey-900">Formulaire d'achat</h1>
          </div>
        </div>

        <div className="container-custom py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <button 
              onClick={() => setCurrentStep('explanation')}
              className="flex items-center text-grey-600 hover:text-grey-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <h1 className="text-3xl font-bold text-grey-900">Formulaire d'achat</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Pack Selection */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-6 lg:p-8 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-grey-900 mb-4 lg:mb-6">
                Choisissez votre pack
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CREDIT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPack: pack.id }))}
                    className={`relative cursor-pointer rounded-xl lg:rounded-2xl border-2 p-4 lg:p-6 transition-all duration-200 transform hover:scale-105 ${
                      formData.selectedPack === pack.id
                        ? 'border-primary bg-primary-50 shadow-lg'
                        : 'border-grey-200 bg-white hover:border-primary-200 hover:shadow-md'
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAIRE
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="font-bold text-lg lg:text-xl text-grey-900 mb-2">
                        {pack.name}
                      </h3>
                      <div className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                        {pack.credits}
                      </div>
                      <div className="text-sm text-grey-600 mb-2">crédits</div>
                      <div className="text-xl lg:text-2xl font-bold text-grey-900 mb-2">
                        {pack.price} FCFA
                      </div>
                      <div className="text-xs lg:text-sm text-grey-500">
                        {pack.description}
                      </div>
                    </div>
                    
                    {formData.selectedPack === pack.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            {formData.selectedPack && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-grey-900 mb-4 lg:mb-6">
                  Informations de transaction
                </h2>

                {/* Selected Pack Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-primary-800">Pack sélectionné</h3>
                      <p className="text-primary-700">{selectedPack?.name} - {selectedPack?.credits} crédits</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{selectedPack?.price} FCFA</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm lg:text-base font-semibold text-grey-700 mb-2 lg:mb-3">
                      Capture d'écran de la transaction *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="screenshot-upload"
                        required
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 lg:h-40 border-2 border-dashed rounded-xl lg:rounded-2xl cursor-pointer transition-colors ${
                          formData.screenshot
                            ? 'border-primary bg-primary-50'
                            : 'border-grey-300 bg-grey-50 hover:border-primary hover:bg-primary-50'
                        }`}
                      >
                        {formData.screenshot ? (
                          <div className="text-center">
                            <CheckCircle className="h-8 w-8 lg:h-10 lg:w-10 text-primary mx-auto mb-2" />
                            <p className="text-sm lg:text-base font-medium text-primary">
                              {formData.screenshot.name}
                            </p>
                            <p className="text-xs lg:text-sm text-grey-600">Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 lg:h-10 lg:w-10 text-grey-400 mx-auto mb-2" />
                            <p className="text-sm lg:text-base font-medium text-grey-600">
                              Télécharger la capture
                            </p>
                            <p className="text-xs lg:text-sm text-grey-500">PNG, JPG jusqu'à 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm lg:text-base font-semibold text-grey-700 mb-2 lg:mb-3">
                      Numéro qui a été débité *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 lg:py-4 border border-grey-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-base lg:text-lg"
                        placeholder="+225 XX XX XX XX XX"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm lg:text-base font-semibold text-grey-700 mb-2 lg:mb-3">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 lg:py-4 border border-grey-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-base lg:text-lg"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm lg:text-base font-semibold text-grey-700 mb-2 lg:mb-3">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 lg:py-4 border border-grey-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-base lg:text-lg"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 lg:mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-semibold py-3 lg:py-4 px-6 rounded-xl lg:rounded-2xl hover:from-primary-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base lg:text-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" className="text-white mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer la demande'
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="mt-4 lg:mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm lg:text-base text-blue-800">
                      <p className="font-medium mb-1">Traitement automatique</p>
                      <p>Votre demande sera envoyée automatiquement par email à notre équipe. Vous recevrez une confirmation dans les 24h.</p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-grey-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-green-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 lg:h-12 lg:w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Demande envoyée !</h2>
          <p className="text-grey-700 mb-4">Votre preuve de paiement a bien été transmise à notre équipe.<br/>Après vérification manuelle (sous 24h maximum), vos crédits seront ajoutés à votre compte.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full bg-gradient-to-r from-primary to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-600 hover:to-orange-600 transition-all duration-200"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AchatCreditsPage;