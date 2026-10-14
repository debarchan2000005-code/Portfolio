import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { type Area } from 'react-easy-crop';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminModal } from '@/components/admin/AdminModal';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import {
  Edit2,
  Plus,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Loader2,
} from 'lucide-react';

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
  created_at?: string;
  updated_at?: string;
};

type EducationForm = Omit<EducationEntry, 'id' | 'created_at' | 'updated_at'>;

const emptyEdu: EducationForm = {
  institution: '',
  degree: '',
  field: '',
  field_of_study: '',
  start_date: null,
  end_date: null,
  description: '',
  logo_url: '',
  display_order: 0,
  published: true,
};

/* ------------------------------------------------------------------ */
/* ADD THIS — document constants, type, and image helpers              */
/* ------------------------------------------------------------------ */

type EducationDocument = {
  id: string;
  education_id: string;
  title: string;
  file_path: string;
  file_type: string;
  display_order: number;
  created_at?: string;
};

const DOCS_BUCKET = 'education-documents';
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB (keep in sync with bucket limit)

// To allow more file types later, add them here (and in the bucket's allowed_mime_types)
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
const ACCEPT_ATTR = Object.keys(ALLOWED_TYPES).join(',');

const createImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });

// Renders the rotated image, then copies out the crop rectangle.
// Keeps the source type (PNG stays lossless; JPEG/WEBP at 0.95) to limit quality loss.
async function getEditedBlob(
  src: string,
  crop: Area,
  rotation: number,
  mime: string
): Promise<Blob> {
  const image = await createImage(src);
  const rad = (rotation * Math.PI) / 180;
  const boxW = Math.abs(Math.cos(rad) * image.width) + Math.abs(Math.sin(rad) * image.height);
  const boxH = Math.abs(Math.sin(rad) * image.width) + Math.abs(Math.cos(rad) * image.height);

  const full = document.createElement('canvas');
  full.width = Math.round(boxW);
  full.height = Math.round(boxH);
  const fctx = full.getContext('2d');
  if (!fctx) throw new Error('Canvas not supported');
  fctx.translate(full.width / 2, full.height / 2);
  fctx.rotate(rad);
  fctx.translate(-image.width / 2, -image.height / 2);
  fctx.drawImage(image, 0, 0);

  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(crop.width));
  out.height = Math.max(1, Math.round(crop.height));
  const octx = out.getContext('2d');
  if (!octx) throw new Error('Canvas not supported');
  octx.drawImage(
    full,
    Math.round(crop.x),
    Math.round(crop.y),
    out.width,
    out.height,
    0,
    0,
    out.width,
    out.height
  );

  return new Promise((resolve, reject) =>
    out.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not create image'))),
      mime,
      0.95
    )
  );
}

/* ------------------------------------------------------------------ */
/* ADD THIS — image editor modal (full-screen, mobile friendly)        */
/* ------------------------------------------------------------------ */

type AspectKey = 'auto' | '4:3' | '1:1' | 'a4';

