import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Charities from "./pages/Charities";
import HowItWorks from "./pages/HowItWorks";
import Subscribe from "./pages/Subscribe";
import NotFound from "./pages/NotFound";

import AdminOverview from "./pages/admin/Overview";
import UsersPage from "./pages/admin/UsersPage";
import CharitiesPage from "./pages/admin/CharitiesPage";
import DrawsPage from "./pages/admin/DrawsPage";
import WinnersPage from "./pages/admin/WinnersPage";
import SettingsPage from "./pages/admin/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/charities" element={<Charities />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Admin panel with its own layout */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="charities" element={<CharitiesPage />} />
              <Route path="draws" element={<DrawsPage />} />
              <Route path="winners" element={<WinnersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
