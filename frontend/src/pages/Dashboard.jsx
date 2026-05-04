import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { discoverAPI } from '../services/api';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';

export default function Dashboard() {
  const [trending, setTrending] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ lat: 28.6139, lon: 77.209 });
  const isAvailableEvent = (event) =>
    new Date(event.event_date).getTime() >= Date.now() && event.tickets_available > 0;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [trendingRes, nearbyRes] = await Promise.all([
          discoverAPI.getTrendingEvents(6),
          discoverAPI.getNearbyEvents(position.lat, position.lon, 30)
        ]);
        
        setTrending(trendingRes.data.filter(isAvailableEvent));
        setNearby(nearbyRes.data);

        // Try to get user location
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setPosition(newPos);
            
            // Reload nearby events with actual position
            discoverAPI.getNearbyEvents(newPos.lat, newPos.lon, 30)
              .then(res => setNearby(res.data))
              .catch(console.error);
          },
          (err) => console.log('Location access denied:', err)
        );

        // Load recommendations if user is logged in
        try {
          const recommendedRes = await discoverAPI.getRecommendedEvents();
          setRecommended(recommendedRes.data.filter(isAvailableEvent));
        } catch (err) {
          // User might not be authenticated or no recommendations available
          console.log('No recommendations available');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to VibeSphere</h1>
          <p className="text-primary-100 text-base sm:text-lg">
            Discover amazing events happening around you
          </p>
        </motion.div>

        {/* Trending Events */}
        {trending.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔥 Trending Events
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {trending.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="h-full"
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Nearby Events */}
        {nearby.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📍 Events Near You
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {nearby.slice(0, 6).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="h-full"
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommended Events */}
        {recommended.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ✨ Recommended For You
              </h2>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {recommended.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="h-full"
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {!loading && trending.length === 0 && nearby.length === 0 && recommended.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for exciting events happening around you!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
