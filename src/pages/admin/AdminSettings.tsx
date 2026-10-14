import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Save, CheckCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function AdminSettings() {
const [settingsId, setSettingsId] = useState<string | null>(null);
const [siteName, setSiteName] = useState('');
const [siteTitle, setSiteTitle] = useState('');
const [siteDescription, setSiteDescription] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [location, setLocation] = useState('');
const [resumeUrl, setResumeUrl] = useState('');
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);
const { theme, setTheme } = useTheme();
useEffect(() => {
  supabase
    .from('site_settings')
    .select('*')
    .maybeSingle()
    .then(({ data }) => {
      if (data) {
        setSettingsId(data.id);
        setSiteName(data.site_name || '');
        setSiteTitle(data.site_title || '');
        setSiteDescription(data.site_description || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setResumeUrl(data.resume_url || '');
      }
      setLoading(false);
    });
}, []);

const handleSave = async () => {
  setSaving(true);

  const payload = {
    site_name: siteName,
    site_title: siteTitle,
    site_description: siteDescription,
    email,
    phone,
    location,
    resume_url: resumeUrl,
    updated_at: new Date().toISOString(),
  };

  if (settingsId) {
  const { error } = await supabase
    .from('site_settings')
    .update(payload)
    .eq('id', settingsId);

  if (error) {
    console.error('Site settings update error:', error);
    alert(error.message);
    setSaving(false);
    return;
  }
}
else {
  const { error } = await supabase
    .from('site_settings')
    .insert(payload);

  if (error) {
    console.error('Site settings insert error:', error);
    alert(error.message);
    setSaving(false);
    return;
  }
}
 setSaving(false);
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
};
  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
  <h3 className="font-semibold mb-4">Site Information</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Site Name"
      value={siteName}
      onChange={(e) => setSiteName(e.target.value)}
      placeholder="Your Name"
    />

    <Input
      label="Site Title"
      value={siteTitle}
      onChange={(e) => setSiteTitle(e.target.value)}
      placeholder="Personal Portfolio"
    />

    <Input
      label="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="your@email.com"
    />

    <Input
      label="Phone"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="+91 XXXXX XXXXX"
    />

    <Input
      label="Location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
      placeholder="India"
    />

    <Input
      label="Resume URL"
      value={resumeUrl}
      onChange={(e) => setResumeUrl(e.target.value)}
      placeholder="https://..."
    />
  </div>

  <div className="mt-4">
    <Input
      label="Site Description"
      value={siteDescription}
      onChange={(e) => setSiteDescription(e.target.value)}
      placeholder="A short description about your portfolio"
    />
  </div>
</Card>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage site-wide settings</p>
        </div>
        {saved && (
          <span className="flex items-center gap-2 text-success-500 text-sm font-medium animate-fade-in">
            <CheckCircle size={16} /> Saved
          </span>
        )}
      </div>

      <Card>
        <h3 className="font-semibold mb-2">About This CMS</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          This portfolio uses Supabase for data storage. All public content (profile, projects, skills, education, experience, resume, media, settings) is readable by visitors. Only authenticated admin users can create, edit, and delete content. Contact form submissions are stored as messages.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Database', value: 'Supabase' },
            { label: 'Auth', value: 'Email/Password' },
            { label: 'Storage', value: 'PostgreSQL' },
            { label: 'Version', value: '1.0.0' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <p className="text-xs text-gray-400 dark:text-slate-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          {!saving && <Save size={18} />} Save Settings
        </Button>
      </div>
    </div>
  );
}
