// src/pages/Resume.tsx
import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/Loading';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';
import { normalizeSettings, type ResumeData } from '@/lib/resumeConfig';

export function ResumePage() {
  const [settings, setSettings] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('resume_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        setSettings(data ? normalizeSettings(data) : null);
      } catch (err) {
        console.error('Failed to load resume:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <InlineLoader />;

  if (!settings) {
    return (
      <Section title="Resume" subtitle="My professional background">
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400">Resume not available yet.</p>
        </Card>
      </Section>
    );
  }

  const empty = !settings.full_name && !settings.professional_summary;

  return (
    <div className="animate-fade-in resume-page">
      <Section title="Resume" subtitle="My professional background at a glance">
        <div className="max-w-4xl mx-auto print-resume">
          <div className="print-resume-card bg-white rounded-xl shadow-card border border-gray-200 p-8 lg:p-12">
            {empty ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Resume hasn't been built yet. The admin can create it from the Resume Builder.</p>
              </div>
            ) : (
              <ResumeRenderer data={settings} />
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-white font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: settings.design_settings.primaryColor }}
          >
            <Download size={18} /> Print / Save as PDF
          </button>
        </div>
      </Section>

      <style>{`
        .print-resume-card h3 { font-size: 1.05em; line-height: 1.35; margin: 0; }
        @media print {
          @page { size: A4; margin: 8mm; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .print-resume, .print-resume * { visibility: visible !important; }
          .print-resume {
            position: absolute !important; top: 0 !important; left: 0 !important;
            width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important;
          }
          /* Border + padding repeat on EVERY printed page */
          .print-resume-card {
            width: 100% !important; max-width: none !important; margin: 0 !important;
            padding: 8mm !important; box-shadow: none !important; border-radius: 0 !important;
            border: 1.5px solid #9ca3af !important;
            box-decoration-break: clone !important;
            -webkit-box-decoration-break: clone !important;
          }

          /* No big empty gaps: sections flow across pages instead of jumping to the next one */
          .print-resume-card section {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          .print-resume-card h2 { break-after: avoid !important; }
          .print-resume-card, .print-resume-card * {
            print-color-adjust: exact; -webkit-print-color-adjust: exact;
          }
          .print-resume-card a { text-decoration: none !important; }
        }
      `}</style>
    </div>
  );
}