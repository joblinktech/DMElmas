import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const HelpPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<ContactFormData>();
  
  const onSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message envoyé avec succès');
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">Aide & Support</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-card shadow-card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Contactez-nous</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:daloamarket@gmail.com" className="text-grey-600 hover:text-primary">
                      daloamarket@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Téléphones</p>
                    <div className="space-y-1">
                      <a href="tel:+2250788000831" className="text-grey-600 hover:text-primary block">
                        +225 07 88 00 08 31 (Orange/Wave)
                      </a>
                      <a href="tel:+2250555863953" className="text-grey-600 hover:text-primary block">
                        +225 05 55 86 39 53 (MTN)
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-grey-600">
                      Quartier Lobia<br />
                      Daloa, Côte d'Ivoire
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4">Liens utiles</h2>
              
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-grey-600 hover:text-primary transition-colors">
                    Questions fréquentes
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-grey-600 hover:text-primary transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-grey-600 hover:text-primary transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="text-lg font-semibold mb-6">Envoyez-nous un message</h2>
              
              {/* Alert for beta status */}
              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded">
                ⚠️ Daloa Market est actuellement en <strong>phase de test (version bêta)</strong>.<br />
                Cette plateforme évolue rapidement grâce à vos retours. Certaines fonctionnalités ou conditions peuvent changer sans préavis.<br />
                <strong>Aucune structure juridique formelle n'est encore créée.</strong> L'activité reste à petite échelle et s'adapte selon les retours des utilisateurs.
              </div>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message envoyé !</h3>
                  <p className="text-grey-600 mb-6">
                    Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="input-label">
                        Nom complet
                      </label>
                      <input
                        id="name"
                        type="text"
                        className={`input-field ${errors.name ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="Votre nom"
                        {...register('name', { 
                          required: 'Le nom est requis' 
                        })}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="input-error flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="input-label">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className={`input-field ${errors.email ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="votre@email.com"
                        {...register('email', { 
                          required: 'L\'email est requis',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Adresse email invalide'
                          }
                        })}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="input-error flex items-center mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="input-label">
                      Sujet
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className={`input-field ${errors.subject ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                      placeholder="Sujet de votre message"
                      {...register('subject', { 
                        required: 'Le sujet est requis' 
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.subject && (
                      <p className="input-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="input-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className={`input-field ${errors.message ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}`}
                      placeholder="Votre message..."
                      {...register('message', { 
                        required: 'Le message est requis',
                        minLength: {
                          value: 10,
                          message: 'Le message doit contenir au moins 10 caractères'
                        }
                      })}
                      disabled={isSubmitting}
                    ></textarea>
                    {errors.message && (
                      <p className="input-error flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="small" className="text-white" />
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;