import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Save, CheckCircle } from 'lucide-react';

type AboutForm = {
  heading: string;
  subtitle: string;
  name: string;
  tagline: string;
  bio: string;
  years_coding: string;
  projects_built: string;
  github_stars: string;
  open_source: string;
};

const defaults: AboutForm = {
  heading: 'About Me',
  subtitle: 'Get to know me a little better',
  name: 'Debarchan Upadhyaya',
  tagline: '',
  bio: '',
  years_coding: '4+',
  projects_built: '15+',
  github_stars: '500+',
  open_source: 'Active',
};

export function AdminAbout() {
  const [form, setForm] = useState<AboutForm>(defaults);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id,name,full_name,tagline,bio,about_heading,about_subtitle,about_years_coding,about_projects_built,about_github_stars,about_open_source'
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('ABOUT LOAD ERROR:', error);
      }

      if (data) {
        setProfileId(data.id);
        setForm({
          heading: data.about_heading || defaults.heading,
          subtitle: data.about_subtitle || defaults.subtitle,
          name: data.name || data.full_name || defaults.name,
          tagline: data.tagline || '',
          bio: data.bio || '',
          years_coding: data.about_years_coding || defaults.years_coding,
          projects_built: data.about_projects_built || defaults.projects_built,
          github_stars: data.about_github_stars || defaults.github_stars,
          open_source: data.about_open_source || defaults.open_source,
        });
      }

      setLoading(false);
    }

    void load();
  }, []);

  const update = (field: keyof AboutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: userResult } = await supabase.auth.getUser();
      if (!userResult.user) throw new Error('You must be logged in.');

      const payload = {
        name: form.name,
        full_name: form.name,
        tagline: form.tagline,
        bio: form.bio,
        about_heading: form.heading,
        about_subtitle: form.subtitle,
        about_years_coding: form.years_coding,
        about_projects_built: form.projects_built,
        about_github_stars: form.github_stars,
        about_open_source: form.open_source,
        updated_at: new Date().toISOString(),
      };

      if (profileId) {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', profileId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userResult.user.id,
              email: userResult.user.email || '',
              ...payload,
            },
            { onConflict: 'id' }
          )
          .select('id')
          .single();

        if (error) throw error;
        setProfileId(data.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save About page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading About page...</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            About Page
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Edit the content displayed on your public About page.
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-2 text-success-500 text-sm font-medium">
            <CheckCircle size={16} />
            Saved successfully
          </span>
        )}
      </div>

      <Card>
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Page Header
            </h3>

            <div className="space-y-4">
              <Input
                label="Heading"
                value={form.heading}
                onChange={(e) => update('heading', e.target.value)}
              />

              <Input
                label="Subtitle"
                value={form.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
              />
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Introduction
            </h3>

            <div className="space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />

              <Input
                label="Tagline"
                value={form.tagline}
                onChange={(e) => update('tagline', e.target.value)}
              />

              <Textarea
                label="About / Bio"
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
              />
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Years Coding"
                value={form.years_coding}
                onChange={(e) => update('years_coding', e.target.value)}
              />

              <Input
                label="Projects Built"
                value={form.projects_built}
                onChange={(e) => update('projects_built', e.target.value)}
              />

              <Input
                label="GitHub Stars"
                value={form.github_stars}
                onChange={(e) => update('github_stars', e.target.value)}
              />

              <Input
                label="Open Source"
                value={form.open_source}
                onChange={(e) => update('open_source', e.target.value)}
              />
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} loading={saving}>
              {!saving && <Save size={18} />}
              Save About Page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
