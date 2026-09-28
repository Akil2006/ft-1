import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewInspectionPage } from './pages/NewInspectionPage';
import { InspectionDetailsPage } from './pages/InspectionDetailsPage';
import { InspectionHistoryPage } from './pages/InspectionHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RegulatoryAssistantPage } from './pages/RegulatoryAssistantPage';
import { RulesPage } from './pages/RulesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminInspectionsPage } from './pages/AdminInspectionsPage';
import { authApi } from './services/auth';
import { User } from './types/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = authApi.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await authApi.getCurrentUser();
      setUser(u);
    } catch (err) {
      authApi.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route
          path="/"
          element={
            <Layout user={user} onLogout={() => setUser(null)} showSidebar={false}>
              <LandingPage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout user={user} onLogout={() => setUser(null)} showSidebar={false}>
              <LoginPage onLoginSuccess={fetchUser} />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout user={user} onLogout={() => setUser(null)} showSidebar={false}>
              <RegisterPage />
            </Layout>
          }
        />

        {/* Protected Dashboard & Inspection Routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/inspections/new"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <NewInspectionPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/inspections/:id"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <InspectionDetailsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/inspections"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <InspectionHistoryPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/analytics"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <AnalyticsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/regulatory"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <RegulatoryAssistantPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/rules"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <RulesPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                <SettingsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Dedicated Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            user ? (
              isAdmin ? (
                <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                  <AdminDashboardPage />
                </Layout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            user ? (
              isAdmin ? (
                <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                  <AdminUsersPage currentUser={user} />
                </Layout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/inspections"
          element={
            user ? (
              isAdmin ? (
                <Layout user={user} onLogout={() => setUser(null)} showSidebar={true}>
                  <AdminInspectionsPage />
                </Layout>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
