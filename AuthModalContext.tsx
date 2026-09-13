import { createContext, useContext, useState, type ReactNode } from 'react';

type AuthModalView = 'login' | 'register';

interface AuthModalContextValue {
  isOpen: boolean;
  view: AuthModalView;
  openAuth: (view?: AuthModalView) => void;
  closeAuth: () => void;
  switchView: (view: AuthModalView) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>('login');

  const openAuth = (v: AuthModalView = 'login') => {
    setView(v);
    setIsOpen(true);
  };
  const closeAuth = () => setIsOpen(false);
  const switchView = (v: AuthModalView) => setView(v);

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openAuth, closeAuth, switchView }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
