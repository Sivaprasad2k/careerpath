import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import OpportunityListPage from '../features/opportunities/OpportunityListPage'
import CalendarPage from '../features/calendar/CalendarPage'
import NotificationListPage from '../features/notifications/NotificationListPage'
import TasksPrepPage from '../features/tasks/TasksPrepPage'
import AnalyticsPage from '../features/analytics/AnalyticsPage'
import DocumentsPage from '../features/documents/DocumentsPage'
import CareerTimelinePage from '../features/timeline/CareerTimelinePage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<DashboardPage />} />
          <Route path="opportunities"     element={<OpportunityListPage />} />
          <Route path="opportunities/:id" element={<OpportunityListPage />} />
          <Route path="calendar"         element={<CalendarPage />} />
          <Route path="notifications"    element={<NotificationListPage />} />
          <Route path="tasks"            element={<TasksPrepPage />} />
          <Route path="analytics"        element={<AnalyticsPage />} />
          <Route path="documents"        element={<DocumentsPage />} />
          <Route path="timeline"         element={<CareerTimelinePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}



