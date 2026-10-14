export interface Profile {
  id: string;
  name: string;
  tagline: string;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
}

export interface ProfileImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years?: number;
  description?: string;
  icon?: string;
  featured: boolean;
  enabled: boolean;
  order: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  enabled: boolean;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  field?: string;
  startDate: string;
  endDate: string;
  description?: string;
  logo?: string;
  enabled: boolean;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string;
  enabled: boolean;
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  enabled: boolean;
  order: number;
}

export interface Hobby {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  order: number;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Beginner';
  proficiencyPercent?: number;
  enabled: boolean;
  order: number;
}

export interface DesignSettings {
  primaryColor: string;
  fontFamily: 'inter' | 'georgia' | 'monospace' | 'poppins';
  fontSize: number;
  imageShape: 'circle' | 'rounded' | 'square';
  layout: 'single' | 'two-column';
}

export interface SectionVisibility {
  profile: boolean;
  about: boolean;
  personal_details: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  hobbies: boolean;
  languages: boolean;
}

export interface ResumeSettings {
  id: string;
  full_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  professional_summary: string;

  profile_image_url?: string;
  profile_image_crop?: ProfileImageCrop;

  skills: Skill[];
  hobbies: Hobby[];
  languages: Language[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];

  section_order: string[];
  section_visibility: SectionVisibility;
  design_settings: DesignSettings;

  show_education: boolean;
  show_experience: boolean;
  show_skills: boolean;
  show_projects: boolean;
  show_certifications: boolean;
  show_achievements: boolean;

  created_at: string;
  updated_at: string;
}
