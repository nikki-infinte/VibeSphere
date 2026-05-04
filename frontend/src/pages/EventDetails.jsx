import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Ticket,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import { eventsAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvent(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!event || bookingQuantity < 1) return;

    try {
      setIsBooking(true);
      await bookingsAPI.createBooking({
        event_id: parseInt(id),
        quantity: bookingQuantity
      });
      toast.success('Booking confirmed! Check your email for details.');
      
      // Update available tickets
      setEvent(prev => ({
        ...prev,
        tickets_available: prev.tickets_available - bookingQuantity
      }));
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-8 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.event_date);
  const isSoldOut = event.tickets_available === 0;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-br from-primary-600 to-purple-600">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl text-white opacity-50">{'\ud83c\udfad'}</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-8 text-white"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm">
                {event.category}
              </span>
              {isSoldOut && (
                <span className="px-3 py-1 bg-red-500 bg-opacity-80 rounded-full text-sm">
                  Sold Out
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center space-x-6 text-primary-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{event.venue_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{eventDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About this event
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Event Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Date</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Time</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {eventDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Venue</p>
                    <p className="text-gray-600 dark:text-gray-400">{event.venue_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Capacity</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.capacity} total, {event.tickets_available} available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-6">
                {/* Price */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${parseFloat(event.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">per ticket</p>
                </div>

                {/* Quantity Selector */}
                {!isSoldOut && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quantity</p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setBookingQuantity(Math.max(1, bookingQuantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {bookingQuantity}
                      </span>
                      <button
                        onClick={() => setBookingQuantity(Math.min(event.tickets_available, bookingQuantity + 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(parseFloat(event.price) * bookingQuantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Book Button */}
                  {isSoldOut ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  ) : (
                    <button
                      onClick={handleBooking}
                      disabled={isBooking || bookingQuantity > event.tickets_available}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? 'Booking...' : 'Book Now'}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Heart className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
