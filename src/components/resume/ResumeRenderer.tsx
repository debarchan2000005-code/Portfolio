// src/components/resume/ResumeRenderer.tsx
// ONE renderer used by both the public Resume page and the admin Live Preview.
// What you see in the admin preview is exactly what the public resume shows.

import type { ReactNode } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Globe, Cake, ExternalLink } from 'lucide-react';
import {
  ITEM_SECTIONS,
  SIDEBAR_KEYS,
  FONT_STACKS,
  customKey,
  isCustomKey,
  formatDate,
  type ResumeData,
  type SectionDef,
  type CustomSection,
} from '@/lib/resumeConfig';

const CHIP_SECTIONS = new Set(['skills', 'hobbies']);

const has = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== '';
const enabledItems = (arr?: any[]) => (arr || []).filter(i => i && i.enabled !== false);

/* ----------------------------- Small pieces ----------------------------- */

function Heading({ children, color, small }: { children: ReactNode; color: string; small?: boolean }) {
  return (
    <h2
      className={`font-bold uppercase tracking-wide border-b pb-1 mb-3 ${small ? 'text-[0.8em]' : 'text-[1.1em]'}`}
      style={{ color, borderColor: color }}
    >
      {children}
    </h2>
  );
}

function ExtLink({ href, children, color }: { href: string; children: ReactNode; color: string }) {
  const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color }}>
      {children}
    </a>
  );
}

function detailText(key: string, value: any) {
  if (!has(value)) return '';
  if (key === 'years') {
    const n = Number(value);
    return n > 0 ? `${n} yr${n === 1 ? '' : 's'}` : '';
  }
  return String(value);
}

/* --------------------------- Built-in item lists --------------------------- */

