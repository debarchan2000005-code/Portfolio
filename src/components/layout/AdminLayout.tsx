import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  GraduationCap,
  Briefcase,
  Wrench,
  FileText,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  MessageSquare,
  User,
  ExternalLink,
  Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Home', path: '/admin/home', icon: Home },
  { label: 'About', path: '/admin/about', icon: User },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Skills', path: '/admin/skills', icon: Wrench },
  { label: 'Experience', path: '/admin/experience', icon: Briefcase },
  { label: 'Education', path: '/admin/education', icon: GraduationCap },
  { label: 'Resume Builder', path: '/admin/resume', icon: FileText },
  { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20';

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-700">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white text-sm font-bold">
          DU
        </span>
        {sidebarOpen && (
          <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">Admin Panel</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={20} className="shrink-0" />
                  {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700 p-2 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
          title={!sidebarOpen ? 'View Site' : undefined}
        >
          <ExternalLink size={20} className="shrink-0" />
          {sidebarOpen && <span className="whitespace-nowrap">View Site</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-200"
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col ${sidebarWidth} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 fixed left-0 top-0 bottom-0 z-30`}
      >
        {sidebarContent}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 flex flex-col animate-slide-down">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
            {navItems.find((item) => isActive(item.path))?.label || 'Admin'}
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
