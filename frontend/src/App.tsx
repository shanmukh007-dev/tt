import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/AppShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import Vehicles from "@/pages/Vehicles";
import Customers from "@/pages/Customers";
import CustomerPortal from "@/pages/CustomerPortal";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppShell require="staff"><Dashboard /></AppShell>} />
        <Route path="/services" element={<AppShell require="staff"><Services /></AppShell>} />
        <Route path="/vehicles" element={<AppShell require="staff"><Vehicles /></AppShell>} />
        <Route path="/customers" element={<AppShell require="staff"><Customers /></AppShell>} />
        <Route path="/customer-portal" element={<AppShell require="customer"><CustomerPortal /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
