import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Zap } from 'lucide-react';
import { formatPrice, formatDate } from '../../lib/utils';
import { Database } from '../../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ListingCardProps {
  listing: Listing;
  onPress?: () => void;
  sellerName?: string;
  sellerRating?: number | null;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onPress,
  sellerName,
  sellerRating 
}) => {
  const mainImage = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400';

  const isBoostActive = listing.boosted_until && new Date(listing.boosted_until) > new Date();

  const CardContent = () => (
    <div className="group block bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-grey-100 hover:border-primary-200 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-grey-100">
        <img 
          src={mainImage} 
          alt={listing.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Boost Badge */}
        {isBoostActive && (
          <div className="absolute top-1.5 sm:top-2 lg:top-3 left-1.5 sm:left-2 lg:left-3 bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full flex items-center shadow-lg">
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 fill-current" />
            <span className="hidden sm:inline">Sponsorisé</span>
            <span className="sm:hidden">Boost</span>
          </div>
        )}

        {/* Status Badge */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-error-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full font-bold text-xs sm:text-sm">
              VENDU
            </span>
          </div>
        )}

        {/* Photo Count */}
        {listing.photos && listing.photos.length > 1 && (
          <div className="absolute top-1.5 sm:top-2 lg:top-3 right-1.5 sm:right-2 lg:right-3 bg-black bg-opacity-60 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {listing.photos.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 lg:p-4 space-y-1.5 sm:space-y-2 lg:space-y-3">
        {/* Title and Price */}
        <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
          <h3 className="font-semibold text-grey-900 line-clamp-2 text-xs sm:text-sm lg:text-base leading-tight group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
        </div>

        {/* Location and Date */}
        <div className="flex items-center justify-between text-xs text-grey-600">
          <div className="flex items-center min-w-0 flex-1">
            <MapPin className="h-3 w-3 mr-1 text-grey-400 flex-shrink-0" />
            <span className="truncate">{listing.district}</span>
          </div>
          <div className="flex items-center ml-2 flex-shrink-0">
            <Clock className="h-3 w-3 mr-1 text-grey-400" />
            <span className="text-xs">{formatDate(listing.created_at)}</span>
          </div>
        </div>

        {/* Seller Info */}
        {sellerName && (
          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-grey-100">
            <span className="text-xs text-grey-600 truncate flex-1">{sellerName}</span>
            {sellerRating && (
              <div className="flex items-center ml-2 flex-shrink-0">
                <Star className="h-3 w-3 text-primary fill-current" />
                <span className="text-xs font-medium ml-0.5">{sellerRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (onPress) {
    return (
      <button onClick={onPress} className="w-full text-left">
        <CardContent />
      </button>
    );
  }

  return (
    <Link to={`/listings/${listing.id}`}>
      <CardContent />
    </Link>
  );
};

export default ListingCard;