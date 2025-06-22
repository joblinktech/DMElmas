import React, { useState } from 'react';

interface ManualPaymentFormProps {
  listingId: string;
  onSuccess?: () => void;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({ listingId, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      setScreenshot(file);
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
    if (!fullName || !phoneNumber || !screenshot) {
      alert('Veuillez remplir tous les champs et ajouter la preuve de paiement.');
      return;
    }
    setIsSubmitting(true);
    try {
      const screenshotBase64 = await convertFileToBase64(screenshot);
      const response = await fetch('/.netlify/functions/send-manual-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          fullName,
          phoneNumber,
          screenshotBase64,
          screenshotFilename: screenshot.name
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur lors de l\'envoi');
      alert('Preuve envoyée avec succès !');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Nom complet</label>
        <input
          type="text"
          className="input"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Numéro de téléphone</label>
        <input
          type="tel"
          className="input"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Preuve de paiement (capture d'écran)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer la preuve'}
      </button>
    </form>
  );
};

export default ManualPaymentForm;
