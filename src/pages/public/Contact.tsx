import { useEffect, useState } from 'react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function Contact() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [subjectMode, setSubjectMode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').maybeSingle().then(({ data }) => setProfile(data));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });

    setSubmitting(false);

    if (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } else {
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setSubjectMode('');
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="animate-fade-in">
      <Section title="Get in Touch" subtitle="Have a question or opportunity? I'd love to hear from you.">
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact info */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 group">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                        {profile.email}
                      </p>
                    </div>
                  </a>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-slate-500">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
              <h3 className="text-lg font-semibold mb-2">Open to Opportunities</h3>
              <p className="text-sm text-primary-50">
                I'm currently looking for internship and full-time roles in software development.
                Whether you have a question or just want to connect, my inbox is always open.
              </p>
            </Card>
          </div>

          {/* Contact form */}
          <Card>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-success-900/30 text-success-500 mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  Thanks for reaching out. I'll get back to you soon.
                </p>
                <Button variant="secondary" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Your name"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    Subject
                  </label>
                <select
  id="subject"
  name="subject"
  value={subjectMode}
  onChange={(e) => {
    const value = e.target.value;
    setSubjectMode(value);
    handleChange('subject', value === 'custom' ? '' : value);
  }}
  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-900 dark:text-white outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
>
  <option value="" disabled>
    Select a topic
  </option>

  <option value="Project Inquiry">Project Inquiry</option>
  <option value="Job / Internship Opportunity">
    Job / Internship Opportunity
  </option>
  <option value="Freelance Work">Freelance Work</option>
  <option value="Freelance Work">Project Inquiry</option>
  <option value="Freelance Work">Job/Internship Opportunity</option>
  <option value="Freelance Work">Freelance Work</option>
  <option value="Website Development">Website Development</option>
  <option value="Web Design / UI">Web Design/UI</option>
  <option value="E-Commerce Website">E-Commerce Website</option>
  <option value="Collaboration">Collaboration</option>
  <option value="Portfolio / Resume">Portfolio / Resume</option>
  <option value="Technical Question">Technical Question</option>
  <option value="Bug / Website Issue">Bug / Website Issue</option>
  <option value="Consultation">Consultation</option>
  <option value="General Question">General Question</option>
  <option value="custom">Write your own</option>
</select>
                 

                  {subjectMode === 'custom' && (
                    <div className="mt-3">
                      <Input
                        label="Your Subject"
                        name="customSubject"
                        value={form.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="Write your subject"
                      />
                    </div>
                  )}
                </div>
                <Textarea
                  label="Message"
                  name="message"
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  error={errors.message}
                  placeholder="Tell me more..."
                  required
                />
                {errors.submit && (
                  <p className="text-sm text-error-500 bg-error-50 dark:bg-error-900/20 rounded-lg px-4 py-2">
                    {errors.submit}
                  </p>
                )}
                <Button type="submit" loading={submitting} className="w-full">
                  {!submitting && <Send size={18} />} Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </Section>
    </div>
  );
}
