import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/layout/Navbar';

// Screens
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import MyTripsScreen from './screens/MyTripsScreen';
import ItineraryBuilderScreen from './screens/ItineraryBuilderScreen';
import ItineraryViewScreen from './screens/ItineraryViewScreen';
import CitySearchScreen from './screens/CitySearchScreen';
import ActivitySearchScreen from './screens/ActivitySearchScreen';
import TripBudgetScreen from './screens/TripBudgetScreen';
import TripTimelineScreen from './screens/TripTimelineScreen';
import SharedItineraryScreen from './screens/SharedItineraryScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import CreateTripModal from './screens/CreateTripModal';

function AppContent() {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedShareCode, setSelectedShareCode] = useState(null);

  // New Trip Modal State
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [initialCityForNewTrip, setInitialCityForNewTrip] = useState(null);

  // Check URL Hash for shared itineraries e.g. #share-euro-tour-2026
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share-')) {
        const code = hash.replace('#share-', '');
        setSelectedShareCode(code);
        setActiveTab('shared-view');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (tab, payload = null) => {
    if (tab === 'shared-view' && payload) {
      setSelectedShareCode(payload);
      window.location.hash = `#share-${payload}`;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrip = (tripId, viewType = 'builder') => {
    setSelectedTripId(tripId);
    if (viewType === 'builder') setActiveTab('trip-builder');
    else if (viewType === 'view') setActiveTab('trip-view');
    else if (viewType === 'budget') setActiveTab('trip-budget');
    else if (viewType === 'timeline') setActiveTab('trip-timeline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewTrip = (initialCity = null) => {
    if (!user) {
      setActiveTab('auth');
      return;
    }
    setInitialCityForNewTrip(initialCity);
    setIsNewTripOpen(true);
  };

  const handleTripCreated = (createdTrip) => {
    setSelectedTripId(createdTrip.id);
    setActiveTab('trip-builder');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-spin">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <p className="text-sm font-bold text-slate-600">Loading GlobeTrotter...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenNewTrip={() => handleOpenNewTrip(null)}
      />

      {/* Main Screen Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Auth Screen */}
        {activeTab === 'auth' && (
          <AuthScreen onSuccess={() => handleNavigate('dashboard')} />
        )}

        {/* 1. Dashboard / Home Screen */}
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigate={handleNavigate}
            onSelectTrip={handleSelectTrip}
            onOpenNewTrip={() => handleOpenNewTrip(null)}
            onQuickAddCity={(city) => handleOpenNewTrip(city)}
          />
        )}

        {/* 2. My Trips Screen */}
        {activeTab === 'my-trips' && (
          <MyTripsScreen
            onSelectTrip={handleSelectTrip}
            onOpenNewTrip={() => handleOpenNewTrip(null)}
            onNavigate={handleNavigate}
          />
        )}

        {/* 3. Itinerary Builder Screen */}
        {activeTab === 'trip-builder' && selectedTripId && (
          <ItineraryBuilderScreen
            tripId={selectedTripId}
            onNavigate={handleNavigate}
            onSelectTrip={handleSelectTrip}
          />
        )}

        {/* 4. Structured Itinerary View Screen */}
        {activeTab === 'trip-view' && selectedTripId && (
          <ItineraryViewScreen
            tripId={selectedTripId}
            onNavigate={handleNavigate}
            onSelectTrip={handleSelectTrip}
          />
        )}

        {/* 5. Trip Budget & Cost Breakdown Screen */}
        {activeTab === 'trip-budget' && selectedTripId && (
          <TripBudgetScreen
            tripId={selectedTripId}
            onNavigate={handleNavigate}
            onSelectTrip={handleSelectTrip}
          />
        )}

        {/* 6. Trip Calendar / Timeline Screen */}
        {activeTab === 'trip-timeline' && selectedTripId && (
          <TripTimelineScreen
            tripId={selectedTripId}
            onSelectTrip={handleSelectTrip}
          />
        )}

        {/* 7. City Search & Exploration Screen */}
        {activeTab === 'explore-cities' && (
          <CitySearchScreen
            onQuickAddCity={(city) => handleOpenNewTrip(city)}
            onOpenNewTripWithCity={(city) => handleOpenNewTrip(city)}
          />
        )}

        {/* 8. Activity Catalog Screen */}
        {activeTab === 'activity-catalog' && (
          <ActivitySearchScreen onSelectTrip={handleSelectTrip} />
        )}

        {/* 9. Public Community Itineraries Feed */}
        {activeTab === 'community' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Community Shared Itineraries</h1>
              <p className="text-xs text-slate-500">
                Explore plans created by the global GlobeTrotter traveler community and clone them directly to your account.
              </p>
            </div>
            <DashboardScreen
              onNavigate={handleNavigate}
              onSelectTrip={handleSelectTrip}
              onOpenNewTrip={() => handleOpenNewTrip(null)}
              onQuickAddCity={(city) => handleOpenNewTrip(city)}
            />
          </div>
        )}

        {/* 10. Shared Public Itinerary View Screen */}
        {activeTab === 'shared-view' && selectedShareCode && (
          <SharedItineraryScreen
            shareCode={selectedShareCode}
            onSelectTrip={handleSelectTrip}
            onNavigate={handleNavigate}
          />
        )}

        {/* 11. User Profile & Settings Screen */}
        {(activeTab === 'profile' || activeTab === 'wishlist') && (
          <UserProfileScreen
            onOpenNewTripWithCity={(city) => handleOpenNewTrip(city)}
            onNavigate={handleNavigate}
          />
        )}

        {/* 12. Admin Analytics Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboardScreen
            onSelectTrip={handleSelectTrip}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 GlobeTrotter. Built for the Odoo Hackathon by Vatsal Pithadia.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('dashboard')} className="hover:text-slate-900">
              Dashboard
            </button>
            <button onClick={() => handleNavigate('explore-cities')} className="hover:text-slate-900">
              Destinations
            </button>
            <button onClick={() => handleNavigate('activity-catalog')} className="hover:text-slate-900">
              Experiences
            </button>
            <button onClick={() => handleNavigate('admin')} className="text-amber-700 hover:text-amber-800 font-semibold">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Global Plan New Trip Modal */}
      <CreateTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        onTripCreated={handleTripCreated}
        initialCity={initialCityForNewTrip}
      />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}
