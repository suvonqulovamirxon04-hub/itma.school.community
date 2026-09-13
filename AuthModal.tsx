import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { validateAccessCode, type Role } from '@/lib/supabase';
import { GraduationCap, Mail, Lock, User, Key, ArrowRight, AlertCircle, CheckCircle2, X, BookOpen, FileText, Hash } from 'lucide-react';

export default function AuthModal() {
  const { isOpen, view, closeAuth, switchView } = useAuthModal();
  const { signIn, signUp } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSubject, setRegSubject] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const detectedRole: Role | null = validateAccessCode(regCode);

  const roleLabels: Record<Role, string> = {
    student: 'Talaba',
    teacher: "O'qituvchi",
    admin: 'Administrator',
  };

  const roleColors: Record<Role, string> = {
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  useEffect(() => {
    if (!isOpen) {
      setLoginError(null);
      setRegError(null);
      setRegSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) {
      setLoginError(error);
    } else {
      closeAuth();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!detectedRole) {
      setRegError("Noto'g'ri kirish kodi. Iltimos, to'g'ri kodni kiriting.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (regBio.trim().length < 10) {
      setRegError("Batafsil maydoni kamida 10 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (detectedRole === 'teacher' && !regSubject.trim()) {
      setRegError("O'qituvchilar uchun fan maydoni to'ldirilishi shart.");
      return;
    }
    setRegLoading(true);
    const { error } = await signUp(regEmail, regPassword, regName, detectedRole, regBio.trim(), regSubject.trim(), regGrade.trim());
    setRegLoading(false);
    if (error) {
      setRegError(error);
    } else {
      setRegSuccess(true);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
      onClick={closeAuth}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">ITMA Community</h2>
              <p className="text-xs text-gray-400">
                {view === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuth}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 pt-4">
          {view === 'login' ? (
            <>
              {loginError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Parol</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? 'Kirilmoqda...' : 'Kirish'}
                  {!loginLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Hisobingiz yo'qmi?{' '}
                <button onClick={() => switchView('register')} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Ro'yxatdan o'tish
                </button>
              </p>
            </>
          ) : regSuccess ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tabriklaymiz!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                Hisobingiz muvaffaqiyatli yaratildi.
              </p>
              <button
                onClick={() => switchView('login')}
                className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all"
              >
                Tizimga kirish
              </button>
            </div>
          ) : (
            <>
              {regError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {regError}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ism familiya</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Ism Familiya"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Parol</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Secret access code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kirish kodi</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Maxfiy kirish kodini kiriting"
                    />
                  </div>
                  {detectedRole && (
                    <div className="mt-2 flex items-center gap-2 animate-fade-in">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${roleColors[detectedRole]}`}>
                        {roleLabels[detectedRole]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Conditional fields based on detected role */}
                {detectedRole === 'student' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sinf / Kurs</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={regGrade}
                          onChange={(e) => setRegGrade(e.target.value)}
                          className={inputClass}
                          placeholder="Masalan: 9-sinf, 11-sinf"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {detectedRole === 'teacher' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Fan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={regSubject}
                          onChange={(e) => setRegSubject(e.target.value)}
                          required
                          className={inputClass}
                          placeholder="Masalan: Matematika"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bio — always shown, min 10 chars */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Batafsil <span className="text-gray-400 text-xs">(kamida 10 ta belgi)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      rows={3}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                      placeholder="O'zingiz haqida qisqacha ma'lumot..."
                    />
                  </div>
                  {regBio.trim().length > 0 && regBio.trim().length < 10 && (
                    <p className="mt-1 text-xs text-amber-500">
                      Yana {10 - regBio.trim().length} ta belgi kiriting
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={regLoading || !detectedRole}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regLoading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
                  {!regLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Hisobingiz bormi?{' '}
                <button onClick={() => switchView('login')} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Tizimga kirish
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
