import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-grey-50 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-grey-600 mb-6">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;