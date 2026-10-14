import { useEffect, useState } from 'react';
import { Briefcase, Clock, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { InlineLoader } from '@/components/ui/Loading';

type ExperienceRow = {
  id: string; company: string; position: string; location: string | null;
  start_date: string; end_date: string | null; is_current: boolean;
  description: string | null; company_url: string | null; logo_url: string | null;
  display_order: number; published: boolean;
};

export function ExperiencePage() {
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('experience').select('*')
        .eq('published', true).order('display_order')
        .order('start_date', { ascending: false });
      setExperiences((data || []) as ExperienceRow[]);
      setLoading(false);
    };
    void load();
  }, []);

  if (loading) return <InlineLoader />;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      <Section title="Experience" subtitle="My professional journey and internships">
        {experiences.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No experience entries yet.</p>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 md:-translate-x-px" />
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div key={exp.id}
                  className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 z-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-md ring-4 ring-white dark:ring-slate-900">
                      <Briefcase size={16} />
                    </div>
                  </div>
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-left' : 'md:pl-12 md:text-left'}`}>
                    <Card className="animate-slide-up">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                          {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {exp.logo_url && <img src={exp.logo_url} alt="" className="h-7 w-7 rounded object-contain" />}
                        <h3 className="text-lg font-semibold">{exp.position}</h3>
                        {exp.is_current && <Badge variant="success">Current</Badge>}
                      </div>
                      <p className="text-primary-500 font-medium text-sm mb-1">{exp.company}</p>
                      {exp.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mb-3">
                          <MapPin size={13} /><span>{exp.location}</span>
                        </div>
                      )}
                      {exp.description && <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-3">{exp.description}</p>}
                      {exp.company_url && (
                        <a href={exp.company_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline">
                          Company <ExternalLink size={14} />
                        </a>
                      )}
                    </Card>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
