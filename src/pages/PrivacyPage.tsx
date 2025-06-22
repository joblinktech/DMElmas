import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-grey-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Politique de confidentialité</h1>
          
          <div className="prose max-w-none text-grey-700">
            <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded">
              ⚠️ Daloa Market est actuellement en <strong>phase de test (version bêta)</strong>.<br />
              Cette plateforme évolue rapidement grâce à vos retours. Certaines fonctionnalités ou conditions peuvent changer sans préavis.<br />
              L’activité reste à petite échelle et s’adapte selon les retours des utilisateurs.<br />
              <strong>Les paiements sont traités manuellement (Orange Money, MTN, Wave) et vérifiés sous 24h maximum.</strong>
            </div>
            
            <p>
              Chez DaloaMarket, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Informations que nous collectons</h2>
            <p>
              Nous collectons les informations suivantes :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Informations d'inscription : email, mot de passe</li>
              <li>Informations de profil : nom complet, numéro de téléphone, quartier</li>
              <li>Contenu généré par l'utilisateur : annonces, messages, avis</li>
              <li>Données de transaction : historique des achats de crédits et paiements de boosts via PayDunya</li>
              <li>Données d'utilisation : interactions avec le site, préférences</li>
              <li>Informations techniques : adresse IP, type d'appareil, navigateur</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Utilisation des informations</h2>
            <p>
              Nous utilisons vos informations pour :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Fournir, maintenir et améliorer notre service</li>
              <li>Gérer votre compte, vos crédits et vos achats de packs</li>
              <li>Traiter les transactions de crédits et de boosts</li>
              <li>Faciliter la communication entre les utilisateurs</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Envoyer des notifications relatives au service</li>
              <li>Détecter et prévenir les fraudes et abus</li>
              <li>Respecter nos obligations légales</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">3. Partage des informations</h2>
            <p>
              Nous pouvons partager vos informations dans les circonstances suivantes :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Avec d'autres utilisateurs (nom, quartier, évaluations) dans le cadre des transactions</li>
              <li>Avec nos prestataires de services (PayDunya pour les paiements de crédits et boosts)</li>
              <li>Si requis par la loi ou pour protéger nos droits</li>
              <li>En cas de fusion, acquisition ou vente d'actifs</li>
            </ul>
            <p>
              Nous ne vendons pas vos données personnelles à des tiers.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès, altération, divulgation ou destruction non autorisés. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée, et nous ne pouvons garantir une sécurité absolue.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Conservation des données</h2>
            <p>
              Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Si vous supprimez votre compte, nous supprimerons ou anonymiserons vos informations, sauf si nous devons les conserver pour des raisons légales.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Vos droits</h2>
            <p>
              Vous avez le droit de :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données inexactes</li>
              <li>Supprimer vos données dans certaines circonstances</li>
              <li>Limiter ou vous opposer au traitement de vos données</li>
              <li>Recevoir vos données dans un format structuré (portabilité)</li>
              <li>Retirer votre consentement à tout moment</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à privacy@daloamarket.com.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Cookies et technologies similaires</h2>
            <p>
              Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, comprendre comment vous utilisez notre service et personnaliser notre contenu. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Modifications de cette politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important par email ou par une notification sur notre site. Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance des dernières informations sur nos pratiques de confidentialité.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact</h2>
            <p>
              Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :
            </p>
            <p>
              Email : privacy@daloamarket.com<br />
              Adresse : Daloa, Côte d'Ivoire
            </p>
            
            <p className="mt-8">
              Date de dernière mise à jour : 29 mai 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;