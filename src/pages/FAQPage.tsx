import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  const faqs: FAQItem[] = [
    {
      question: "DaloaMarket est-il en version finale ?",
      answer: "Non, DaloaMarket est actuellement en phase de test (version bêta) à l'université de Daloa. La plateforme évolue grâce aux retours des utilisateurs. Certaines fonctionnalités ou conditions peuvent changer rapidement. N'hésitez pas à signaler tout bug ou suggestion via la page d'aide ou le formulaire de contact.",
    },
    {
      question: "Qui est derrière DaloaMarket ?",
      answer: "DaloaMarket est développé par un étudiant passionné de technologie, sans structure juridique formelle à ce stade. Pour en savoir plus, consultez la page À propos.",
    },
    {
      question: "Comment publier une annonce sur DaloaMarket ?",
      answer: "Pour publier une annonce, connectez-vous à votre compte, cliquez sur 'Vendre' dans le menu principal, remplissez le formulaire avec les détails de votre article, ajoutez des photos, puis validez. Chaque publication consomme 1 crédit. Si vous n'avez plus de crédits, achetez un pack dans la section 'Acheter des crédits' ou publier l'annonce à 200 FCFA"
    },
    {
      question: "Combien coûte la publication d'une annonce ?",
      answer: "La publication d'une annonce consomme 1 crédit. Les packs de crédits sont disponibles : Starter (3 crédits), Regular (10 crédits), Pro (30 crédits). Les boosts restent payants à l'unité (300 FCFA pour 24h, 800 FCFA pour 7 jours, 2500 FCFA pour 30 jours)."
    },
    {
      question: "Comment fonctionne le paiement sur DaloaMarket ?",
      answer: "Les crédits s'achètent via FedaPay (Orange Money, MTN Mobile Money). Les boosts sont payés à l'unité via FedaPay. Les transactions entre acheteurs et vendeurs se font en personne."
    },
    {
      question: "Est-ce que je peux modifier mon annonce après publication ?",
      answer: "Oui, vous pouvez modifier votre annonce après publication. Accédez à votre profil, allez dans 'Mes annonces', sélectionnez l'annonce que vous souhaitez modifier et cliquez sur 'Modifier'. Notez que certaines modifications importantes peuvent nécessiter une nouvelle validation."
    },
    {
      question: "Comment supprimer mon annonce ?",
      answer: "Pour supprimer une annonce, accédez à votre profil, allez dans 'Mes annonces', sélectionnez l'annonce que vous souhaitez supprimer et cliquez sur 'Supprimer'. Une confirmation vous sera demandée avant la suppression définitive. La supression n'allume pas le crédit consommé."
    },
    {
      question: "Comment fonctionne le système d'évaluation ?",
      answer: "Après une transaction, l'acheteur peut évaluer le vendeur en lui attribuant une note de 1 à 5 étoiles et en laissant un commentaire. Ces évaluations sont visibles sur le profil du vendeur et aident à établir sa réputation sur la plateforme."
    },
    {
      question: "Que faire si je rencontre un problème avec un vendeur ?",
      answer: "Si vous rencontrez un problème avec un vendeur, essayez d'abord de résoudre le différend directement via la messagerie. Si le problème persiste, vous pouvez signaler l'annonce ou le vendeur en utilisant le bouton 'Signaler' disponible sur la page de l'annonce ou du profil."
    },
    {
      question: "Comment créer un compte sur DaloaMarket ?",
      answer: "Pour créer un compte, cliquez sur 'Inscription' dans le menu, entrez votre adresse email et créez un mot de passe. Vous devrez ensuite compléter votre profil avec votre nom complet, numéro de téléphone et quartier à Daloa avant de pouvoir utiliser toutes les fonctionnalités."
    },
    {
      question: "DaloaMarket est-il disponible dans d'autres villes que Daloa ?",
      answer: "Actuellement, DaloaMarket est spécifiquement conçu pour la ville de Daloa en Côte d'Ivoire. Nous prévoyons d'étendre nos services à d'autres villes ivoiriennes dans le futur."
    }
  ];
  
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded">
            ⚠️ DaloaMarket est en <strong>phase de test (version bêta)</strong>. Certaines fonctionnalités peuvent évoluer rapidement. Merci pour votre compréhension et vos retours !
          </div>
          <h1 className="text-2xl font-bold mb-6">Questions fréquentes</h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-grey-200 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 text-left font-medium focus:outline-none"
                  aria-label={`Toggle FAQ ${index + 1}: ${faq.question}`}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-grey-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-grey-500" />
                  )}
                </button>
                
                {openIndex === index && (
                  <div className="p-4 pt-0 text-grey-600 border-t border-grey-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Vous avez d'autres questions ?</h2>
            <p className="text-grey-600 mb-4">
              N'hésitez pas à nous contacter si vous ne trouvez pas la réponse à votre question.
            </p>
            <a 
              href="mailto:oulobotresorelmas@gmail.com" 
              className="btn-primary inline-block transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Contacter le support
            </a>
          </div>

          <div className="mt-8 text-sm text-grey-600 text-center">
            Besoin d'informations sur le projet ou son créateur ? <a href="/about" className="text-primary underline">Voir la page À propos</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;