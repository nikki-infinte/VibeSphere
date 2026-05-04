import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import EventCard from '../components/EventCard';

function isExpired(eventDate) {
  return new Date(eventDate).getTime() < Date.now();
}

export default function LikedEvents() {
  const { favorites } = useFavorites();

  const activeEvents = favorites.filter((event) => !isExpired(event.event_date));
  const expiredEvents = favorites.filter((event) => isExpired(event.event_date));

  const handleQuickBook = async (eventId) => {
    try {
      await bookingsAPI.createBooking({
        event_id: Number(eventId),
        quantity: 1,
      });
      toast.success('Booking created from liked events');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Liked Events</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Events you liked with live booking status.
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="text-5xl mb-4">💜</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked events yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tap the heart icon on any event card to add it here.
            </p>
          </motion.div>
        ) : (
          <>
            {activeEvents.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Active Events
                  </h2>
                  <span className="text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                    Bookable
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {activeEvents.map((event) => (
                    <EventCard key={event.id} event={event} onBook={handleQuickBook} />
                  ))}
                </div>
              </section>
            )}

            {expiredEvents.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Expired Events
                  </h2>
                  <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700/70 px-3 py-1 rounded-full">
                    Unavailable
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {expiredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
