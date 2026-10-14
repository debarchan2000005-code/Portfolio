import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Wrench,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ImageIcon,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Stats {
  projects: number;
  skills: number;
  experiences: number;
  education: number;
  messages: number;
  unreadMessages: number;
  media: number;
}

interface RecentMessage {
  id: string;
  name: string;
  subject: string | null;
  created_at: string;
  read: boolean;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);

  const loadDashboard = async () => {
    const [
      projectsResult,
      skillsResult,
      experienceResult,
      educationResult,
      messagesResult,
      unreadResult,
      mediaResult,
      recentMessagesResult,
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('experience').select('*', { count: 'exact', head: true }),
      supabase.from('education').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
      supabase.from('media').select('*', { count: 'exact', head: true }),
      supabase
        .from('contact_messages')
        .select('id,name,subject,created_at,read')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    setStats({
      projects: projectsResult.count || 0,
      skills: skillsResult.count || 0,
      experiences: experienceResult.count || 0,
      education: educationResult.count || 0,
      messages: messagesResult.count || 0,
      unreadMessages: unreadResult.count || 0,
      media: mediaResult.count || 0,
    });

    setRecentMessages(recentMessagesResult.data || []);
  };

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel('admin-dashboard-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    {
      label: 'Projects',
      value: stats?.projects ?? '—',
      icon: FolderKanban,
      link: '/admin/projects',
      color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/30',
    },
    {
      label: 'Skills',
      value: stats?.skills ?? '—',
      icon: Wrench,
      link: '/admin/skills',
      color: 'text-success-500 bg-success-50 dark:bg-success-900/30',
    },
    {
      label: 'Experience',
      value: stats?.experiences ?? '—',
      icon: Briefcase,
      link: '/admin/experience',
      color: 'text-warning-500 bg-warning-50 dark:bg-warning-900/30',
    },
    {
      label: 'Education',
      value: stats?.education ?? '—',
      icon: GraduationCap,
      link: '/admin/education',
      color: 'text-accent-500 bg-accent-50 dark:bg-accent-900/30',
    },
    {
      label: 'Messages',
      value: stats?.messages ?? '—',
      icon: MessageSquare,
      link: '/admin/messages',
      color: 'text-error-500 bg-error-50 dark:bg-error-900/30',
    },
    {
      label: 'Media Files',
      value: stats?.media ?? '—',
      icon: ImageIcon,
      link: '/admin/media',
      color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/30',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Welcome back
        </h2>
        <p className="text-gray-500 dark:text-slate-400">
          Here's an overview of your portfolio
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, link, color }) => (
          <Link key={label} to={link}>
            <Card className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {stats && stats.unreadMessages > 0 && (
        <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-900/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white">
              <MessageSquare size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                You have {stats.unreadMessages} unread{' '}
                {stats.unreadMessages === 1 ? 'message' : 'messages'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Check your inbox and respond to visitors
              </p>
            </div>
            <Link to="/admin/messages" className="shrink-0">
              <span className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                View all →
              </span>
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" />
            Recent Messages
          </h3>
          <Link
            to="/admin/messages"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            View all
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">
            No unread messages
          </p>
        ) : (
          <div className="space-y-2">
            {recentMessages.map((msg) => (
              <Link
                key={msg.id}
                to="/admin/messages"
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 text-sm font-medium">
                  {msg.name[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {msg.name}
                    </p>
                    <Badge variant="success" className="shrink-0">
                      New
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {msg.subject || '(no subject)'}
                  </p>
                </div>

                <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye size={20} className="text-primary-500" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Edit Profile', link: '/admin/profile' },
            { label: 'Add Project', link: '/admin/projects' },
            { label: 'Build Resume', link: '/admin/resume' },
            { label: 'Add Skill', link: '/admin/skills' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className="flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-500 transition-all"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
