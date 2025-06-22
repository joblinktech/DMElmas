import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Heart, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-grey-900 to-grey-800 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center mr-3">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">DaloaMarket</span>
            </Link>
            <p className="text-grey-300 leading-relaxed mb-4">
              La première marketplace P2P de Daloa. Achetez et vendez facilement depuis chez vous.
            </p>
            <div className="flex items-center text-sm text-grey-400">
              <Heart className="h-4 w-4 mr-2 text-primary" />
              Fait avec amour à Daloa
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-primary-100">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Accueil</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Rechercher</span>
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Vendre un article</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Mon compte</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-primary-100">Catégories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/search?category=fashion" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Mode & Accessoires</span>
                </Link>
              </li>
              <li>
                <Link to="/search?category=electronics" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Électronique</span>
                </Link>
              </li>
              <li>
                <Link to="/search?category=home" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Maison & Jardin</span>
                </Link>
              </li>
              <li>
                <Link to="/search?category=vehicles" className="text-grey-300 hover:text-primary transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Auto & Moto</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-primary-100">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                Daloa, Côte d'Ivoire
              </li>
              <li className="flex items-center group">
                <Phone className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                Orange Money/Wave : +225 07 88 00 08 31<br />
                MTN Mobile Money : +225 05 55 86 39 53
              </li>
              <li className="flex items-center group">
                <Mail className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                daloamarket@gmail.com
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-grey-700 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-grey-400 text-sm mb-2">
                &copy; {new Date().getFullYear()} DaloaMarket. Tous droits réservés.
              </p>
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-3">
                <p className="text-xs text-orange-300 leading-relaxed">
                  ⚠️ <strong>Version Bêta</strong> - Projet étudiant en développement. 
                  Aucune structure juridique formelle n'a encore été créée.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-6">
              <Link to="/terms" className="text-grey-400 hover:text-primary text-sm transition-colors flex items-center">
                Conditions d'utilisation
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
              <Link to="/privacy" className="text-grey-400 hover:text-primary text-sm transition-colors flex items-center">
                Confidentialité
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
              <Link to="/help" className="text-grey-400 hover:text-primary text-sm transition-colors flex items-center">
                Aide
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;