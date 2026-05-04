import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthPanel from './components/AuthPanel';
import ChatbotWidget from './components/ChatbotWidget';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Bookings from './pages/Bookings';
import CreateEvent from './pages/CreateEvent';
import LikedEvents from './pages/LikedEvents';

function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="lg:pl-72">
        <Navbar 
          user={user} 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
        />
        
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
}

function AuthenticatedApp({ user, logout }) {
  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/liked-events" element={<LikedEvents />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function UnauthenticatedApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            VibeSphere
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing events happening around you
          </p>
        </div>
        <AuthPanel />
      </div>
    </div>
  );
}

export default function App() {
  const { user, token, logout } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          {token && user ? (
            <FavoritesProvider userId={user?.id}>
              <AuthenticatedApp user={user} logout={logout} />
            </FavoritesProvider>
          ) : (
            <UnauthenticatedApp />
          )}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}
