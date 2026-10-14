

import type { ResumeSettings } from '@/types';

/* ----------------------------- Types ----------------------------- */

export interface CustomField {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
}

export type CustomLayout = 'entries' | 'bullets' | 'tags' | 'text';

export interface CustomItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  enabled: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  layout: CustomLayout;
  items: CustomItem[];
}

// Extends your existing ResumeSettings type with the new fields.
export type ResumeData = Omit<ResumeSettings, 'section_visibility' | 'section_order'> & {
  section_visibility: Record<string, boolean>;
  section_order: string[];
  date_of_birth?: string | null;
  custom_fields?: CustomField[];
  custom_sections?: CustomSection[];
};

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'date';
  options?: string[];
  placeholder?: string;
  full?: boolean; // take the full row in the editor
}

export interface SectionDef {
  key: string;
  label: string;
  icon: string;
  itemLabel: string;
  fields: FieldDef[];
  newItem: Record<string, any>;
  render: {
    title: string;
    subtitle?: string;
    dateKeys?: string[];
    detailKeys?: string[];
    bodyKey?: string;
    linkKey?: string;
    groupBy?: string;
    compact?: boolean; // "Name ........ detail" rows
  };
}

/* ------------------------ Section definitions ------------------------ */

export const ITEM_SECTIONS: Record<string, SectionDef> = {
  experience: {
    key: 'experience',
    label: 'Experience',
    icon: '💼',
    itemLabel: 'experience',
    fields: [
      { key: 'role', label: 'Job Title', placeholder: 'e.g., Web Developer Intern' },
      { key: 'company', label: 'Company / Organisation', placeholder: 'Company name' },
      { key: 'period', label: 'Period', placeholder: 'Jan 2024 — Aug 2024' },
      { key: 'location', label: 'Location', placeholder: 'City, Country' },
      { key: 'description', label: 'Description', type: 'textarea', full: true, placeholder: 'What you did and achieved' },
    ],
    newItem: { role: '', company: '', period: '', location: '', description: '', enabled: true },
    render: {
      title: 'role',
      subtitle: 'company',
      dateKeys: ['period'],
      detailKeys: ['location'],
      bodyKey: 'description',
    },
  },
  education: {
    key: 'education',
    label: 'Education',
    icon: '🎓',
    itemLabel: 'education',
    fields: [
      { key: 'degree', label: 'Degree', placeholder: 'e.g., Bachelor of Computer Applications' },
      { key: 'institution', label: 'Institution', placeholder: 'University / College' },
      { key: 'field', label: 'Field of Study', placeholder: 'e.g., Computer Applications' },
      { key: 'grade', label: 'Grade / CGPA / Percentage', placeholder: 'e.g., 8.2 CGPA' },
      { key: 'startDate', label: 'Start', placeholder: '2023' },
      { key: 'endDate', label: 'End', placeholder: '2026 (or Present)' },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
    ],
    newItem: { degree: '', institution: '', field: '', grade: '', startDate: '', endDate: '', description: '', enabled: true },
    render: {
      title: 'degree',
      subtitle: 'institution',
      dateKeys: ['startDate', 'endDate'],
      detailKeys: ['field', 'grade'],
      bodyKey: 'description',
    },
  },
  skills: {
    key: 'skills',
    label: 'Skills',
    icon: '⚡',
    itemLabel: 'skill',
    fields: [
      { key: 'name', label: 'Skill', placeholder: 'e.g., React' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Frontend' },
      { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'years', label: 'Years of experience', type: 'number', placeholder: '0' },
      { key: 'description', label: 'Description (optional)', type: 'textarea', full: true },
    ],
    newItem: { name: '', category: '', level: 'Intermediate', years: '', description: '', featured: false, enabled: true },
    render: {
      title: 'name',
      detailKeys: ['level', 'years'],
      bodyKey: 'description',
    },
  },
  projects: {
    key: 'projects',
    label: 'Projects',
    icon: '🚀',
    itemLabel: 'project',
    fields: [
      { key: 'name', label: 'Project Name' },
      { key: 'tech', label: 'Technologies Used', placeholder: 'React, TypeScript, Supabase' },
      { key: 'link', label: 'Link (live / GitHub)', full: true, placeholder: 'https://...' },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
    ],
    newItem: { name: '', tech: '', link: '', description: '', enabled: true },
    render: {
      title: 'name',
      detailKeys: ['tech'],
      linkKey: 'link',
      bodyKey: 'description',
    },
  },
  certifications: {
    key: 'certifications',
    label: 'Certifications',
    icon: '🏅',
    itemLabel: 'certification',
    fields: [
      { key: 'name', label: 'Certification Name' },
      { key: 'issuer', label: 'Issuing Organisation' },
      { key: 'year', label: 'Year' },
      { key: 'link', label: 'Credential Link', placeholder: 'https://...' },
      { key: 'description', label: 'Description (optional)', type: 'textarea', full: true },
    ],
    newItem: { name: '', issuer: '', year: '', link: '', description: '', enabled: true },
    render: {
      title: 'name',
      subtitle: 'issuer',
      dateKeys: ['year'],
      linkKey: 'link',
      bodyKey: 'description',
    },
  },
  languages: {
    key: 'languages',
    label: 'Languages',
    icon: '🌍',
    itemLabel: 'language',
    fields: [
      { key: 'name', label: 'Language' },
      { key: 'proficiency', label: 'Proficiency', type: 'select', options: ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner'] },
    ],
    newItem: { name: '', proficiency: 'Intermediate', enabled: true },
    render: { title: 'name', detailKeys: ['proficiency'], compact: true },
  },
  hobbies: {
    key: 'hobbies',
    label: 'Hobbies & Interests',
    icon: '🎯',
    itemLabel: 'interest',
    fields: [
      { key: 'name', label: 'Hobby / Interest' },
      { key: 'description', label: 'Description (optional)', type: 'textarea', full: true },
    ],
    newItem: { name: '', description: '', enabled: true },
    render: { title: 'name', bodyKey: 'description' },
  },
};

/* ------------------------ Section order & labels ------------------------ */

export const CORE_SECTION_KEYS = [
  'profile',
  'about',
  'personal_details',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'hobbies',
] as const;

export const CORE_LABELS: Record<string, string> = {
  profile: 'Name & Photo (header)',
  about: 'About Me',
  personal_details: 'Personal Details',
  ...Object.fromEntries(Object.values(ITEM_SECTIONS).map(s => [s.key, s.label])),
};

export const SIDEBAR_KEYS = ['personal_details', 'skills', 'languages', 'hobbies', 'certifications'];

export const FONT_STACKS: Record<string, string> = {
  inter: "'Inter', system-ui, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  monospace: "ui-monospace, SFMono-Regular, Menlo, monospace",
  poppins: "'Poppins', system-ui, sans-serif",
};

export const customKey = (id: string) => `custom_${id}`;
export const isCustomKey = (k: string) => k.startsWith('custom_');
export const uid = () => crypto.randomUUID();

export function sectionLabel(key: string, customSections: CustomSection[] = []) {
  if (isCustomKey(key)) {
    const c = customSections.find(s => customKey(s.id) === key);
    return c?.title?.trim() || 'Untitled section';
  }
  return CORE_LABELS[key] ?? key;
}

/* ------------------------------ Defaults ------------------------------ */

export const emptyResumeSettings: ResumeData = {
  id: '',
  full_name: '',
  professional_title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin_url: '',
  github_url: '',
  professional_summary: '',
  date_of_birth: '',
  profile_image_url: undefined,
  profile_image_crop: undefined,
  skills: [],
  hobbies: [],
  languages: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  custom_fields: [],
  custom_sections: [],
  section_order: [...CORE_SECTION_KEYS],
  section_visibility: {
    profile: true,
    about: true,
    personal_details: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true,
    hobbies: false,
    languages: false,
  },
  design_settings: {
    primaryColor: '#3b82f6',
    fontFamily: 'inter',
    fontSize: 14,
    imageShape: 'circle',
    layout: 'single',
  },
  show_education: true,
  show_experience: true,
  show_skills: true,
  show_projects: true,
  show_certifications: true,
  show_achievements: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as ResumeData;

/**
 * Makes any row coming from the database safe to use:
 * fills missing fields/arrays, replaces nulls, and makes sure every section
 * (including custom ones) is present in section_order / section_visibility.
 */
export function normalizeSettings(raw: any): ResumeData {
  const base: any = { ...emptyResumeSettings, ...(raw || {}) };

  [
    'full_name', 'professional_title', 'email', 'phone', 'location', 'website',
    'linkedin_url', 'github_url', 'professional_summary', 'date_of_birth',
  ].forEach(k => {
    base[k] = base[k] ?? '';
  });

  ['skills', 'hobbies', 'languages', 'experience', 'education', 'projects', 'certifications', 'custom_fields', 'custom_sections']
    .forEach(k => {
      base[k] = Array.isArray(base[k]) ? base[k] : [];
    });

  base.custom_sections = base.custom_sections.map((c: any) => ({
    id: c.id || uid(),
    title: c.title ?? '',
    layout: c.layout || 'entries',
    items: Array.isArray(c.items) ? c.items : [],
  }));

  base.design_settings = { ...emptyResumeSettings.design_settings, ...(raw?.design_settings || {}) };
  base.section_visibility = { ...emptyResumeSettings.section_visibility, ...(raw?.section_visibility || {}) };

  const customKeys: string[] = base.custom_sections.map((c: CustomSection) => customKey(c.id));
  const valid = new Set<string>([...CORE_SECTION_KEYS, ...customKeys]);
  const order: string[] = (Array.isArray(raw?.section_order) ? raw.section_order : []).filter((k: string) => valid.has(k));
  [...CORE_SECTION_KEYS, ...customKeys].forEach(k => {
    if (!order.includes(k)) order.push(k);
  });
  base.section_order = order;

  customKeys.forEach(k => {
    if (base.section_visibility[k] === undefined) base.section_visibility[k] = true;
  });

  return base as ResumeData;
}

/* ------------------------------ Helpers ------------------------------ */

export function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function errMsg(e: unknown, fallback: string) {
  if (e && typeof e === 'object' && 'message' in e) return String((e as any).message);
  return fallback;
}