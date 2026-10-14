import { useEffect, useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { InlineLoader } from '@/components/ui/Loading';

type Project = {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  technologies: string[] | null;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
};

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to load projects:', error);
      } else {
        setProjects((data || []) as Project[]);
      }

      setLoading(false);
    };

    void loadProjects();
  }, []);

  if (loading) return <InlineLoader />;

  return (
    <div className="animate-fade-in">
      <Section
        title="Projects"
        subtitle="Explore my work, projects, and technical experience."
      >
        {projects.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            No published projects available yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                )}

                <h3 className="mb-2 text-lg font-semibold">
                  {project.title}
                </h3>

                <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                  {project.short_description || project.description}
                </p>

                {project.technologies &&
                  project.technologies.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <Badge key={technology}>{technology}</Badge>
                      ))}
                    </div>
                  )}

                <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3 dark:border-slate-700">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
                    >
                      Live Demo <ExternalLink size={14} />
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
                    >
                      GitHub <Github size={14} />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}