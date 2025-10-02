import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { Agenda } from "./pages/Agenda";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Prestadores } from "./pages/Providers";
import { Otros } from "./pages/Others";
import { AgregarAfiliado } from "./pages/AddAffiliate";
import { GrupoFamiliar } from "./pages/GrupoFamiliar";

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
            <Route path="/otros" element={<Otros />} />

            {/* afiliados */}
            <Route path="/home/agregarAfiliado" element={<AgregarAfiliado />} />
            <Route path="/home/grupoFamiliar/:grupoId" element={<GrupoFamiliar />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
