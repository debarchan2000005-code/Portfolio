import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminModal } from '@/components/admin/AdminModal';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Edit2, Trash2, Star } from 'lucide-react';

type DBSkill = {
  id: string;
  name: string;
  category: string;
  icon_url: string | null;
  level: number;
  display_order: number;
  published: boolean;
  description?: string;
  years_experience?: number;
  proficiency_label?: string;
  is_featured?: boolean;
  related_skills?: string[];
  created_at?: string;
  updated_at?: string;
};

type SkillForm = {
  name: string;
  category: string;
  level: number;
  display_order: number;
  icon_url: string;
  description: string;
  years_experience: number;
  proficiency_label: string;
  is_featured: boolean;
};

const emptySkill: SkillForm = {
  name: '',
  category: 'General',
  level: 80,
  display_order: 0,
  icon_url: '',
  description: '',
  years_experience: 0,
  proficiency_label: 'Intermediate',
  is_featured: false,
};

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SKILL_ICONS = [
  '⚛️', '🐍', '📘', '☕', '🔧', '💾', '🌐', '📦',
  '⚙️', '🚀', '📱', '🎨', '📊', '🔐', '☁️', '⚡',
  '🛠️', '🎯', '📈', '💻'
];

export function AdminSkills() {
  const [skills, setSkills] = useState<DBSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DBSkill | null>(null);
  const [formData, setFormData] = useState<SkillForm>(emptySkill);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order')
      .order('name');

    if (error) {
      alert(error.message);
      setSkills([]);
    } else {
      setSkills((data || []) as DBSkill[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptySkill });
    setModalOpen(true);
  };

  const openEdit = (skill: DBSkill) => {
    setEditing(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level ?? 0,
      display_order: skill.display_order ?? 0,
      icon_url: skill.icon_url ?? '',
      description: skill.description ?? '',
      years_experience: skill.years_experience ?? 0,
      proficiency_label: skill.proficiency_label ?? 'Intermediate',
      is_featured: skill.is_featured ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a skill name.');
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        const { error } = await supabase
          .from('skills')
          .update({
            name: formData.name.trim(),
            category: formData.category,
            level: formData.level,
            display_order: formData.display_order,
            icon_url: formData.icon_url || null,
            description: formData.description.trim() || null,
            years_experience: formData.years_experience || 0,
            proficiency_label: formData.proficiency_label,
            is_featured: formData.is_featured,
          })
          .eq('id', editing.id);

        if (error) {
          alert(error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('skills')
          .insert({
            name: formData.name.trim(),
            category: formData.category,
            level: formData.level,
            display_order: formData.display_order,
            icon_url: formData.icon_url || null,
            description: formData.description.trim() || null,
            years_experience: formData.years_experience || 0,
            proficiency_label: formData.proficiency_label,
            is_featured: formData.is_featured,
            published: true,
          });

        if (error) {
          alert(error.message);
          return;
        }
      }

      setModalOpen(false);
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;

    if (!confirm(`Delete "${editing.name}"?`)) return;

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', editing.id);

    if (error) {
      alert(error.message);
      return;
    }

    setModalOpen(false);
    await load();
  };

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProficiencyColor = (label: string) => {
    switch(label) {
      case 'Beginner': return 'text-yellow-500';
      case 'Intermediate': return 'text-blue-500';
      case 'Advanced': return 'text-purple-500';
      case 'Expert': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Languages': 'bg-emerald-500/20 text-emerald-300',
      'Frontend': 'bg-blue-500/20 text-blue-300',
      'Backend': 'bg-purple-500/20 text-purple-300',
      'Database': 'bg-orange-500/20 text-orange-300',
      'Tools': 'bg-cyan-500/20 text-cyan-300',
      'General': 'bg-gray-500/20 text-gray-300',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <>
      <AdminPageHeader
        title="Skills"
        description="Manage your technical skills and expertise"
        loading={loading}
        onAdd={openAdd}
        addLabel="Add Skill"
      >
        {categories.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No skills yet. Click "Add Skill" to create one.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="space-y-8">
              {categories.map((category) => {
                const categorySkills = filteredSkills.filter((s) => s.category === category);
                if (categorySkills.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                        {category}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                        {categorySkills.length}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <Card
                          key={skill.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openEdit(skill)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {skill.icon_url && (
                                <span className="text-2xl">{skill.icon_url}</span>
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {skill.name}
                                </h4>
                                {(skill.years_experience ?? 0) > 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {skill.years_experience ?? 0}y experience
                                  </p>
                                )}
                              </div>
                            </div>
                            {skill.is_featured && (
                              <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            )}
                          </div>

                          {skill.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {skill.description}
                            </p>
                          )}

                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`font-medium ${getProficiencyColor(skill.proficiency_label ?? 'Intermediate')}`}>
                                {skill.proficiency_label}
                              </span>
                              <span className="text-gray-400">{skill.level}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                            <span className="text-xs text-gray-400">Order: {skill.display_order}</span>
                            <span className="text-xs text-primary-500 flex items-center gap-1">
                              <Edit2 size={12} /> Edit
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </AdminPageHeader>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Skill' : 'Add Skill'}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        saving={saving}
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300">Basic Info</h4>
            
            <Input
              label="Skill Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. React"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {[
                  'Languages',
                  'Frontend',
                  'Backend',
                  'Database',
                  'Tools',
                  'General',
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}

                {categories
                  .filter(
                    (c) =>
                      ![
                        'Languages',
                        'Frontend',
                        'Backend',
                        'Database',
                        'Tools',
                        'General',
                      ].includes(c)
                  )
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </Select>

              <Input
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Proficiency & Experience */}
          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300">Proficiency</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Level"
                value={formData.proficiency_label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proficiency_label: e.target.value,
                  })
                }
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>

              <Input
                label="Years of Experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    years_experience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Skill Level: {formData.level}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: parseInt(e.target.value),
                  })
                }
                className="w-full accent-primary-500"
              />
            </div>
          </div>

          {/* Description & Icon */}
          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300">Details</h4>
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of your skill..."
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SKILL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setFormData({ ...formData, icon_url: icon })}
                    className={`p-3 text-xl rounded transition-all ${
                      formData.icon_url === icon
                        ? 'bg-primary-500 ring-2 ring-primary-300'
                        : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFormData({ ...formData, icon_url: '' })}
                className="text-xs text-gray-500 mt-2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear icon
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300">Features</h4>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">
                ⭐ Featured Skill (highlight on portfolio)
              </span>
            </label>
          </div>
        </div>
      </AdminModal>
    </>
  );
}