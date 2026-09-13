import { useEffect, useState } from 'react';
import { supabase, type Profile, type Role } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Users, AlertCircle, Search, MessageCircle } from 'lucide-react';

export default function Members() {
  const { profile } = useAuth();
  const { openAuth } = useAuthModal();
  const [members, setMembers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const isGuest = !profile;

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setMembers(data ?? []);
        setFiltered(data ?? []);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    let result = members;
    if (roleFilter !== 'all') {
      result = result.filter((m) => m.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [members, search, roleFilter]);

  const roleLabels: Record<string, string> = {
    student: 'Talaba',
    teacher: "O'qituvchi",
    admin: 'Administrator',
  };

  const roleColors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">A'zolar</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Hamjamiyat a'zolari ro'yxati</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'student', 'teacher', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                roleFilter === r
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {r === 'all' ? 'Hammasi' : roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">A'zolar topilmadi</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((member, idx) => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {(member.full_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {member.full_name || 'Noma\'lum'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[member.role]}`}>
                        {roleLabels[member.role]}
                      </span>
                    </div>
                    {member.subject && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{member.subject}</p>
                    )}
                    {member.bio && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{member.bio}</p>
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
                Hamjamiyatga qo'shiling
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
