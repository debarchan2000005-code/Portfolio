import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminModal } from '@/components/admin/AdminModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Star, Edit2 } from 'lucide-react';

type ProjectRow = {
  id: string;
  title: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  technologies: string[];
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  status: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  project_url: string | null;
};

type ProjectForm = {
  title: string;
  description: string;
  technologies: string[];
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  display_order: number;
};

const emptyProject: ProjectForm = {
  title: '',
  description: '',
  technologies: [],
  image_url: null,
  live_url: null,
  github_url: null,
  featured: false,
  display_order: 0,
};

const makeSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export function AdminProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [formData, setFormData] = useState<ProjectForm>(emptyProject);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await (supabase.from('projects') as any)
      .select('*')
      .order('display_order');

    if (error) {
      console.error('PROJECT LOAD ERROR:', error);
      alert(error.message);
    }

    setProjects((data || []) as ProjectRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyProject, technologies: [] });
    setTechInput('');
    setModalOpen(true);
  };

  const openEdit = (project: ProjectRow) => {
    setEditing(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      image_url: project.image_url || null,
      live_url: project.live_url || null,
      github_url: project.github_url || null,
      featured: Boolean(project.featured),
      display_order: project.display_order ?? 0,
    });
    setTechInput('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and Description are required.');
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      slug: makeSlug(formData.title),
      description: formData.description.trim(),
      technologies: formData.technologies,
      image_url: formData.image_url,
      live_url: formData.live_url,
      github_url: formData.github_url,
      featured: formData.featured,
      display_order: formData.display_order,
      status: 'published',
      published: true,
    };

    const result = editing
      ? await (supabase.from('projects') as any)
          .update(payload)
          .eq('id', editing.id)
      : await (supabase.from('projects') as any)
          .insert(payload);

    if (result.error) {
      console.error('PROJECT SAVE ERROR:', result.error);
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

    const { error } = await (supabase.from('projects') as any)
      .delete()
      .eq('id', editing.id);

    if (error) {
      console.error('PROJECT DELETE ERROR:', error);
      alert(error.message);
      return;
    }

    setModalOpen(false);
    await load();
  };

  const addTech = () => {
    const tech = techInput.trim();

    if (tech && !formData.technologies.includes(tech)) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, tech],
      });
    }

    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((item) => item !== tech),
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="Manage your portfolio projects"
        loading={loading}
        onAdd={openAdd}
        addLabel="Add Project"
      >
        {projects.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No projects yet. Click "Add Project" to create one.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer"
                onClick={() => openEdit(project)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{project.title}</h3>

                  {project.featured && (
                    <Badge variant="warning">
                      <Star size={12} /> Featured
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(project.technologies || []).slice(0, 4).map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/50">
                  <span className="text-xs text-gray-400">
                    Order: {project.display_order}
                  </span>

                  <span className="flex items-center gap-1 text-primary-500 text-sm font-medium">
                    <Edit2 size={14} /> Edit
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AdminPageHeader>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Project' : 'Add Project'}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        saving={saving}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="My Awesome Project"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="What does this project do?"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Tech Stack
            </label>

            <div className="flex gap-2 mb-2">
              <input
                className="input-field"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Type a tech and press Enter"
              />

              <button
                type="button"
                onClick={addTech}
                className="btn-secondary shrink-0"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(formData.technologies || []).map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => removeTech(tech)}
                  className="badge hover:bg-error-50 dark:hover:bg-error-900/30 hover:text-error-600 cursor-pointer"
                >
                  {tech} ×
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Image URL"
            value={formData.image_url || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                image_url: e.target.value || null,
              })
            }
            placeholder="https://..."
            hint="Optional preview image"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Demo URL"
              value={formData.live_url || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  live_url: e.target.value || null,
                })
              }
              placeholder="https://..."
            />

            <Input
              label="Repo URL"
              value={formData.github_url || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  github_url: e.target.value || null,
                })
              }
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value, 10) || 0,
                })
              }
            />

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Featured
                </span>
              </label>
            </div>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
