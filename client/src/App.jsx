import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Learn from './pages/Learn';
import ArticleDetail from './pages/ArticleDetail';
import CarePublic from './pages/CarePublic';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';

// Authenticated Dashboard Pages
import Dashboard from './pages/Dashboard';
import MyJourney from './pages/MyJourney';
import TrackCycle from './pages/TrackCycle';
import Symptoms from './pages/Symptoms';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import LearnDashboard from './pages/LearnDashboard';
import CareDashboard from './pages/CareDashboard';
import MyGoals from './pages/MyGoals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import HealthTrends from './pages/HealthTrends';

// Public Layout Wrapper with Header & Footer
function PublicLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
      <Route path="/learn" element={<PublicLayout><Learn /></PublicLayout>} />
      <Route path="/learn/:slug" element={<PublicLayout><ArticleDetail /></PublicLayout>} />
      <Route path="/care" element={<PublicLayout><CarePublic /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/signin" element={<PublicLayout><SignIn /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
      <Route path="/onboarding" element={<PublicLayout><Onboarding /></PublicLayout>} />

      {/* Authenticated Dashboard Shell & Routes */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="journey" element={<MyJourney />} />
        <Route path="cycle" element={<TrackCycle />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="trends" element={<HealthTrends />} />
        <Route path="reports" element={<Reports />} />
        <Route path="insights" element={<Insights />} />
        <Route path="learn" element={<LearnDashboard />} />
        <Route path="care" element={<CareDashboard />} />
        <Route path="goals" element={<MyGoals />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="ai" element={<Navigate to="/app/assistant" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
