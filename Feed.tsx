import { useEffect, useState } from 'react';
import { supabase, type Post } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { Plus, Send, Trash2, MessageCircle, Calendar, AlertCircle, Lock } from 'lucide-react';

export default function Feed() {
  const { profile } = useAuth();
  const { openAuth } = useAuthModal();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  const isGuest = !profile;

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPosts((data ?? []) as Post[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      openAuth('login');
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('posts').insert({
      author_id: profile.id,
      title: newTitle,
      content: newContent,
    });
    setCreating(false);
    if (error) {
      setError(error.message);
    } else {
      setNewTitle('');
      setNewContent('');
      setShowCreate(false);
      fetchPosts();
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) fetchPosts();
  };

  const handleNewPostClick = () => {
    if (!profile) {
      openAuth('login');
    } else {
      setShowCreate(!showCreate);
    }
  };

  const canDelete = (post: Post) => profile?.id === post.author_id || profile?.role === 'admin';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hamjamiyat lentasi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">So'nggi yangiliklar va e'lonlar</p>
        </div>
        <button
          onClick={handleNewPostClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all shadow-lg shadow-brand-500/30 text-sm"
        >
          {isGuest ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Yangi post
        </button>
      </div>

      {/* Guest notice */}
      {isGuest && (
        <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-sm text-brand-700 dark:text-brand-300 flex items-center gap-3 animate-fade-in">
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            Postlarni o'qish bepul. Post joylash uchun tizimga kiring.
            <button onClick={() => openAuth('login')} className="ml-2 font-medium underline hover:text-brand-800 dark:hover:text-brand-200">
              Kirish
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && profile && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-slide-up shadow-sm">
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              placeholder="Sarlavha"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              rows={4}
              placeholder="Matn..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {creating ? 'Yuborilmoqda...' : 'Post joylash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1.5" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Hozircha postlar yo'q.</p>
          {profile && <p className="text-gray-500 dark:text-gray-400 mt-1">Birinchi postni joylang!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Author */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-medium text-sm">
                    {(post.author?.full_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {post.author?.full_name || 'Noma\'lum'}
                    </p>
                    <div className="flex items-center gap-2">
                      {post.author && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[post.author.role]}`}>
                          {roleLabels[post.author.role]}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {canDelete(post) && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              {post.title && (
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
              )}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
