import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X, GraduationCap, Users, Home, Shield, User as UserIcon, LogIn } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const { openAuth } = useAuthModal();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'feed', label: 'Bosh sahifa', icon: Home },
    { key: 'teachers', label: "O'qituvchilar", icon: GraduationCap },
    { key: 'members', label: 'A\'zolar', icon: Users },
    ...(profile ? [{ key: 'profile', label: 'Profil', icon: UserIcon }] : []),
    ...(profile?.role === 'admin' ? [{ key: 'admin', label: 'Admin panel', icon: Shield }] : []),
  ];

  const handleNav = (key: string) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  const roleLabels: Record<string, string> = {
    student: 'Talaba',
    teacher: "O'qituvchi",
    admin: 'Administrator',
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('feed')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              ITMA<span className="text-brand-500"> Community</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {profile ? (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white max-w-[120px] truncate">
                    {profile.full_name || 'Foydalanuvchi'}
                  </p>
                  <p className="text-xs text-brand-500">{roleLabels[profile.role]}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-all shadow-lg shadow-brand-500/30"
              >
                <LogIn className="w-4 h-4" />
                Kirish
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              {profile ? (
                <div className="flex items-center justify-between px-3 py-2.5 mt-2 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.full_name || 'Foydalanuvchi'}</p>
                    <p className="text-xs text-brand-500">{roleLabels[profile.role]}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openAuth('login'); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 mt-2 rounded-lg bg-brand-600 text-white text-sm font-medium transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Tizimga kirish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
