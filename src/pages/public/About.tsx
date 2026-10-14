import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/Loading';

type AboutData = {
  name: string;
  tagline: string;
  bio: string;
  about_heading: string;
  about_subtitle: string;
  about_years_coding: string;
  about_projects_built: string;
  about_github_stars: string;
  about_open_source: string;
};

export function About() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAbout() {
      const { data, error } = await supabase
        .from('profiles')
        .select('name,full_name,tagline,bio,about_heading,about_subtitle,about_years_coding,about_projects_built,about_github_stars,about_open_source')
        .limit(1)
        .maybeSingle();

      if (error) console.error('ABOUT LOAD ERROR:', error);

      if (data) {
        setAbout({
          name: data.name || data.full_name || '',
          tagline: data.tagline || '',
          bio: data.bio || '',
          about_heading: data.about_heading || 'About Me',
          about_subtitle: data.about_subtitle || 'Get to know me a little better',
          about_years_coding: data.about_years_coding || '4+',
          about_projects_built: data.about_projects_built || '15+',
          about_github_stars: data.about_github_stars || '500+',
          about_open_source: data.about_open_source || 'Active',
        });
      }

      setLoading(false);
    }

    void loadAbout();
  }, []);

  if (loading) return <InlineLoader />;

  if (!about) {
    return (
      <Section title="About">
        <p className="text-center text-gray-500">No about information found.</p>
      </Section>
    );
  }

  const stats = [
    { label: 'Years Coding', value: about.about_years_coding },
    { label: 'Projects Built', value: about.about_projects_built },
    { label: 'GitHub Stars', value: about.about_github_stars },
    { label: 'Open Source', value: about.about_open_source },
  ];

  return (
    <div className="animate-fade-in">
      <Section title={about.about_heading} subtitle={about.about_subtitle}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
              {about.name}
            </h3>

            {about.tagline && (
              <p className="mt-3 text-lg text-primary-500 font-medium">
                {about.tagline}
              </p>
            )}

            {about.bio && (
              <p className="mt-5 text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {about.bio}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary-500 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
