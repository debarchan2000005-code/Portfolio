import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/Loading';
import { Star } from 'lucide-react';

type PublicSkill = {
  id: string;
  name: string;
  category: string;
  icon_url: string | null;
  level: number;
  display_order: number;
  published: boolean;
  description: string | null;
  years_experience: number | null;
  proficiency_label: string | null;
  is_featured: boolean | null;
  related_skills: string[] | null;
};

export function Skills() {
  const [skills, setSkills] = useState<PublicSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (!error) {
        setSkills((data || []) as PublicSkill[]);
      } else {
        console.error('Failed to load skills:', error);
        setSkills([]);
      }

      setLoading(false);
    };

    void loadSkills();
  }, []);

  if (loading) return <InlineLoader />;

  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <div className="animate-fade-in">
      <Section title="Skills" subtitle="Technologies and tools I work with">
        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No skills listed yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const categorySkills = skills.filter(
                (skill) => skill.category === category
              );

              return (
                <Card key={category}>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500 text-sm font-bold">
                      {category[0]?.toUpperCase() || 'S'}
                    </span>
                    {category}
                  </h3>

                  <div className="space-y-6">
                    {categorySkills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-start gap-3 min-w-0">
                            {skill.icon_url && (
                              <span className="text-xl shrink-0">
                                {skill.icon_url}
                              </span>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                  {skill.name}
                                </span>

                                {skill.is_featured && (
                                  <Star
                                    size={14}
                                    className="text-yellow-400 fill-yellow-400"
                                  />
                                )}
                              </div>

                              {(skill.proficiency_label ||
                                (skill.years_experience ?? 0) > 0) && (
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-slate-500">
                                  {skill.proficiency_label && (
                                    <span>{skill.proficiency_label}</span>
                                  )}
                                  {(skill.years_experience ?? 0) > 0 && (
                                    <>
                                      {skill.proficiency_label && <span>•</span>}
                                      <span>
                                        {skill.years_experience} year
                                        {skill.years_experience === 1 ? '' : 's'} experience
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">
                            {skill.level}%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, skill.level ?? 0)
                              )}%`,
                            }}
                          />
                        </div>

                        {skill.description && (
                          <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-slate-400">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
