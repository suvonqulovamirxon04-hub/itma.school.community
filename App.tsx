import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Feed from '@/pages/Feed';
import Teachers from '@/pages/Teachers';
import Members from '@/pages/Members';
import ProfilePage from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import { GraduationCap } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [page, setPage] = useState('feed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 animate-pulse">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Redirect to feed if trying to access a protected page without auth
  const protectedPages = ['profile', 'admin'];
  const effectivePage = (!user && protectedPages.includes(page)) ? 'feed' : page;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar currentPage={effectivePage} onNavigate={setPage} />
      <main className="animate-fade-in">
        {effectivePage === 'feed' && <Feed />}
        {effectivePage === 'teachers' && <Teachers />}
        {effectivePage === 'members' && <Members />}
        {effectivePage === 'profile' && user && <ProfilePage />}
        {effectivePage === 'admin' && profile?.role === 'admin' && <AdminDashboard />}
      </main>
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <AppContent />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
