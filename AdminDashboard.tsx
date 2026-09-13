import { useEffect, useState } from 'react';
import { supabase, type Profile, type Post } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, FileText, AlertCircle, Trash2, UserCheck, UserX, GraduationCap, TrendingUp } from 'lucide-react';

type Tab = 'overview' | 'members' | 'posts';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, students: 0, teachers: 0, admins: 0, posts: 0, active: 0 });

  const fetchData = async () => {
    setLoading(true);
    const [membersRes, postsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('*, author:profiles(*)').order('created_at', { ascending: false }),
    ]);

    if (membersRes.error || postsRes.error) {
      setError(membersRes.error?.message || postsRes.error?.message || 'Xatolik yuz berdi');
    } else {
      const m = membersRes.data ?? [];
      const p = postsRes.data ?? [];
      setMembers(m);
      setPosts(p as Post[]);
      setStats({
        total: m.length,
        students: m.filter((x) => x.role === 'student').length,
        teachers: m.filter((x) => x.role === 'teacher').length,
        admins: m.filter((x) => x.role === 'admin').length,
        posts: p.length,
        active: m.filter((x) => x.is_active).length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleActive = async (member: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !member.is_active })
      .eq('id', member.id);
    if (!error) fetchData();
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) fetchData();
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Bu sahifaga kirish uchun admin ruxsati kerak</p>
      </div>
    );
  }

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin panel</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Hamjamiyatni boshqarish</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {([
          { key: 'overview', label: 'Umumiy', icon: TrendingUp },
          { key: 'members', label: 'A\'zolar', icon: Users },
          { key: 'posts', label: 'Postlar', icon: FileText },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Yuklanmoqda...</div>
      ) : tab === 'overview' ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Jami a'zolar" value={stats.total} color="brand" />
          <StatCard icon={GraduationCap} label="O'qituvchilar" value={stats.teachers} color="emerald" />
          <StatCard icon={Users} label="Talabalar" value={stats.students} color="blue" />
          <StatCard icon={FileText} label="Postlar" value={stats.posts} color="purple" />
          <StatCard icon={UserCheck} label="Faol a'zolar" value={stats.active} color="green" />
          <StatCard icon={Shield} label="Adminlar" value={stats.admins} color="amber" />
        </div>
      ) : tab === 'members' ? (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-medium flex-shrink-0">
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
                  {!member.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Faol emas
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5 truncate">
                  {member.bio || 'Batafsil yo\'q'}
                </p>
              </div>
              {member.id !== profile?.id && (
                <button
                  onClick={() => toggleActive(member)}
                  className={`p-2 rounded-lg transition-colors ${
                    member.is_active
                      ? 'text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20'
                  }`}
                  title={member.is_active ? 'Faollikni o\'chirish' : 'Faollashtirish'}
                >
                  {member.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Postlar yo'q</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.author?.full_name || 'Noma\'lum'}
                      </span>
                      {post.author && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[post.author.role]}`}>
                          {roleLabels[post.author.role]}
                        </span>
                      )}
                    </div>
                    {post.title && <h4 className="font-medium text-gray-900 dark:text-white text-sm">{post.title}</h4>}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