function ImageEditorModal({
  file,
  onCancel,
  onApply,
}: {
  file: File;
  onCancel: () => void;
  onApply: (blob: Blob, mime: string) => Promise<void> | void;
}) {
  const [src, setSrc] = useState('');
  const [naturalAspect, setNaturalAspect] = useState(4 / 3);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectKey, setAspectKey] = useState<AspectKey>('auto');
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Local preview URL only for editing — never saved as file_url
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    createImage(url)
      .then((img) => setNaturalAspect(img.width / img.height))
      .catch(() => setErr('Could not read this image.'));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const aspect =
    aspectKey === 'auto'
      ? naturalAspect
      : aspectKey === '4:3'
        ? 4 / 3
        : aspectKey === '1:1'
          ? 1
          : 210 / 297;

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectKey('auto');
  };

  const apply = async () => {
    if (!area || !src) return;
    setBusy(true);
    setErr('');
    try {
      const mime =
        file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
      const blob = await getEditedBlob(src, area, rotation, mime);
      await onApply(blob, mime);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to process image');
      setBusy(false);
    }
  };

  const btn =
    'inline-flex items-center justify-center rounded-md border border-slate-600 p-2 text-slate-200 hover:bg-slate-800 disabled:opacity-40';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-slate-100">
      <div className="px-4 py-3 text-sm font-semibold border-b border-slate-800">
        Edit image
      </div>

      <div className="relative min-h-0 flex-1 bg-black">
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            minZoom={1}
            maxZoom={4}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        )}
      </div>

      <div className="space-y-3 border-t border-slate-800 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {err && <p className="text-sm text-red-400">{err}</p>}

        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => setZoom((z) => Math.max(1, z - 0.2))} aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="min-w-0 flex-1 accent-blue-500"
            aria-label="Zoom"
          />
          <button className={btn} onClick={() => setZoom((z) => Math.min(4, z + 0.2))} aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} onClick={() => setRotation((r) => r - 90)} aria-label="Rotate left">
            <RotateCcw size={16} />
          </button>
          <button className={btn} onClick={() => setRotation((r) => r + 90)} aria-label="Rotate right">
            <RotateCw size={16} />
          </button>

          <select
            value={aspectKey}
            onChange={(e) => setAspectKey(e.target.value as AspectKey)}
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-2 text-sm"
            aria-label="Crop shape"
          >
            <option value="auto">Original shape</option>
            <option value="a4">A4 portrait</option>
            <option value="4:3">4:3</option>
            <option value="1:1">Square</option>
          </select>

          <button className={`${btn} px-3 text-sm`} onClick={reset}>
            Reset
          </button>

          <div className="ml-auto flex gap-2">
            <button className={`${btn} px-3 text-sm`} onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button
              onClick={apply}
              disabled={busy || !area}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              Apply &amp; Upload
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function AdminEducation() {
  const [items, setItems] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EducationEntry | null>(null);
  const [formData, setFormData] = useState<EducationForm>(emptyEdu);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ADD THIS — document state
  const [docs, setDocs] = useState<EducationDocument[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docError, setDocError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [pendingTitle, setPendingTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from('education')
      .select('*')
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setItems([]);
    } else {
      setError('');
      setItems((data || []) as EducationEntry[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  // ADD THIS — document helpers
  const loadDocs = async (educationId: string) => {
    const { data, error: err } = await supabase
      .from('education_documents')
      .select('*')
      .eq('education_id', educationId)
      .order('display_order', { ascending: true });

    if (err) setDocError(err.message);
    else setDocs((data || []) as EducationDocument[]);
  };

  const uploadDocument = async (body: Blob, mime: string, title: string) => {
    if (!editing) return;

    setUploading(true);
    setDocError('');

    const path = `${editing.id}/${crypto.randomUUID()}.${ALLOWED_TYPES[mime]}`;

    const { error: upErr } = await supabase.storage
      .from(DOCS_BUCKET)
      .upload(path, body, { contentType: mime, cacheControl: '3600', upsert: false });

    if (upErr) {
      setDocError(upErr.message);
      setUploading(false);
      return;
    }

    const nextOrder = docs.length ? Math.max(...docs.map((d) => d.display_order)) + 1 : 0;

    const { data, error: insErr } = await supabase
      .from('education_documents')
      .insert({
        education_id: editing.id,
        title,
        file_path: path,
        file_type: mime,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (insErr || !data) {
      // don't leave an orphaned file behind
      await supabase.storage.from(DOCS_BUCKET).remove([path]);
      setDocError(insErr?.message || 'Could not save document.');
      setUploading(false);
      return;
    }

    setDocs((prev) => [...prev, data as EducationDocument]);
    setDocTitle('');
    setUploading(false);
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;

    setDocError('');

    if (!ALLOWED_TYPES[file.type]) {
      setDocError('Only JPG, PNG, WEBP images and PDF files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setDocError('File is too large (max 10 MB).');
      return;
    }

    const title = docTitle.trim() || file.name.replace(/\.[^.]+$/, '');

    if (file.type.startsWith('image/')) {
      setPendingTitle(title);
      setEditorFile(file); // crop/rotate first, upload on Apply
    } else {
      void uploadDocument(file, file.type, title);
    }
  };

  const handleEditorApply = async (blob: Blob, mime: string) => {
    await uploadDocument(blob, mime, pendingTitle);
    setEditorFile(null);
  };

  const renameDoc = async (doc: EducationDocument, title: string) => {
    const next = title.trim();
    if (!next || next === doc.title) return;

    const { error: err } = await supabase
      .from('education_documents')
      .update({ title: next })
      .eq('id', doc.id);

    if (err) setDocError(err.message);
    else setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, title: next } : d)));
  };

  const deleteDoc = async (doc: EducationDocument) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    setDocError('');

    const { error: dbErr } = await supabase
      .from('education_documents')
      .delete()
      .eq('id', doc.id);

    if (dbErr) {
      setDocError(dbErr.message);
      return;
    }

    const { error: stErr } = await supabase.storage.from(DOCS_BUCKET).remove([doc.file_path]);
    if (stErr) setDocError(`Record deleted, but the file could not be removed: ${stErr.message}`);

    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const moveDoc = async (index: number, dir: -1 | 1) => {
    const other = index + dir;
    if (other < 0 || other >= docs.length) return;

    const a = docs[index];
    const b = docs[other];

    const [r1, r2] = await Promise.all([
      supabase.from('education_documents').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('education_documents').update({ display_order: a.display_order }).eq('id', b.id),
    ]);

    if (r1.error || r2.error) {
      setDocError((r1.error || r2.error)!.message);
      return;
    }

    setDocs((prev) => {
      const next = [...prev];
      next[index] = { ...b, display_order: a.display_order };
      next[other] = { ...a, display_order: b.display_order };
      return next.sort((x, y) => x.display_order - y.display_order);
    });
  };

  const viewDoc = async (doc: EducationDocument) => {
    // open the tab first so mobile browsers don't block the popup
    const win = window.open('', '_blank');
    const { data, error: err } = await supabase.storage
      .from(DOCS_BUCKET)
      .createSignedUrl(doc.file_path, 300);

    if (err || !data) {
      win?.close();
      setDocError(err?.message || 'Could not open document.');
      return;
    }
    if (win) win.location.href = data.signedUrl;
    else window.open(data.signedUrl, '_blank');
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ ...emptyEdu });
    setError('');
    setDocs([]); // ADD THIS
    setDocTitle('');
    setDocError('');
    setModalOpen(true);
  };

  const openEdit = (item: EducationEntry) => {
    setEditing(item);
    setFormData({
      institution: item.institution || '',
      degree: item.degree || '',
      field: item.field || item.field_of_study || '',
      field_of_study: item.field_of_study || item.field || '',
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      description: item.description || '',
      logo_url: item.logo_url || '',
      display_order: item.display_order ?? 0,
      published: item.published ?? true,
    });
    setError('');
    setDocs([]); // ADD THIS
    setDocTitle('');
    setDocError('');
    void loadDocs(item.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.degree.trim() || !formData.institution.trim()) {
      setError('Degree and Institution are required.');
      return;
    }

    setSaving(true);
    setError('');

    const fieldOfStudy = (formData.field_of_study || formData.field || '').trim();

    const payload = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field: fieldOfStudy,
      field_of_study: fieldOfStudy,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description?.trim() || null,
      logo_url: formData.logo_url?.trim() || null,
      display_order: Number(formData.display_order) || 0,
      published: formData.published,
    };

    const result = editing
      ? await supabase.from('education').update(payload).eq('id', editing.id)
      : await supabase.from('education').insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    await load();
  };

  const handleDelete = async () => {
    if (!editing) return;

    setSaving(true);
    setError('');

    // ADD THIS — DB cascade removes the rows but NOT the storage files, so remove them first
    const { data: docRows } = await supabase
      .from('education_documents')
      .select('file_path')
      .eq('education_id', editing.id);

    if (docRows && docRows.length > 0) {
      await supabase.storage
        .from(DOCS_BUCKET)
        .remove(docRows.map((d) => d.file_path as string));
    }

    const { error: deleteError } = await supabase
      .from('education')
      .delete()
      .eq('id', editing.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    await load();
  };

  return (
    <>
      <AdminPageHeader
        title="Education"
        description="Manage education timeline entries"
        loading={loading}
        onAdd={openAdd}
        addLabel="Add Education"
      >
        {error && !modalOpen && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No education entries yet.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer"
                onClick={() => openEdit(item)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.degree}</h3>
                    <p className="text-sm text-primary-500 mb-1">
                      {item.institution}
                    </p>

                    {(item.field_of_study || item.field) && (
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {item.field_of_study || item.field}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {item.start_date || '—'} — {item.end_date || 'Present'}
                    </p>

                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <span
                      className={`inline-block mt-2 text-xs ${
                        item.published ? 'text-emerald-400' : 'text-gray-500'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <span className="text-xs text-primary-500 flex items-center gap-1">
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
        title={editing ? 'Edit Education' : 'Add Education'}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        saving={saving}
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Degree"
            value={formData.degree}
            onChange={(e) =>
              setFormData({ ...formData, degree: e.target.value })
            }
            placeholder="BCA"
          />

          <Input
            label="Institution"
            value={formData.institution}
            onChange={(e) =>
              setFormData({ ...formData, institution: e.target.value })
            }
            placeholder="College / University name"
          />

          <Input
            label="Field of Study"
            value={formData.field_of_study || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                field: e.target.value,
                field_of_study: e.target.value,
              })
            }
            placeholder="Computer Applications"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  start_date: e.target.value || null,
                })
              }
            />

            <Input
              label="End Date"
              type="date"
              value={formData.end_date || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  end_date: e.target.value || null,
                })
              }
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Details about this education..."
          />

          <Input
            label="Logo URL"
            value={formData.logo_url || ''}
            onChange={(e) =>
              setFormData({ ...formData, logo_url: e.target.value })
            }
            placeholder="https://..."
          />

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

          <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="h-4 w-4 accent-blue-500"
            />
            Published — show on the public website
          </label>

          {/* ADD THIS — Results / Documents section */}
          <div className="border-t border-gray-200 pt-4 dark:border-slate-700">
            <h4 className="mb-1 text-sm font-semibold">Results / Documents</h4>

            {!editing ? (
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Save this entry first, then reopen it to add marksheets and certificates.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Uploads, renames, reordering and deletes here apply immediately (no need to press Save).
                </p>

                {docError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                    {docError}
                  </div>
                )}

                {docs.length === 0 ? (
                  <p className="text-xs text-gray-400">No documents yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {docs.map((doc, i) => (
                      <li
                        key={doc.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-slate-700"
                      >
                        <span className="text-gray-400">
                          {doc.file_type.startsWith('image/') ? (
                            <ImageIcon size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </span>

                        <input
                          defaultValue={doc.title}
                          onBlur={(e) => void renameDoc(doc, e.target.value)}
                          aria-label="Document title"
                          className="min-w-0 flex-1 basis-40 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-blue-500 focus:outline-none dark:hover:border-slate-600"
                        />

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void moveDoc(i, -1)}
                            disabled={i === 0}
                            aria-label="Move up"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-800"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveDoc(i, 1)}
                            disabled={i === docs.length - 1}
                            aria-label="Move down"
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-800"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void viewDoc(doc)}
                            aria-label="View"
                            className="rounded-md p-1.5 text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteDoc(doc)}
                            aria-label="Delete"
                            className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <Input
                  label="New document title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Class X Marksheet, BCA Semester 1 Result"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  onChange={handleFilePicked}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-primary-500 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {uploading ? 'Uploading…' : 'Add Document (image or PDF)'}
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminModal>

      {/* ADD THIS */}
      {editorFile && (
        <ImageEditorModal
          file={editorFile}
          onCancel={() => setEditorFile(null)}
          onApply={handleEditorApply}
        />
      )}
    </>
  );
}