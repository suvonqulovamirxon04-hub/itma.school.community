import { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { GraduationCap, BookOpen, AlertCircle, MessageCircle } from 'lucide-react';

export default function Teachers() {
  const { profile } = useAuth();
  const { openAuth } = useAuthModal();
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGuest = !profile;

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setTeachers(data ?? []);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">O'qituvchilar</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Hamjamiyatdagi o'qituvchilar ro'yxati</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Hozircha o'qituvchilar yo'q</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher, idx) => (
              <div
                key={teacher.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(teacher.full_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {teacher.full_name || 'Noma\'lum'}
                    </h3>
                    {teacher.subject ? (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {teacher.subject}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-0.5">Fan ko'rsatilmagan</p>
                    )}
                    {teacher.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {teacher.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isGuest && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 text-sm">
                <MessageCircle className="w-4 h-4" />
                Hamjamiyatga qo'shiling va o'qituvchilar bilan muloqot qiling
                <button onClick={() => openAuth('register')} className="font-medium underline hover:text-brand-800 dark:hover:text-brand-200 ml-1">
                  Ro'yxatdan o'tish
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
