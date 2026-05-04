import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Ticket, Heart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFavorites } from '../context/FavoritesContext';

export default function EventCard({ event, onBook }) {
  const eventDate = new Date(event.event_date);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(event.id);
  const isExpired = eventDate.getTime() < Date.now();
  const isSoldOut = event.tickets_available === 0;
  const bookingDisabled = isSoldOut || isExpired;
  const isUnavailable = isExpired;

  const handleFavorite = () => {
    toggleFavorite(event);
    toast.success(isLiked ? 'Removed from liked events' : 'Added to liked events');
  };

  return (
    <motion.div
      whileHover={!isUnavailable ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`h-full rounded-xl border overflow-hidden transition-all duration-300 flex flex-col ${
        isUnavailable
          ? 'bg-gray-100 dark:bg-gray-900/60 border-gray-300 dark:border-gray-700 grayscale opacity-70 cursor-not-allowed'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
      }`}
    >
      {/* Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-purple-600">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl text-white opacity-50">{'\ud83c\udfad'}</div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800">
            {event.category}
          </span>
        </div>

        {isUnavailable ? (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-900/80 text-white">
              Unavailable
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleFavorite}
              className={`w-8 h-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all ${
                isLiked ? 'ring-2 ring-rose-400' : ''
              }`}
              aria-label={isLiked ? 'Remove from liked events' : 'Add to liked events'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-700'}`} />
            </button>
            <div className="w-8 h-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 ml-1">{event.views || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.venue_name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Ticket className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {isExpired ? 'Event expired' : `${event.tickets_available} tickets left`}
            </span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${parseFloat(event.price).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per ticket</p>
          </div>

          <div className="flex space-x-2">
            {isUnavailable ? (
              <span className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                Unavailable
              </span>
            ) : (
              <>
                {onBook && !bookingDisabled && (
                  <button
                    onClick={() => onBook(event.id)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Book Now
                  </button>
                )}
                <Link
                  to={`/events/${event.id}`}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  View
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
