import { Navigate, Route, Routes } from "react-router-dom";
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
import { PrestadoresPorCodigoPostal } from "./pages/Consulta_PrestadoresCodPostal";
import { AltasAfiliadosPeriodo } from "./pages/Consulta_AfiliadosPeriodo";
import { AltasPrestadoresPeriodo } from "./pages/Consulta_PrestadoresPeriodo";
import { PrestadoresSinAgendas } from "./pages/Consulta_PrestadoresNoAgenda";
import { PrestadoresPorEspecialidad } from "./pages/Consulta_PrestadoresEspecialidad";
import { SituacionesPorAfiliado } from "./pages/Consulta_AfiliadosSituaciones";
import { SituacionesPorGrupo } from "./pages/Consulta_GrupoFamiliarSituaciones";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="p-6 flex-1">
          <Routes>
            {/* redirección inicial */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* páginas principales */}
            <Route path="/home" element={<Home />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/prestadores" element={<Prestadores />} />
            <Route path="/consultas" element={<Consultas />} />

            {/* afiliados */}
            <Route path="/home/agregarAfiliado" element={<AddAffiliate />} />
            <Route path="/home/grupoFamiliar/:dni" element={<GrupoFamiliar />} />

            {/* Prestadores */}
            <Route path="/prestadores/agregarPrestador" element={<AddProvider />} />

            {/* Nueva ruta para agregar agenda */}
            <Route path="/agenda/nueva" element={<AddAgendaPage />} />

            {/* Otras consultas */}
            <Route path="/consultas/altas-afiliados" element={<AltasAfiliadosPeriodo />} />
            <Route path="/consultas/altas-prestadores" element={<AltasPrestadoresPeriodo />} />
            <Route path="/consultas/prestadores-por-especialidad" element={<PrestadoresPorEspecialidad />} />
            <Route path="/consultas/prestadores-por-cp" element={<PrestadoresPorCodigoPostal />} />
            <Route path="/consultas/situaciones-por-afiliado" element={<SituacionesPorAfiliado />} />
            <Route path="/consultas/situaciones-por-grupo" element={<SituacionesPorGrupo />} />
            <Route path="/consultas/prestadores-sin-agendas" element={<PrestadoresSinAgendas/>} />
            
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
