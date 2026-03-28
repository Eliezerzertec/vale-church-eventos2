import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";

import AboutPage from "./pages/AboutPage";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminPayments from "./pages/AdminPayments";
import AdminProfile from "./pages/AdminProfile";
import AdminReports from "./pages/AdminReports";
import AdminCoupons from "./pages/AdminCoupons";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import AuditionsPage from "./pages/AuditionsPage";
import AdminAuditions from "./pages/AdminAuditions";
import WebhookMonitor from "./pages/WebhookMonitor";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />

          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/audicoes" element={<AuditionsPage />} />
          <Route path="/webhook" element={<WebhookMonitor />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="eventos" element={<AdminEvents />} />
            <Route path="inscricoes" element={<AdminRegistrations />} />
            <Route path="pagamentos" element={<AdminPayments />} />
<Route path="cupons" element={<AdminCoupons />} />
            <Route path="perfil" element={<AdminProfile />} />
            <Route path="configuracoes" element={<AdminPage />} />
            <Route path="relatorios" element={<AdminReports />} />
            <Route path="audicoes" element={<AdminAuditions />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