function renderItemSection(def: SectionDef, items: any[], color: string) {
  const r = def.render;
  const known = new Set(
    [r.title, r.subtitle, r.bodyKey, r.linkKey, ...(r.dateKeys || []), ...(r.detailKeys || [])].filter(Boolean) as string[]
  );
  // Safety net: any field you add to the config later but forget in `render`
  // is still printed ("Label: value") so typed text never goes missing.
  const extraFields = def.fields.filter(f => !known.has(f.key));

  const renderOne = (item: any) => {
    const dates = (r.dateKeys || []).map(k => item[k]).filter(has).join(' – ');
    const details = (r.detailKeys || []).map(k => detailText(k, item[k])).filter(Boolean);
    const extras = extraFields.filter(f => has(item[f.key]));
    return (
      <div key={item.id} className="break-inside-avoid">
        <div className="flex justify-between items-baseline gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-900">{item[r.title]}</h3>
          {dates && <span className="text-[0.85em] text-gray-500 whitespace-nowrap">{dates}</span>}
        </div>
        {has(r.subtitle && item[r.subtitle]) && (
          <p className="font-medium" style={{ color }}>
            {item[r.subtitle!]}
          </p>
        )}
        {details.length > 0 && <p className="text-[0.88em] text-gray-600">{details.join(' · ')}</p>}
        {extras.map(f => (
          <p key={f.key} className="text-[0.88em] text-gray-600">
            <span className="font-medium">{f.label}:</span> {item[f.key]}
          </p>
        ))}
        {r.linkKey && has(item[r.linkKey]) && (
          <p className="text-[0.88em] flex items-center gap-1">
            <ExternalLink size={12} />
            <ExtLink href={item[r.linkKey]} color={color}>
              {item[r.linkKey]}
            </ExtLink>
          </p>
        )}
        {r.bodyKey && has(item[r.bodyKey]) && (
          <p className="text-gray-700 whitespace-pre-wrap mt-1">{item[r.bodyKey]}</p>
        )}
      </div>
    );
  };

  // Compact "Name ........ detail" rows (e.g. languages)
  if (r.compact) {
    return (
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex justify-between gap-3">
            <span className="text-gray-900">{item[r.title]}</span>
            <span className="text-[0.88em] text-gray-500">{(r.detailKeys || []).map(k => detailText(k, item[k])).filter(Boolean).join(' · ')}</span>
          </div>
        ))}
      </div>
    );
  }

  // Chips (skills, hobbies); items with a description become small blocks
  if (CHIP_SECTIONS.has(def.key)) {
    const groups: Record<string, any[]> = {};
    items.forEach(it => {
      const g = r.groupBy ? (it[r.groupBy] || '').trim() : '';
      (groups[g] ||= []).push(it);
    });
    return (
      <div className="space-y-3">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group}>
            {group && <h3 className="font-semibold text-gray-700 text-[0.9em] mb-1">{group}</h3>}
            <div className="flex flex-wrap gap-1.5">
              {list.filter(i => !has(i[r.bodyKey || ''])).map(i => {
                const d = (r.detailKeys || []).map(k => detailText(k, i[k])).filter(Boolean).join(' · ');
                return (
                  <span key={i.id} className="inline-block rounded-md px-2 py-0.5 text-[0.88em] bg-gray-100 text-gray-800 border border-gray-200">
                    {i[r.title]}
                    {d && <span className="text-gray-500"> ({d})</span>}
                  </span>
                );
              })}
            </div>
            <div className="space-y-1.5 mt-1.5">{list.filter(i => has(i[r.bodyKey || ''])).map(renderOne)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="space-y-4">{items.map(renderOne)}</div>;
}

/* ------------------------------ Custom sections ------------------------------ */

function renderCustomSection(sec: CustomSection, color: string) {
  const items = enabledItems(sec.items).filter(i => has(i.title) || has(i.description) || has(i.subtitle));
  if (!items.length) return null;

  if (sec.layout === 'tags') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map(i => (
          <span key={i.id} className="inline-block rounded-md px-2 py-0.5 text-[0.88em] bg-gray-100 text-gray-800 border border-gray-200">
            {i.title}
            {has(i.description) && <span className="text-gray-500"> — {i.description}</span>}
          </span>
        ))}
      </div>
    );
  }
  if (sec.layout === 'bullets') {
    return (
      <ul className="list-disc pl-5 space-y-1 text-gray-700">
        {items.map(i => (
          <li key={i.id}>
            <span className="font-medium text-gray-900">{i.title}</span>
            {has(i.subtitle) && <span className="text-gray-600"> · {i.subtitle}</span>}
            {has(i.date) && <span className="text-gray-500"> ({i.date})</span>}
            {has(i.description) && <span> — {i.description}</span>}
          </li>
        ))}
      </ul>
    );
  }
  if (sec.layout === 'text') {
    return (
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id}>
            {has(i.title) && <p className="font-semibold text-gray-900">{i.title}</p>}
            {has(i.description) && <p className="text-gray-700 whitespace-pre-wrap">{i.description}</p>}
          </div>
        ))}
      </div>
    );
  }
  // entries
  return (
    <div className="space-y-4">
      {items.map(i => (
        <div key={i.id} className="break-inside-avoid">
          <div className="flex justify-between items-baseline gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900">{i.title}</h3>
            {has(i.date) && <span className="text-[0.85em] text-gray-500 whitespace-nowrap">{i.date}</span>}
          </div>
          {has(i.subtitle) && (
            <p className="font-medium" style={{ color }}>
              {i.subtitle}
            </p>
          )}
          {has(i.description) && <p className="text-gray-700 whitespace-pre-wrap mt-1">{i.description}</p>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Main component ------------------------------ */

export function ResumeRenderer({ data, preview = false }: { data: ResumeData; preview?: boolean }) {
  const ds = data.design_settings;
  const color = ds.primaryColor || '#3b82f6';
  const twoCol = ds.layout === 'two-column' && !preview;

  const imgClass =
    ds.imageShape === 'circle' ? 'rounded-full' : ds.imageShape === 'rounded' ? 'rounded-xl' : 'rounded-none';

  const visible = (k: string) => data.section_visibility?.[k] ?? false;

  /* Personal details: every typed value is listed here */
  const personalRows: { icon?: ReactNode; label: string; value: ReactNode }[] = [];
  if (has(data.date_of_birth))
    personalRows.push({ icon: <Cake size={13} />, label: 'Date of Birth', value: formatDate(data.date_of_birth) });
  if (has(data.location)) personalRows.push({ icon: <MapPin size={13} />, label: 'Location', value: data.location });
  if (has(data.website))
    personalRows.push({ icon: <Globe size={13} />, label: 'Website', value: <ExtLink href={data.website!} color={color}>{data.website}</ExtLink> });
  enabledItems(data.custom_fields as any[])
    .filter(f => has(f.label) || has(f.value))
    .forEach(f =>
      personalRows.push({
        label: f.label || 'Detail',
        value: /^https?:\/\//i.test(f.value) ? <ExtLink href={f.value} color={color}>{f.value}</ExtLink> : f.value,
      })
    );

  const renderBody = (key: string): ReactNode => {
    if (key === 'about') {
      if (!has(data.professional_summary)) return null;
      return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.professional_summary}</p>;
    }
    if (key === 'personal_details') {
      if (!personalRows.length) return null;
      return (
        <dl className={`grid gap-x-6 gap-y-2 ${twoCol ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {personalRows.map((r, i) => (
            <div key={i} className="min-w-0">
              <dt className="text-[0.78em] uppercase tracking-wide text-gray-500 flex items-center gap-1">
                {r.icon}
                {r.label}
              </dt>
              <dd className="text-gray-800 break-words">{r.value}</dd>
            </div>
          ))}
        </dl>
      );
    }
    if (isCustomKey(key)) {
      const sec = (data.custom_sections || []).find(s => customKey(s.id) === key);
      return sec ? renderCustomSection(sec, color) : null;
    }
    const def = ITEM_SECTIONS[key];
    if (def) {
      const items = enabledItems((data as any)[key]).filter(i => Object.values(i).some(v => typeof v === 'string' && v.trim() !== ''));
      return items.length ? renderItemSection(def, items, color) : null;
    }
    return null;
  };

  const titleFor = (key: string) => {
    if (key === 'about') return 'About Me';
    if (key === 'personal_details') return 'Personal Details';
    if (isCustomKey(key)) return (data.custom_sections || []).find(s => customKey(s.id) === key)?.title || '';
    return ITEM_SECTIONS[key]?.label || key;
  };

  const renderSection = (key: string) => {
    if (key === 'profile' || !visible(key)) return null;
    const body = renderBody(key);
    if (!body) return null;
    return (
      <section key={key} className="mb-6 break-inside-avoid-page">
        <Heading color={color} small={twoCol && SIDEBAR_KEYS.includes(key)}>
          {titleFor(key)}
        </Heading>
        {body}
      </section>
    );
  };

  const order = data.section_order || [];
  const header = visible('profile') && (
    <header className="text-center pb-5 mb-6 border-b-2" style={{ borderColor: color }}>
      {has(data.profile_image_url) && (
        <img
          src={data.profile_image_url}
          alt={data.full_name}
          className={`${preview ? 'w-20 h-20' : 'w-32 h-32'} mx-auto mb-3 object-cover shadow ${imgClass}`}
        />
      )}
      <h1 className={`${preview ? 'text-2xl' : 'text-4xl'} font-bold`} style={{ color }}>
        {data.full_name || 'Your Name'}
      </h1>
      {has(data.professional_title) && (
        <p className={`${preview ? 'text-base' : 'text-xl'} font-medium text-gray-600 mt-1`}>{data.professional_title}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-sm">
        {has(data.email) && (
          <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1.5 hover:underline break-all" style={{ color }}>
            <Mail size={14} /> <span>{data.email}</span>
          </a>
        )}
        {has(data.phone) && (
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-1.5 hover:underline" style={{ color }}>
            <Phone size={14} /> <span>{data.phone}</span>
          </a>
        )}
        {has(data.linkedin_url) && (
          <a href={/^https?:\/\//i.test(data.linkedin_url!) ? data.linkedin_url! : `https://${data.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline" style={{ color }}>
            <Linkedin size={14} /> <span>LinkedIn</span>
          </a>
        )}
        {has(data.github_url) && (
          <a href={/^https?:\/\//i.test(data.github_url!) ? data.github_url! : `https://${data.github_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline" style={{ color }}>
            <Github size={14} /> <span>GitHub</span>
          </a>
        )}
      </div>
    </header>
  );

  return (
    <div
      className="resume-paper bg-white text-gray-800 rounded-xl"
      style={{ fontFamily: FONT_STACKS[ds.fontFamily] || FONT_STACKS.inter, fontSize: `${preview ? Math.min(ds.fontSize, 13) : ds.fontSize}px` }}
    >
      {header}
      {twoCol ? (
        <div className="grid md:grid-cols-3 gap-8 print:grid-cols-3">
          <div className="md:col-span-2 print:col-span-2">
            {order.filter(k => k !== 'profile' && !SIDEBAR_KEYS.includes(k)).map(renderSection)}
          </div>
          <aside className="md:col-span-1 print:col-span-1 md:border-l md:pl-6 border-gray-200">
            {order.filter(k => SIDEBAR_KEYS.includes(k)).map(renderSection)}
          </aside>
        </div>
      ) : (
        order.map(renderSection)
      )}
    </div>
  );
}