import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MediaItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AdminModal } from '@/components/admin/AdminModal';
import { Plus, Trash2, Search, Copy, Check } from 'lucide-react';

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ url: '', alt_text: '', category: 'general' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    supabase.from('media').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!formData.url.trim()) return;
    setSaving(true);
    await supabase.from('media').insert(formData);
    setSaving(false);
    setFormData({ url: '', alt_text: '', category: 'general' });
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('media').delete().eq('id', id);
    load();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = items.filter(
    (item) =>
      (filter === 'all' || item.category === filter) &&
      (!search || item.alt_text?.toLowerCase().includes(search.toLowerCase()) || item.url.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage images and media files</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto">
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">No media items found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-3 group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 mb-3">
                <img src={item.url} alt={item.alt_text || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-700 hover:scale-110 transition-transform"
                    aria-label="Copy URL"
                  >
                    {copied === item.url ? <Check size={16} className="text-success-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-error-500 hover:scale-110 transition-transform"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{item.alt_text || 'No alt text'}</p>
              <span className="text-xs text-primary-500">{item.category}</span>
            </Card>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Media" onSave={handleAdd} saving={saving}>
        <div className="space-y-4">
          <Input label="Image URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." required />
          <Input label="Alt Text" value={formData.alt_text} onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })} placeholder="Description of the image" hint="Important for accessibility" />
          <Select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {['general', 'profile', 'project', 'blog', 'gallery'].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          {formData.url && (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
              <img src={formData.url} alt="Preview" className="w-full max-h-48 object-contain bg-gray-50 dark:bg-slate-700" />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
