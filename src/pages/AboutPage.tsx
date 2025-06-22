import React from 'react';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-grey-50 py-10">
    <div className="container-custom max-w-2xl bg-white rounded-card shadow-card p-8">
      <h1 className="text-3xl font-bold mb-4">À propos de Daloa Market</h1>
      <p className="mb-4">
        Daloa Market est un projet local en <strong>phase de test (version bêta)</strong>, développé par un étudiant passionné de technologie.<br />
        Son but est de permettre aux habitants de Daloa, en particulier les étudiants, de revendre ou acheter facilement des objets d’occasion entre eux.
      </p>
      <p className="mb-4">
        Ce projet est actuellement <strong>testé à l’université de Daloa</strong> pour valider son utilité réelle et améliorer l’expérience avant un lancement officiel plus large.
      </p>
      <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded">
        ⚠️ Daloa Market est actuellement en <strong>phase de test (version bêta)</strong>.<br />
        Cette plateforme évolue rapidement grâce à vos retours. Certaines fonctionnalités ou conditions peuvent changer sans préavis.<br />
        <strong>Aucune structure juridique formelle n’est encore créée.</strong> L’activité reste à petite échelle et s’adapte selon les retours des utilisateurs.
      </div>
      <div className="mb-8 text-sm text-grey-600">
        Pour toute question sur la confidentialité, les conditions ou le fonctionnement, consultez aussi les pages <a href="/faq" className="text-primary underline">FAQ</a>, <a href="/help" className="text-primary underline">Aide</a>, <a href="/terms" className="text-primary underline">Conditions</a> et <a href="/privacy" className="text-primary underline">Confidentialité</a>.<br />
        Transparence : ce projet est développé dans un cadre étudiant, sans but lucratif, et n'engage aucune société commerciale.
      </div>
      <p className="mb-8">Merci de soutenir ce projet local 🙏</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">À propos du créateur</h2>
      <p className="mb-4">
        Je m'appelle Elmas Oulobo, étudiant en L3 Économie, option Modélisation Statistique Économique et Financière.<br />
        Depuis plusieurs années, je me passionne pour la programmation et le développement web.
      </p>
      <p className="mb-4">
        Tout a commencé un jour où je jouais à Subway Surfers. Le jeu m’énervait parce qu’il n’avait pas de fin !<br />
        Je me suis alors demandé : “Et si je le recodais moi-même, avec une vraie fin ?”<br />
        C’est comme ça que j’ai découvert le monde du code, en commençant par HTML, puis le reste a suivi.
      </p>
      <p className="mb-4">
        Aujourd’hui, je développe Daloa Market avec <strong>0 budget</strong>, uniquement avec ma connexion et ma détermination.<br />
        Mon objectif est de créer une solution utile pour ma ville, testée à l’université, puis étendue plus largement si ça marche.
      </p>
      <p className="mb-8">Merci à tous ceux qui soutiennent cette initiative locale 🙏</p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8 text-center">
        <p className="font-bold text-lg mb-2">💛 Soutenir Daloa Market</p>
        <p className="mb-2 text-sm">Aidez à faire évoluer ce projet local développé avec 0 budget !</p>
        <p className="mb-2">Envoyez un petit geste via Orange Money/ Wave au <strong>+225 07 88 00 08 31</strong> ou MTN <strong>+225 05 55 86 39 53</strong>.</p>
        <p className="text-sm">Les paiements sont vérifiés manuellement sous 24h maximum.</p>
        <p className="text-sm">Merci pour votre soutien 🙏</p>
      </div>
    </div>
  </div>
);

export default AboutPage;
