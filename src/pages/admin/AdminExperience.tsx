import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminModal } from '@/components/admin/AdminModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Edit2 } from 'lucide-react';

type ExperienceRow = {
  id: string; company: string; position: string; location: string | null;
  start_date: string; end_date: string | null; is_current: boolean;
  description: string | null; company_url: string | null; logo_url: string | null;
  display_order: number; published: boolean;
};

type ExperienceForm = Omit<ExperienceRow, 'id'>;

const emptyExp: ExperienceForm = {
  company: '', position: '', location: '', start_date: '', end_date: null,
  is_current: false, description: '', company_url: '', logo_url: '',
  display_order: 0, published: true,
};

export function AdminExperience() {
  const [items, setItems] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExperienceRow | null>(null);
  const [formData, setFormData] = useState<ExperienceForm>(emptyExp);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('experience').select('*')
      .order('display_order').order('start_date', { ascending: false });
    if (error) { alert(error.message); setItems([]); }
    else setItems((data || []) as ExperienceRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyExp });
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceRow) => {
    setEditing(item);
    const { id, ...rest } = item;
    void id;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.position.trim() || !formData.company.trim()) {
      alert('Position and Company are required.');
      return;
    }

    setSaving(true);
    const data = {
      company: formData.company.trim(),
      position: formData.position.trim(),
      location: formData.location?.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.is_current ? null : formData.end_date || null,
      is_current: formData.is_current,
      description: formData.description?.trim() || null,
      company_url: formData.company_url?.trim() || null,
      logo_url: formData.logo_url?.trim() || null,
      display_order: formData.display_order,
      published: formData.published,
    };

    const result = editing
      ? await supabase.from('experience').update(data).eq('id', editing.id)
      : await supabase.from('experience').insert(data);

    if (result.error) {
      alert(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    await load();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const { error } = await supabase.from('experience').delete().eq('id', editing.id);
    if (error) { alert(error.message); return; }
    setModalOpen(false);
    await load();
  };

  return (
    <>
      <AdminPageHeader title="Experience" description="Manage work experience entries"
        loading={loading} onAdd={openAdd} addLabel="Add Experience">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No experience entries yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="cursor-pointer" onClick={() => openEdit(item)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.position}</h3>
                      {item.is_current && <Badge variant="success">Current</Badge>}
                    </div>
                    <p className="text-sm text-primary-500 mb-1">{item.company}</p>
                    {item.location && <p className="text-xs text-gray-400 mb-1">{item.location}</p>}
                    <p className="text-xs text-gray-400">
                      {item.start_date || '—'} → {item.is_current ? 'Present' : item.end_date || '—'}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-primary-500 flex items-center gap-1">
                    <Edit2 size={14} /> Edit
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AdminPageHeader>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Experience' : 'Add Experience'}
        onSave={handleSave} onDelete={editing ? handleDelete : undefined} saving={saving}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Position" value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Software Engineer" />
            <Input label="Company" value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company name" />
          </div>
          <Input label="Location" value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Jorhat, Assam / Remote" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.start_date || ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              disabled={formData.is_current} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? null : formData.end_date })}
              className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">I currently work here</span>
          </label>
          <Textarea label="Description" value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What did you do?" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company URL" value={formData.company_url || ''}
              onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
              placeholder="https://company.com" />
            <Input label="Logo URL" value={formData.logo_url || ''}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Display Order" type="number" value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })} />
            <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
              <input type="checkbox" checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Published</span>
            </label>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
