import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { Agenda } from "./pages/Agenda";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Prestadores } from "./pages/Providers";
import { GrupoFamiliar } from "./pages/GrupoFamiliar";
import { AddProvider } from "./pages/AddProvider";
import { AddAgendaPage } from "./pages/AddAgenda";
import { AddAffiliate } from "./pages/AddAffiliate";
import { Consultas } from "./pages/Consulta";
import { Reintegros } from "./pages/Reintegros";
import { Solicitudes } from "./pages/Solicitudes";
import { PrestadoresPorCodigoPostal } from "./pages/Consulta_PrestadoresCodPostal";
import { AltasAfiliadosPeriodo } from "./pages/Consulta_AfiliadosPeriodo";
import { AltasPrestadoresPeriodo } from "./pages/Consulta_PrestadoresPeriodo";
import { PrestadoresSinAgendas } from "./pages/Consulta_PrestadoresNoAgenda";
import { PrestadoresPorEspecialidad } from "./pages/Consulta_PrestadoresEspecialidad";
import { SituacionesPorAfiliado } from "./pages/Consulta_AfiliadosSituaciones";
import { SituacionesPorGrupo } from "./pages/Consulta_GrupoFamiliarSituaciones";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FormStylePreview } from "./pages/FormStylePreview";

function ProtectedLayout() {
  const { isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <SessionLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="md:p-8 p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SessionLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      <div className="text-sm font-medium">Verificando sesión...</div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return <SessionLoader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />} />
      
      {/* Protected Routes directly under ProtectedLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/prestadores" element={<Prestadores />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="/reintegros" element={<Reintegros />} />
        <Route path="/form-preview" element={<FormStylePreview />} />

        {/* Affiliate routes */}
        <Route path="/home/agregarAfiliado" element={<AddAffiliate />} />
        <Route path="/home/grupoFamiliar/:dni" element={<GrupoFamiliar />} />

        {/* Provider routes */}
        <Route path="/prestadores/agregarPrestador" element={<AddProvider />} />

        {/* Agenda routes */}
        <Route path="/agenda/nueva" element={<AddAgendaPage />} />

        {/* Query/Report routes */}
        <Route path="/consultas/altas-afiliados" element={<AltasAfiliadosPeriodo />} />
        <Route path="/consultas/altas-prestadores" element={<AltasPrestadoresPeriodo />} />
        <Route path="/consultas/prestadores-por-especialidad" element={<PrestadoresPorEspecialidad />} />
        <Route path="/consultas/prestadores-por-cp" element={<PrestadoresPorCodigoPostal />} />
        <Route path="/consultas/situaciones-por-afiliado" element={<SituacionesPorAfiliado />} />
        <Route path="/consultas/situaciones-por-grupo" element={<SituacionesPorGrupo />} />
        <Route path="/consultas/prestadores-sin-agendas" element={<PrestadoresSinAgendas />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
