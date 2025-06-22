import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialQuery = '', 
  className = '' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="relative">
          <input
            type="text"
            placeholder="Que recherchez-vous ?"
            className="w-full py-3 sm:py-3.5 lg:py-4 pl-10 sm:pl-12 lg:pl-14 pr-24 sm:pr-28 lg:pr-32 text-sm sm:text-base lg:text-lg rounded-xl lg:rounded-2xl border-2 border-grey-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-md group-hover:shadow-lg transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-3 sm:left-4 lg:left-5 top-3 sm:top-3.5 lg:top-4.5 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-grey-400" />
          <button 
            type="submit"
            className="absolute right-2 sm:right-2.5 lg:right-3 top-1.5 sm:top-2 lg:top-2 bg-primary text-white py-1.5 sm:py-2 lg:py-2.5 px-3 sm:px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-primary-600 transition-colors font-semibold shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
          >
            Rechercher
          </button>
        </div>
      </form>
      
      {/* Quick filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4 justify-center">
        {['Mode', 'Électronique', 'Maison', 'Auto', 'Sports'].map((category) => (
          <button
            key={category}
            onClick={() => navigate(`/search?category=${category.toLowerCase()}`)}
            className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white border border-grey-200 rounded-full text-xs sm:text-sm font-medium text-grey-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary transition-all"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;