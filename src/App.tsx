import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { Agenda } from "./pages/Agenda";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Prestadores } from "./pages/Providers";
import { Otros } from "./pages/Others";
import { AgregarAfiliado } from "./pages/AddAffiliate";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/prestadores" element={<Prestadores />} />
            <Route path="/otros" element={<Otros />} />
            <Route path="/home/agregarAfiliado" element={<AgregarAfiliado />} />
            <Route path="*" element={<div>404</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App
