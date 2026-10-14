import { Link } from 'react-router-dom';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

type HeroSection = {
  badge_text?: string;
  greeting: string;
  name: string;
  title: string;
  description: string;
  profile_image_url: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  projects_heading?: string;
  projects_subtitle?: string;
  projects_view_all_text?: string;
  project_card_button_text?: string;
  cta_title?: string;
  cta_description?: string;
  cta_button_text?: string;
  cta_button_url?: string;
  published: boolean;
};

type ProjectPreview = {
  id: string;
  title: string;
  description: string | null;
  technologies: string[] | null;
  featured: boolean;
  display_order: number;
};

type SiteSettings = {
  email: string | null;
  resume_url: string | null;
};

const defaultHero: HeroSection = {
  badge_text: 'Available for opportunities',
  greeting: "Hi, I'm",
  name: 'Debarchan',
  title: 'Computer Science Student & Full-Stack Developer',
  description:
    'Building beautiful, functional web experiences with modern technologies.',
  profile_image_url: null,
  primary_button_text: 'View Projects',
  primary_button_url: '/projects',
  secondary_button_text: 'View Resume',
  secondary_button_url: '/resume',
  published: true,
};

export function Home() {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('/resume');

  useEffect(() => {
    async function loadHome() {
      const [heroResult, resumeResult, projectsResult, settingsResult] =
  await Promise.all([
        supabase
          .from('hero_section')
          .select('*')
          .eq('published', true)
          .limit(1)
          .maybeSingle(),
          supabase
      .from('resume_settings')
      .select('profile_image_url')
      .limit(1)
      .maybeSingle(),
        supabase
          .from('projects')
          .select(
            'id,title,description,technologies,featured,display_order'
          )
          .eq('featured', true)
          .eq('published', true)
          .order('display_order')
          .limit(3),

        supabase
          .from('site_settings')
          .select('email,resume_url')
          .limit(1)
          .maybeSingle(),
      ]);

      if (heroResult.error) {
  console.error('HOME HERO ERROR:', heroResult.error);
} else if (heroResult.data) {
  setHero({
    ...(heroResult.data as HeroSection),
    profile_image_url:
      resumeResult.data?.profile_image_url ||
      heroResult.data.profile_image_url,
  });
}

      if (projectsResult.error) {
        console.error('HOME PROJECTS ERROR:', projectsResult.error);
      } else {
        setProjects((projectsResult.data || []) as ProjectPreview[]);
      }

      if (settingsResult.error) {
        console.error('HOME SETTINGS ERROR:', settingsResult.error);
      } else if (settingsResult.data) {
        const settings = settingsResult.data as SiteSettings;
        setEmail(settings.email);
        if (settings.resume_url) {
          setResumeUrl(settings.resume_url);
        }
      }

      setLoading(false);
    }

    void loadHome();
  }, []);

  if (loading || !hero) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="animate-pulse text-gray-500 dark:text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  const displayName = hero.name?.trim() || '';
  const badgeText = hero.badge_text?.trim() || 'Available for opportunities';

  const description =
    hero.description?.trim() ||
    'Building beautiful, functional web experiences with modern technologies.';

  const primaryUrl = hero.primary_button_url?.trim() || '/projects';
  const secondaryUrl = hero.secondary_button_url?.trim() || resumeUrl;

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary-200/30 dark:bg-primary-900/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -right-20 h-72 w-72 rounded-full bg-accent-200/20 dark:bg-accent-900/20 blur-3xl" />

        <div className="container-content relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge variant="success" className="mb-4">
                <Sparkles size={14} />
                {badgeText}
              </Badge>

              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight text-gray-900 dark:text-white">
                {hero.greeting || "Hi, I'm"}{' '}
                <span className="text-primary-500">{displayName}</span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-slate-300 mb-6 font-medium">
                {hero.title || defaultHero.title}
              </p>

              <p className="text-base text-gray-500 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {isExternal(primaryUrl) ? (
                  <a href={primaryUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg">
                      {hero.primary_button_text || 'View Projects'}{' '}
                      <ArrowRight size={18} />
                    </Button>
                  </a>
                ) : (
                  <Link to={primaryUrl}>
                    <Button size="lg">
                      {hero.primary_button_text || 'View Projects'}{' '}
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                )}

                {isExternal(secondaryUrl) ? (
                  <a
                    href={secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="lg">
                      <Download size={18} />{' '}
                      {hero.secondary_button_text || 'View Resume'}
                    </Button>
                  </a>
                ) : (
                  <Link to={secondaryUrl}>
                    <Button variant="secondary" size="lg">
                      <Download size={18} />{' '}
                      {hero.secondary_button_text || 'View Resume'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Profile image / code card */}
            <div className="hidden lg:flex justify-center animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-3xl blur-2xl opacity-20" />

                <div className="relative w-80 h-96 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
                  {hero.profile_image_url ? (
                    <img
                      src={hero.profile_image_url}
                      alt={hero.name || 'Profile'}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <>
                      <div className="h-10 bg-gray-50 dark:bg-slate-700/50 flex items-center gap-2 px-4 border-b border-gray-100 dark:border-slate-700">
                        <div className="h-3 w-3 rounded-full bg-error-400" />
                        <div className="h-3 w-3 rounded-full bg-warning-400" />
                        <div className="h-3 w-3 rounded-full bg-success-400" />
                      </div>

                      <div className="p-6 font-mono text-sm space-y-2">
                        <p className="text-primary-500">const developer = {'{'}</p>
                        <p className="pl-4 text-gray-600 dark:text-slate-300">
                          name:{' '}
                          <span className="text-success-500">
                            '{displayName}'
                          </span>
                          ,
                        </p>
                        <p className="pl-4 text-gray-600 dark:text-slate-300">
                          role:{' '}
                          <span className="text-success-500">'Student'</span>,
                        </p>
                        <p className="pl-4 text-gray-600 dark:text-slate-300">
                          skills: [
                          <span className="text-warning-500">'React'</span>,{' '}
                          <span className="text-warning-500">'TS'</span>],
                        </p>
                        <p className="pl-4 text-gray-600 dark:text-slate-300">
                          coffee: <span className="text-error-500">true</span>,
                        </p>
                        <p className="pl-4 text-gray-600 dark:text-slate-300">
                          openToWork:{' '}
                          <span className="text-error-500">true</span>,
                        </p>
                        <p className="text-primary-500">{'}'}</p>
                        <p className="text-gray-400 dark:text-slate-500 mt-4">
                          {'// Always learning'}
                        </p>
                        <p className="text-gray-400 dark:text-slate-500">
                          developer.
                          <span className="text-primary-500">grow</span>()
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="section-padding">
          <div className="container-content">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                  {hero.projects_heading || 'Featured Projects'}
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                  {hero.projects_subtitle || "A few things I've built recently"}
                </p>
              </div>

              <Link
                to="/projects"
                className="hidden sm:flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium text-sm"
              >
                {hero.projects_view_all_text || 'View all'} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                  <h3 className="text-xl font-semibold mb-2">
                    {project.title}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 flex-1 line-clamp-3">
                    {project.description || ''}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(project.technologies || []).slice(0, 3).map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                  </div>

                  <Link
                    to="/projects"
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
                  >
                    {hero.project_card_button_text || 'View more'} <ArrowRight size={14} />
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/projects">
                <Button variant="secondary">
                  {hero.projects_view_all_text || 'View all'} <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding">
        <div className="container-content">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 lg:p-12 text-center text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent-400/20 blur-2xl" />

            <h2 className="text-3xl lg:text-4xl font-bold mb-3 relative">
              {hero.cta_title || "Let's work together"}
            </h2>

            <p className="text-primary-50 mb-6 max-w-xl mx-auto relative">
              {hero.cta_description || "I'm currently open to internship and full-time opportunities. Let's build something great."}
            </p>

            <Link to={hero.cta_button_url || '/contact'} className="relative inline-block">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-primary-600 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-100">
                {hero.cta_button_text || 'Get in touch'} <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
