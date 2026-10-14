import { Link } from 'react-router-dom';
import { Linkedin, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export function Footer() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, []);

  const socials = [
    { icon: Mail, url: profile?.email ? `mailto:${profile.email}` : null, label: 'Email' },
    { icon: Phone, url: profile?.phone ? `tel:${profile.phone}` : null, label: 'Phone' },
    { icon: Linkedin, url: profile?.linkedin_url || null, label: 'LinkedIn' },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
      <div className="container-content px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <div className="flex items-center gap-3 font-bold text-lg text-gray-900 dark:text-white">
              <img
                src="/logo.png"
                alt="Debarchan Upadhaya"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain shrink-0"
              />
              <span>Debarchan Upadhayaya</span>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 max-w-xs">
              {profile?.tagline || 'Computer Science Student & Developer'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              <li><Link to="/" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">About</Link></li>
              <li><Link to="/projects" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Projects</Link></li>
              <li><Link to="/skills" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Skills</Link></li>
              <li><Link to="/experience" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Experience</Link></li>
              <li><Link to="/education" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Education</Link></li>
              <li><Link to="/resume" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Resume</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Connect
            </h3>
            <div className="flex flex-wrap gap-3">
              {socials.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-primary-500 hover:shadow-card-hover transition-all duration-200"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-5 text-center">
          <p className="text-sm text-gray-400 dark:text-slate-500">
            © 2026 Debarchan Upadhayaya. All rights reserved.
          </p>
          <p className="mt-1 text-xs sm:text-sm leading-5 text-gray-400 dark:text-slate-500">
            Designed &amp; Developed by Debarchan Upadhaya. Need a website for your business?{' '}
            <span className="whitespace-nowrap">
              Contact{' '}
              <a href="tel:+919395392986" className="hover:text-primary-500 transition-colors">
                +91 9395392986
              </a>
            </span>
            {' | '}
            <a href="mailto:debarchan2000005@gmail.com" className="break-all hover:text-primary-500 transition-colors">
              debarchan2000005@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
