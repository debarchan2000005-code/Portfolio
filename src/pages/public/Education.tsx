import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap,
  Calendar,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { InlineLoader } from '@/components/ui/Loading';

type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  field_of_study?: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  logo_url: string | null;
  display_order: number;
  published: boolean;
};

// ADD THIS — document type + bucket name
type EducationDocument = {
  id: string;
  education_id: string;
  title: string;
  file_path: string;
  file_type: string;
  display_order: number;
};

const DOCS_BUCKET = 'education-documents';

const formatDate = (value: string | null) => {
  if (!value) return 'Present';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

// ADD THIS — viewer (opens only when "View Results" is clicked)
function DocumentViewer({
  title,
  docs,
  onClose,
}: {
  title: string;
  docs: EducationDocument[];
  onClose: () => void;
}) {
  const [activeId, setActiveId] = useState(docs[0].id);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);

  const active = docs.find((d) => d.id === activeId) ?? docs[0];
  const isImage = active.file_type.startsWith('image/');

  // Close on Escape + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Bucket is private: request a short-lived signed URL for the active document
  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setError('');
    setZoom(1);

    supabase.storage
      .from(DOCS_BUCKET)
      .createSignedUrl(active.file_path, 3600)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data) setError('Could not load this document.');
        else setUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [active.file_path]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-slate-700">
          <h3 className="min-w-0 truncate text-sm font-semibold sm:text-base">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document switcher (only if more than one) */}
        {docs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-gray-200 px-3 py-2 dark:border-slate-700">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveId(d.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  d.id === active.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-auto bg-gray-100 dark:bg-slate-950">
          {error ? (
            <p className="p-6 text-center text-sm text-red-400">{error}</p>
          ) : !url ? (
            <p className="p-6 text-center text-sm text-gray-500">Loading…</p>
          ) : isImage ? (
            <div className="flex min-h-full min-w-full p-2">
              <img
                src={url}
                alt={active.title}
                draggable={false}
                className="m-auto h-auto select-none object-contain"
                style={
                  zoom === 1
                    ? { maxWidth: '100%', maxHeight: '70dvh' }
                    : { width: `${zoom * 100}%`, maxWidth: 'none' }
                }
              />
            </div>
          ) : (
            <iframe
              src={url}
              title={active.title}
              className="h-full w-full border-0"
            />
          )}
        </div>

        {/* Footer controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-slate-700">
          {isImage ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                disabled={zoom <= 1}
                aria-label="Zoom out"
                className="rounded-md border border-gray-200 p-2 disabled:opacity-40 dark:border-slate-700"
              >
                <ZoomOut size={16} />
              </button>
              <span className="w-12 text-center text-xs text-gray-500 dark:text-slate-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.5).toFixed(1)))}
                disabled={zoom >= 4}
                aria-label="Zoom in"
                className="rounded-md border border-gray-200 p-2 disabled:opacity-40 dark:border-slate-700"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                className="rounded-md border border-gray-200 p-2 dark:border-slate-700"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          ) : (
            <span />
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
            >
              <ExternalLink size={14} /> Open / Download
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function EducationPage() {
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  // ADD THIS
  const [docsByEdu, setDocsByEdu] = useState<Record<string, EducationDocument[]>>({});
  const [viewing, setViewing] = useState<EducationEntry | null>(null);

  useEffect(() => {
    const loadEducation = async () => {
      const { data } = await supabase
        .from('education')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: false });

      const entries = (data || []) as EducationEntry[];
      setEducation(entries);

      // ADD THIS — load documents (RLS only returns docs of published entries)
      if (entries.length > 0) {
        const { data: docs, error: docsError } = await supabase
  .from('education_documents')
  .select('id, education_id, title, file_path, file_type, display_order')
  .in('education_id', entries.map((e) => e.id))
  .order('display_order', { ascending: true });

console.log('Education entries:', entries);
console.log('Education documents:', docs);
console.error('Education documents error:', docsError);

        const grouped: Record<string, EducationDocument[]> = {};
        ((docs || []) as EducationDocument[]).forEach((d) => {
          (grouped[d.education_id] ||= []).push(d);
        });
        setDocsByEdu(grouped);
      }

      setLoading(false);
    };

    void loadEducation();
  }, []);

  if (loading) return <InlineLoader />;

  return (
    <div className="animate-fade-in">
      <Section
        title="Education"
        subtitle="My academic journey and qualifications"
      >
        {education.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No education entries yet.
          </p>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700 md:-translate-x-px" />

            <div className="space-y-8">
              {education.map((edu, index) => (
                <div
                  key={edu.id}
                  className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                    index % 2 === 0
                      ? 'md:flex-row'
                      : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 z-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-md ring-4 ring-white dark:ring-slate-900">
                      <GraduationCap size={16} />
                    </div>
                  </div>

                  <div
                      className={`pl-12 md:pl-0 md:w-1/2 ${
                        index % 2 === 0
                          ? 'md:pr-12 md:text-left'
                          : 'md:pl-12 md:text-left'
                      }`}
                    >
                    <Card className="animate-slide-up">
                      {edu.logo_url && (
                        <img
                          src={edu.logo_url}
                          alt={`${edu.institution} logo`}
                          className={`h-12 w-12 object-contain rounded-md mb-3 ${
                            index % 2 === 0 ? 'md:ml-auto' : ''
                          }`}
                        />
                      )}

                      <div
                        className={`flex items-center gap-2 mb-2 ${
                          index % 2 === 0 ? 'md:justify-end' : ''
                        }`}
                      >
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                          {formatDate(edu.start_date)} —{' '}
                          {formatDate(edu.end_date)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-1">
                        {edu.degree}
                      </h3>

                      <p className="text-primary-500 font-medium text-sm mb-1">
                        {edu.institution}
                      </p>

                      {(edu.field_of_study || edu.field) && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                          {edu.field_of_study || edu.field}
                        </p>
                      )}

                      {edu.description && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                          {edu.description}
                        </p>
                      )}

                      {/* ADD THIS — only shown when the entry has documents */}
                      {(docsByEdu[edu.id]?.length ?? 0) > 0 && (
                        <div
                          className={`mt-4 flex ${
                            index % 2 === 0 ? 'md:justify-end' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setViewing(edu)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:underline"
                          >
                            <FileText size={14} /> View Results
                          </button>
                        </div>
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

      {/* ADD THIS */}
      {viewing && docsByEdu[viewing.id] && (
        <DocumentViewer
          title={viewing.degree}
          docs={docsByEdu[viewing.id]}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}