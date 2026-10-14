// src/pages/admin/AdminResumeBuilder.tsx
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';
import {
  ITEM_SECTIONS,
  emptyResumeSettings,
  normalizeSettings,
  sectionLabel,
  customKey,
  isCustomKey,
  uid,
  errMsg,
  type ResumeData,
  type FieldDef,
  type CustomSection,
  type CustomLayout,
} from '@/lib/resumeConfig';
import {
  Plus, Trash2, Save, CheckCircle, Eye, AlertCircle, Upload, X, ZoomIn, ZoomOut,
  RotateCw, Crop as CropIcon, ChevronDown, ChevronUp, Copy, ArrowUp, ArrowDown,
} from 'lucide-react';

/* =============================== Image crop =============================== */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedBlob(src: string, pixels: Area, rotation: number): Promise<Blob> {
  const image = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bW = image.width * cos + image.height * sin;
  const bH = image.width * sin + image.height * cos;

  const rotated = document.createElement('canvas');
  rotated.width = bW;
  rotated.height = bH;
  const rctx = rotated.getContext('2d')!;
  rctx.translate(bW / 2, bH / 2);
  rctx.rotate(rad);
  rctx.translate(-image.width / 2, -image.height / 2);
  rctx.drawImage(image, 0, 0);

  const size = Math.min(Math.round(pixels.width), 800);
  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  out.getContext('2d')!.drawImage(rotated, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, size, size);

  return new Promise((resolve, reject) =>
    out.toBlob(b => (b ? resolve(b) : reject(new Error('Could not crop image'))), 'image/jpeg', 0.9)
  );
}

