import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Save, CheckCircle } from 'lucide-react';

type HomeData = {
  id?: string;
  badge_text: string;
  greeting: string;
  name: string;
  title: string;
  description: string;
  profile_image_url: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  projects_heading: string;
  projects_subtitle: string;
  projects_view_all_text: string;
  project_card_button_text: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_button_url: string;
  published: boolean;
};

const defaults: HomeData = {
  badge_text: 'Available for opportunities',
  greeting: "Hello, I'm",
  name: 'Debarchan Upadhyaya',
  title: 'Web Developer',
  description: '',
  profile_image_url: '',
  primary_button_text: 'View Projects',
  primary_button_url: '/projects',
  secondary_button_text: 'Contact Me',
  secondary_button_url: '/contact',
  projects_heading: 'Featured Projects',
  projects_subtitle: "A few things I've built recently",
  projects_view_all_text: 'View all',
  project_card_button_text: 'View more',
  cta_title: "Let's work together",
  cta_description:
    "I'm currently open to internship and full-time opportunities. Let's build something great.",
  cta_button_text: 'Get in touch',
  cta_button_url: '/contact',
  published: true,
};

export function AdminHome() {
  const [data, setData] = useState<HomeData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof HomeData, value: string | boolean) =>
    setData((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    async function load() {
      const { data: row, error } = await supabase
        .from('hero_section')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('HOME ADMIN LOAD ERROR:', error);
      } else if (row) {
        setData({ ...defaults, ...row });
      }

      setLoading(false);
    }

    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      badge_text: data.badge_text,
      greeting: data.greeting,
      name: data.name,
      title: data.title,
      description: data.description,
      profile_image_url: data.profile_image_url || null,
      primary_button_text: data.primary_button_text,
      primary_button_url: data.primary_button_url,
      secondary_button_text: data.secondary_button_text,
      secondary_button_url: data.secondary_button_url,
      projects_heading: data.projects_heading,
      projects_subtitle: data.projects_subtitle,
      projects_view_all_text: data.projects_view_all_text,
      project_card_button_text: data.project_card_button_text,
      cta_title: data.cta_title,
      cta_description: data.cta_description,
      cta_button_text: data.cta_button_text,
      cta_button_url: data.cta_button_url,
      published: data.published,
      updated_at: new Date().toISOString(),
    };

    try {
      let result;

      if (data.id) {
        result = await supabase
          .from('hero_section')
          .update(payload)
          .eq('id', data.id);
      } else {
        result = await supabase
          .from('hero_section')
          .insert(payload)
          .select('id')
          .single();
      }

      if (result.error) throw result.error;

      if (!data.id && result.data?.id) {
        setData((current) => ({ ...current, id: result.data.id }));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save Home page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading Home page...</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Home Page
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Edit every editable text and button on your public Home page.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-2 text-success-500 text-sm font-medium">
            <CheckCircle size={16} /> Saved successfully
          </span>
        )}
      </div>

      <Card>
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hero Section
            </h3>

            <div className="space-y-4">
              <Input
                label="Opportunity Badge"
                value={data.badge_text}
                onChange={(e) => update('badge_text', e.target.value)}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Greeting"
                  value={data.greeting}
                  onChange={(e) => update('greeting', e.target.value)}
                />
                <Input
                  label="Name"
                  value={data.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>

              <Input
                label="Title"
                value={data.title}
                onChange={(e) => update('title', e.target.value)}
              />

              <Textarea
                label="Description"
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
              />

              <Input
                label="Profile Image URL"
                value={data.profile_image_url}
                onChange={(e) => update('profile_image_url', e.target.value)}
                placeholder="https://..."
                hint="You can paste the public URL from Media Library."
              />
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hero Buttons
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Primary Button Text"
                value={data.primary_button_text}
                onChange={(e) => update('primary_button_text', e.target.value)}
              />
              <Input
                label="Primary Button URL"
                value={data.primary_button_url}
                onChange={(e) => update('primary_button_url', e.target.value)}
              />
              <Input
                label="Secondary Button Text"
                value={data.secondary_button_text}
                onChange={(e) => update('secondary_button_text', e.target.value)}
              />
              <Input
                label="Secondary Button URL"
                value={data.secondary_button_url}
                onChange={(e) => update('secondary_button_url', e.target.value)}
              />
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Featured Projects Section
            </h3>

            <div className="space-y-4">
              <Input
                label="Section Heading"
                value={data.projects_heading}
                onChange={(e) => update('projects_heading', e.target.value)}
              />
              <Input
                label="Section Subtitle"
                value={data.projects_subtitle}
                onChange={(e) => update('projects_subtitle', e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="View All Text"
                  value={data.projects_view_all_text}
                  onChange={(e) => update('projects_view_all_text', e.target.value)}
                />
                <Input
                  label="Project Card Button Text"
                  value={data.project_card_button_text}
                  onChange={(e) => update('project_card_button_text', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Call-to-Action Section
            </h3>

            <div className="space-y-4">
              <Input
                label="CTA Heading"
                value={data.cta_title}
                onChange={(e) => update('cta_title', e.target.value)}
              />

              <Textarea
                label="CTA Description"
                value={data.cta_description}
                onChange={(e) => update('cta_description', e.target.value)}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="CTA Button Text"
                  value={data.cta_button_text}
                  onChange={(e) => update('cta_button_text', e.target.value)}
                />
                <Input
                  label="CTA Button URL"
                  value={data.cta_button_url}
                  onChange={(e) => update('cta_button_url', e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} loading={saving}>
              {!saving && <Save size={18} />}
              Save Home Page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
