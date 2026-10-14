import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FullPageLoader } from '@/components/ui/Loading';
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { Projects } from '@/pages/public/Projects';
import { Skills } from '@/pages/public/Skills';
import { EducationPage } from '@/pages/public/Education';
import { ExperiencePage } from '@/pages/public/Experience';
import { ResumePage } from '@/pages/public/Resume';
import { Contact } from '@/pages/public/Contact';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AdminSkills } from '@/pages/admin/AdminSkills';
import { AdminExperience } from '@/pages/admin/AdminExperience';
import { AdminEducation } from '@/pages/admin/AdminEducation';
import { AdminHome } from '@/pages/admin/AdminHome';
import { AdminAbout } from '@/pages/admin/AdminAbout';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminMedia } from '@/pages/admin/AdminMedia';
import { AdminResumeBuilder } from '@/pages/admin/AdminResumeBuilder';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/admin/login" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
      <Route path="/skills" element={<PublicLayout><Skills /></PublicLayout>} />
      <Route path="/education" element={<PublicLayout><EducationPage /></PublicLayout>} />
      <Route path="/experience" element={<PublicLayout><ExperiencePage /></PublicLayout>} />
      <Route path="/resume" element={<PublicLayout><ResumePage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/home" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
      <Route path="/admin/about" element={<ProtectedRoute><AdminAbout /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute><AdminSkills /></ProtectedRoute>} />
      <Route path="/admin/experience" element={<ProtectedRoute><AdminExperience /></ProtectedRoute>} />
      <Route path="/admin/education" element={<ProtectedRoute><AdminEducation /></ProtectedRoute>} />
      <Route path="/admin/resume" element={<ProtectedRoute><AdminResumeBuilder /></ProtectedRoute>} />
      <Route path="/admin/media" element={<ProtectedRoute><AdminMedia /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