function ImageCropModal({
  imageUrl, shape, busy, onConfirm, onClose,
}: {
  imageUrl: string;
  shape: 'circle' | 'rounded' | 'square';
  busy: boolean;
  onConfirm: (blob: Blob) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState<Area | null>(null);

  const apply = async () => {
    if (!pixels) return;
    onConfirm(await getCroppedBlob(imageUrl, pixels, rotation));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crop Profile Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="relative w-full h-80 mb-6 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape={shape === 'circle' ? 'round' : 'rect'}
            showGrid
            onCropChange={setCrop}
            onCropComplete={(_, px) => setPixels(px)}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Zoom</label>
            <div className="flex items-center gap-3">
              <ZoomOut size={18} />
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="flex-1" />
              <ZoomIn size={18} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Rotation</label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={360} step={1} value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="flex-1" />
              <Button variant="secondary" size="sm" onClick={() => setRotation(0)}><RotateCw size={14} /> Reset</Button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={apply} loading={busy}><CropIcon size={16} /> Apply Crop</Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================== UI helpers ============================== */

function Panel({
  title, icon, open, onToggle, actions, children,
}: {
  title: string; icon?: string; open: boolean; onToggle: () => void; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2 cursor-pointer select-none" onClick={onToggle}>
        <h3 className="font-semibold flex items-center gap-2">
          {icon && <span>{icon}</span>} {title}
        </h3>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {actions}
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600" aria-label="Toggle">
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      {open && <div className="mt-4 space-y-4">{children}</div>}
    </Card>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <label className="text-sm font-medium mb-1 block">{children}</label>;
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: any; onChange: (v: any) => void }) {
  const v = value ?? '';
  return (
    <div className={def.full ? 'sm:col-span-2' : ''}>
      <Label>{def.label}</Label>
      {def.type === 'textarea' ? (
        <Textarea value={v} onChange={e => onChange(e.target.value)} placeholder={def.placeholder} className="min-h-[80px]" />
      ) : def.type === 'select' ? (
        <select value={v} onChange={e => onChange(e.target.value)} className="input-field w-full">
          {def.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <Input
          type={def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : 'text'}
          value={v}
          onChange={e => onChange(def.type === 'number' ? e.target.value : e.target.value)}
          placeholder={def.placeholder}
        />
      )}
    </div>
  );
}

function RowActions({
  index, count, enabled, onToggle, onMove, onDuplicate, onRemove,
}: {
  index: number; count: number; enabled: boolean;
  onToggle: (v: boolean) => void; onMove: (dir: -1 | 1) => void; onDuplicate?: () => void; onRemove: () => void;
}) {
  const btn = 'p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30';
  return (
    <div className="flex items-center gap-1">
      <label className="flex items-center gap-1 text-xs mr-1" title="Show on resume">
        <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} className="w-4 h-4" /> Show
      </label>
      <button className={btn} disabled={index === 0} onClick={() => onMove(-1)} title="Move up"><ArrowUp size={14} /></button>
      <button className={btn} disabled={index === count - 1} onClick={() => onMove(1)} title="Move down"><ArrowDown size={14} /></button>
      {onDuplicate && <button className={btn} onClick={onDuplicate} title="Duplicate"><Copy size={14} /></button>}
      <button className={`${btn} !text-red-500`} onClick={onRemove} title="Delete"><Trash2 size={14} /></button>
    </div>
  );
}

function moveInArray<T>(arr: T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir;
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  [copy[from], copy[to]] = [copy[to], copy[from]];
  return copy;
}

/* ================================ Main page ================================ */

const PAYLOAD_KEYS = [
  'full_name', 'professional_title', 'professional_summary', 'date_of_birth',
  'email', 'phone', 'location', 'website', 'linkedin_url', 'github_url',
  'profile_image_url', 'profile_image_crop',
  'skills', 'hobbies', 'languages', 'experience', 'education', 'projects', 'certifications',
  'custom_fields', 'custom_sections',
  'section_order', 'section_visibility', 'design_settings',
] as const;

export function AdminResumeBuilder() {
  const [settings, setSettings] = useState<ResumeData>(emptyResumeSettings);
  const [snapshot, setSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set(['basic', 'personal']));
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionLayout, setNewSectionLayout] = useState<CustomLayout>('entries');
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(() => !loading && JSON.stringify(settings) !== snapshot, [settings, snapshot, loading]);
  const patch = (p: Partial<ResumeData>) => setSettings(prev => ({ ...prev, ...p }));
  const toggle = (k: string) =>
    setOpen(prev => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  /* ------------------------------- Load ------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        // Same query as the public page: always the most recent row.
        const { data, error: err } = await supabase
          .from('resume_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (err) throw err;
        const next = normalizeSettings(data);
        setSettings(next);
        setSnapshot(JSON.stringify(next));
      } catch (e) {
        setError(errMsg(e, 'Failed to load resume'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  /* ------------------------------- Save ------------------------------- */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload: Record<string, any> = {};
      PAYLOAD_KEYS.forEach(k => { payload[k] = (settings as any)[k] ?? null; });
      payload.updated_at = new Date().toISOString();

      let result: any;
      if (settings.id) {
        const { data, error: err } = await supabase
          .from('resume_settings').update(payload).eq('id', settings.id).select().single();
        if (err) throw err;
        result = data;
      } else {
        const { data, error: err } = await supabase
          .from('resume_settings').insert([payload]).select().single();
        if (err) throw err;
        result = data;
      }
      const next = normalizeSettings(result);
      setSettings(next);
      setSnapshot(JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(errMsg(e, 'Failed to save resume'));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------- Profile image ---------------------------- */
  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Please upload a JPG, PNG or WebP image');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be smaller than 5MB');
    setError(null);
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCropped = async (blob: Blob) => {
    try {
      setUploading(true);
      setError(null);
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error('You are not signed in. Please log in again.');

      // Storage RLS requires the first folder to be auth.uid()
      const path = `${user.id}/resume-profile-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('profile-images').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      patch({ profile_image_url: data.publicUrl });
      setCropSrc(null);
    } catch (e) {
      setError(errMsg(e, 'Failed to upload profile image'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      const url = settings.profile_image_url;
      if (url) {
        const marker = '/profile-images/';
        const idx = url.indexOf(marker);
        if (idx !== -1) await supabase.storage.from('profile-images').remove([decodeURIComponent(url.slice(idx + marker.length))]);
      }
    } catch (e) {
      console.error('Failed to delete image file:', e);
    }
    patch({ profile_image_url: undefined, profile_image_crop: undefined });
  };

  /* ------------------------- Generic list helpers ------------------------- */
  const listOf = (key: string): any[] => ((settings as any)[key] as any[]) || [];
  const setList = (key: string, list: any[]) => patch({ [key]: list } as any);

  /* ---------------------------- Custom fields ---------------------------- */
  const customFields = settings.custom_fields || [];

  /* --------------------------- Custom sections --------------------------- */
  const customSections = settings.custom_sections || [];
  const updateCustom = (id: string, p: Partial<CustomSection>) =>
    patch({ custom_sections: customSections.map(s => (s.id === id ? { ...s, ...p } : s)) });

  const addCustomSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return setError('Give the new section a title first');
    setError(null);
    const sec: CustomSection = { id: uid(), title, layout: newSectionLayout, items: [] };
    patch({
      custom_sections: [...customSections, sec],
      section_order: [...settings.section_order, customKey(sec.id)],
      section_visibility: {
  ...settings.section_visibility,
  [customKey(sec.id)]: true,
} as typeof settings.section_visibility,
    });
    setOpen(prev => new Set(prev).add(customKey(sec.id)));
    setNewSectionTitle('');
  };

  const deleteCustomSection = (id: string) => {
    if (!window.confirm('Delete this section and everything in it?')) return;
    const k = customKey(id);
    const vis = { ...settings.section_visibility };
    delete vis[k];
    patch({
      custom_sections: customSections.filter(s => s.id !== id),
      section_order: settings.section_order.filter(x => x !== k),
      section_visibility: vis,
    });
  };

  /* ------------------------------ Rendering ------------------------------ */
  if (loading) return <div className="text-gray-400">Loading resume settings...</div>;

  const ds = settings.design_settings;
  const setDesign = (p: Partial<typeof ds>) => patch({ design_settings: { ...ds, ...p } });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 sticky top-0 z-30 bg-gray-50/90 dark:bg-slate-900/90 backdrop-blur py-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Everything you type here appears on your public resume.</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="flex items-center gap-2 text-error-500 text-sm font-medium max-w-xs">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-2 text-success-500 text-sm font-medium animate-fade-in">
              <CheckCircle size={16} /> Saved
            </span>
          )}
          {dirty && !saved && <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>}
          <Button onClick={handleSave} loading={saving}>
            {!saving && <Save size={18} />} Save Resume
          </Button>
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal imageUrl={cropSrc} shape={ds.imageShape} busy={uploading} onConfirm={uploadCropped} onClose={() => setCropSrc(null)} />
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ============================ EDITOR ============================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* 1. Basic info */}
          <Panel title="Basic Information" icon="👤" open={open.has('basic')} onToggle={() => toggle('basic')}>
            <div className="flex gap-4 items-center">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 shrink-0 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 cursor-pointer flex items-center justify-center hover:border-primary-500 transition-colors overflow-hidden"
              >
                {settings.profile_image_url ? (
                  <img src={settings.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={24} className="text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Square (1:1) · JPG, PNG or WebP · max 5MB</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload</Button>
                  {settings.profile_image_url && (
                    <Button variant="secondary" size="sm" onClick={removeImage} className="text-error-500"><Trash2 size={14} /> Remove</Button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickImage} className="hidden" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Full Name</Label>
                <Input value={settings.full_name} onChange={e => patch({ full_name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <Label>Professional Title</Label>
                <Input value={settings.professional_title} onChange={e => patch({ professional_title: e.target.value })} placeholder="e.g., Full-Stack Developer" />
              </div>
            </div>
            <div>
              <Label>Professional Summary (About Me)</Label>
              <Textarea value={settings.professional_summary} onChange={e => patch({ professional_summary: e.target.value })} placeholder="Brief professional summary..." className="min-h-[110px]" />
            </div>
          </Panel>

          {/* 2. Personal details */}
          <Panel title="Personal Details" icon="📋" open={open.has('personal')} onToggle={() => toggle('personal')}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Date of Birth</Label>
                <Input
  type="text"
  value={
    settings.date_of_birth
      ? settings.date_of_birth.split('-').reverse().join('/')
      : ''
  }
  placeholder="DD/MM/YYYY"
  maxLength={10}
  inputMode="numeric"
  onChange={e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted =
      digits.length > 4
        ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
        : digits.length > 2
          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
          : digits;

    const [day, month, year] = formatted.split('/');
    const isoDate =
      digits.length === 8
        ? `${year}-${month}-${day}`
        : '';

    patch({ date_of_birth: isoDate || formatted });
  }}
/>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={settings.email} onChange={e => patch({ email: e.target.value })} placeholder="you@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={settings.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+91 ..." />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={settings.location} onChange={e => patch({ location: e.target.value })} placeholder="City, State, Country" />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={settings.linkedin_url || ''} onChange={e => patch({ linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input value={settings.github_url || ''} onChange={e => patch({ github_url: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div className="sm:col-span-2">
                <Label>Portfolio Website</Label>
                <Input value={settings.website || ''} onChange={e => patch({ website: e.target.value })} placeholder="https://yoursite.com" />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">Extra details</p>
                  <p className="text-xs text-gray-500">Add any other detail — Nationality, Gender, Marital Status, Father's Name, Passport, Languages Known…</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setList('custom_fields', [...customFields, { id: uid(), label: '', value: '', enabled: true }])}>
                  <Plus size={14} /> Add detail
                </Button>
              </div>
              <div className="space-y-2">
                {customFields.map((f, i) => (
                  <div key={f.id} className="flex gap-2 items-center">
                    <Input value={f.label} onChange={e => setList('custom_fields', customFields.map(x => (x.id === f.id ? { ...x, label: e.target.value } : x)))} placeholder="Label (e.g., Nationality)" />
                    <Input value={f.value} onChange={e => setList('custom_fields', customFields.map(x => (x.id === f.id ? { ...x, value: e.target.value } : x)))} placeholder="Value" />
                    <RowActions
                      index={i} count={customFields.length} enabled={f.enabled}
                      onToggle={v => setList('custom_fields', customFields.map(x => (x.id === f.id ? { ...x, enabled: v } : x)))}
                      onMove={d => setList('custom_fields', moveInArray(customFields, i, d))}
                      onRemove={() => setList('custom_fields', customFields.filter(x => x.id !== f.id))}
                    />
                  </div>
                ))}
                {customFields.length === 0 && <p className="text-xs text-gray-400">No extra details yet.</p>}
              </div>
            </div>
          </Panel>

          {/* 3. Built-in list sections, generated from config */}
          {Object.values(ITEM_SECTIONS).map(def => {
            const list = listOf(def.key);
            return (
              <Panel
                key={def.key}
                title={`${def.label}${list.length ? ` (${list.length})` : ''}`}
                icon={def.icon}
                open={open.has(def.key)}
                onToggle={() => toggle(def.key)}
                actions={
                  <Button variant="secondary" size="sm" onClick={() => { setList(def.key, [...list, { ...def.newItem, id: uid() }]); setOpen(p => new Set(p).add(def.key)); }}>
                    <Plus size={14} /> Add
                  </Button>
                }
              >
                {list.length === 0 && <p className="text-sm text-gray-400">Nothing here yet. Click “Add”.</p>}
                {list.map((item, i) => (
                  <div key={item.id} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">#{i + 1}</span>
                      <RowActions
                        index={i} count={list.length} enabled={item.enabled !== false}
                        onToggle={v => setList(def.key, list.map(x => (x.id === item.id ? { ...x, enabled: v } : x)))}
                        onMove={d => setList(def.key, moveInArray(list, i, d))}
                        onDuplicate={() => { const c = [...list]; c.splice(i + 1, 0, { ...item, id: uid() }); setList(def.key, c); }}
                        onRemove={() => setList(def.key, list.filter(x => x.id !== item.id))}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {def.fields.map(f => (
                        <FieldInput key={f.key} def={f} value={item[f.key]} onChange={v => setList(def.key, list.map(x => (x.id === item.id ? { ...x, [f.key]: v } : x)))} />
                      ))}
                    </div>
                  </div>
                ))}
              </Panel>
            );
          })}

          {/* 4. Custom sections */}
          {customSections.map(sec => {
            const k = customKey(sec.id);
            return (
              <Panel
                key={sec.id}
                title={sec.title || 'Untitled section'}
                icon="✨"
                open={open.has(k)}
                onToggle={() => toggle(k)}
                actions={
                  <>
                    <Button variant="secondary" size="sm" onClick={() => { updateCustom(sec.id, { items: [...sec.items, { id: uid(), title: '', subtitle: '', date: '', description: '', enabled: true }] }); setOpen(p => new Set(p).add(k)); }}>
                      <Plus size={14} /> Add
                    </Button>
                    <button onClick={() => deleteCustomSection(sec.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete section"><Trash2 size={16} /></button>
                  </>
                }
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Section Title</Label>
                    <Input value={sec.title} onChange={e => updateCustom(sec.id, { title: e.target.value })} placeholder="e.g., Achievements, Awards, Volunteering" />
                  </div>
                  <div>
                    <Label>Display Style</Label>
                    <select value={sec.layout} onChange={e => updateCustom(sec.id, { layout: e.target.value as CustomLayout })} className="input-field w-full">
                      <option value="entries">Detailed entries (title, subtitle, date, description)</option>
                      <option value="bullets">Bullet list</option>
                      <option value="tags">Tags / chips</option>
                      <option value="text">Plain paragraphs</option>
                    </select>
                  </div>
                </div>
                {sec.items.map((it, i) => (
                  <div key={it.id} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">#{i + 1}</span>
                      <RowActions
                        index={i} count={sec.items.length} enabled={it.enabled}
                        onToggle={v => updateCustom(sec.id, { items: sec.items.map(x => (x.id === it.id ? { ...x, enabled: v } : x)) })}
                        onMove={d => updateCustom(sec.id, { items: moveInArray(sec.items, i, d) })}
                        onDuplicate={() => { const c = [...sec.items]; c.splice(i + 1, 0, { ...it, id: uid() }); updateCustom(sec.id, { items: c }); }}
                        onRemove={() => updateCustom(sec.id, { items: sec.items.filter(x => x.id !== it.id) })}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(
                        [
                          { key: 'title', label: 'Title' },
                          { key: 'subtitle', label: 'Subtitle / Organisation' },
                          { key: 'date', label: 'Date / Period' },
                          { key: 'description', label: 'Description', type: 'textarea', full: true },
                        ] as FieldDef[]
                      ).map(f => (
                        <FieldInput key={f.key} def={f} value={(it as any)[f.key]} onChange={v => updateCustom(sec.id, { items: sec.items.map(x => (x.id === it.id ? { ...x, [f.key]: v } : x)) })} />
                      ))}
                    </div>
                  </div>
                ))}
                {sec.items.length === 0 && <p className="text-sm text-gray-400">No entries yet. Click “Add”.</p>}
              </Panel>
            );
          })}

          {/* 5. Add a new section */}
          <Card className="border-dashed">
            <h3 className="font-semibold mb-1">➕ Add a New Section</h3>
            <p className="text-xs text-gray-500 mb-3">Need Awards, Volunteering, Publications, References…? Create it here — no code changes needed.</p>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <Input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="Section title" onKeyDown={e => e.key === 'Enter' && addCustomSection()} />
              </div>
              <select value={newSectionLayout} onChange={e => setNewSectionLayout(e.target.value as CustomLayout)} className="input-field">
                <option value="entries">Detailed entries</option>
                <option value="bullets">Bullet list</option>
                <option value="tags">Tags</option>
                <option value="text">Paragraphs</option>
              </select>
              <Button onClick={addCustomSection}><Plus size={16} /> Create Section</Button>
            </div>
          </Card>

          {/* 6. Section order & visibility */}
          <Panel title="Section Order & Visibility" icon="📍" open={open.has('order')} onToggle={() => toggle('order')}>
            <p className="text-xs text-gray-500">Choose which sections show and in what order they appear on the resume.</p>
            <div className="space-y-1">
              {settings.section_order.map((key, i) => (
                <div key={key} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <input
                    type="checkbox"
                    checked={!!(settings.section_visibility as Record<string, boolean>)[key]}
                    onChange={() => patch({
  section_visibility: {
    ...settings.section_visibility,
    [key]: !(settings.section_visibility as Record<string, boolean>)[key],
  } as typeof settings.section_visibility,
})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm flex-1">{sectionLabel(key, customSections)}{isCustomKey(key) && <span className="text-xs text-gray-400"> (custom)</span>}</span>
                  <button disabled={i === 0} onClick={() => patch({ section_order: moveInArray(settings.section_order, i, -1) })} className="p-1 text-gray-500 disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button disabled={i === settings.section_order.length - 1} onClick={() => patch({ section_order: moveInArray(settings.section_order, i, 1) })} className="p-1 text-gray-500 disabled:opacity-30"><ArrowDown size={14} /></button>
                </div>
              ))}
            </div>
          </Panel>

          {/* 7. Design */}
          <Panel title="Design" icon="🎨" open={open.has('design')} onToggle={() => toggle('design')}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Primary Colour</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={ds.primaryColor} onChange={e => setDesign({ primaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                  <Input value={ds.primaryColor} onChange={e => setDesign({ primaryColor: e.target.value })} placeholder="#3b82f6" />
                </div>
              </div>
              <div>
                <Label>Font</Label>
                <select value={ds.fontFamily} onChange={e => setDesign({ fontFamily: e.target.value as any })} className="input-field w-full">
                  <option value="inter">Inter</option>
                  <option value="georgia">Georgia</option>
                  <option value="monospace">Monospace</option>
                  <option value="poppins">Poppins</option>
                </select>
              </div>
              <div>
                <Label>Font Size ({ds.fontSize}px)</Label>
                <input type="range" min={12} max={18} step={1} value={ds.fontSize} onChange={e => setDesign({ fontSize: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <Label>Photo Shape</Label>
                <select value={ds.imageShape} onChange={e => setDesign({ imageShape: e.target.value as any })} className="input-field w-full">
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded Square</option>
                  <option value="square">Square</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Layout</Label>
                <select value={ds.layout} onChange={e => setDesign({ layout: e.target.value as any })} className="input-field w-full">
                  <option value="single">Single Column</option>
                  <option value="two-column">Two Column (details & skills in a sidebar)</option>
                </select>
              </div>
            </div>
          </Panel>
        </div>

        {/* =========================== LIVE PREVIEW =========================== */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 dark:text-slate-400">
              <Eye size={16} /> Live Preview <span className="text-xs font-normal">(exactly what the public resume shows)</span>
            </div>
            <div className="rounded-xl shadow-card border border-gray-200 dark:border-slate-700 p-5 bg-white max-h-[calc(100vh-9rem)] overflow-y-auto">
              <ResumeRenderer data={settings} preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}