import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ViewAgendaPopup } from "../components/ViewAgendaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { AgendaTable } from "../components/AgendaTable";
import { ConfirmDeleteAgendaDialog } from "../components/ConfirmDeleteAgendaDialog";
import { EditAgendaPopup } from "../components/EditAgendaPopup";
import { fetchAgendas, deleteAgenda, type AgendaResponse } from "../api/agendaService";
import { fetchProviders } from "../api/providerService";
import { fetchSpecialties } from "../api/specialtyService";

export interface HorarioAgenda {
  id: string;
  prestador: string;
  cuitCuil: string;
  especialidad: string;
  idEspecialidad: number;
  lugar: string;
  idLugar: number;
  dias: string[];
  horario: string;
  duracion: number;
  bloques?: {
    dias: string[];
    desde: string;
    hasta: string;
  }[];
}

interface FiltrosAgenda {
  prestador: string;
  especialidad: string;
}

const PAGE_SIZE = 5;

// Toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
    {message}
    <button className="ml-3 font-bold text-white" onClick={onClose}>×</button>
  </div>
);

export function Agenda() {
  const navigate = useNavigate();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<HorarioAgenda[]>([]);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);

  // Popups
  const [viewingAgenda, setViewingAgenda] = useState<HorarioAgenda | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<HorarioAgenda | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<HorarioAgenda | null>(null);

  // Búsqueda y filtros
  const [busquedaPrestador, setBusquedaPrestador] = useState("");
  const [mostrarDropdownPrestador, setMostrarDropdownPrestador] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    prestador: "",
    especialidad: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar agendas, prestadores y especialidades en paralelo
      const [agendasData, prestadoresData, especialidadesData] = await Promise.all([
        fetchAgendas(),
        fetchProviders(),
        fetchSpecialties()
      ]);

      // Mapear agendas al formato del componente
      const agendasMapeadas = agendasData.map((agenda: AgendaResponse) => ({
        id: agenda.id,
        prestador: agenda.prestador,
        cuitCuil: agenda.cuitCuil,
        especialidad: agenda.especialidad,
        idEspecialidad: agenda.idEspecialidad,
        lugar: agenda.lugar,
        idLugar: agenda.idLugar,
        dias: agenda.dias,
        horario: agenda.horario,
        duracion: agenda.duracion,
        bloques: agenda.bloques
      }));

      setHorarios(agendasMapeadas);
      setPrestadores(prestadoresData);
      setEspecialidades(especialidadesData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar las agendas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const prestadoresFiltrados = useMemo(() => {
    if (!busquedaPrestador.trim()) return prestadores;
    const busqueda = busquedaPrestador.toLowerCase();
    return prestadores.filter(
      (p: any) =>
        (p.nombreCompleto ?? "").toLowerCase().includes(busqueda) ||
        (p.tipoPrestador ?? "").toLowerCase().includes(busqueda)
    );
  }, [busquedaPrestador, prestadores]);

  // Horarios filtrados según prestador y/o especialidad
  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      if (filtros.prestador) {
        if (h.cuitCuil !== filtros.prestador) {
          return false;
        }
      }
      if (filtros.especialidad) {
        if (h.idEspecialidad.toString() !== filtros.especialidad) {
          return false;
        }
      }
      return true;
    });
  }, [horarios, filtros]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtros, busquedaPrestador, horarios.length]);

  const totalPages = Math.max(1, Math.ceil(horariosFiltrados.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const paginatedHorarios = horariosFiltrados.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // Handlers de búsqueda
  const handleBusquedaPrestadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaPrestador(valor);
    setMostrarDropdownPrestador(true);
    if (!valor.trim()) {
      setFiltros((prev) => ({ ...prev, prestador: "" }));
    }
  };

  const seleccionarPrestador = (cuitCuil: string, nombreCompleto: string) => {
    setFiltros((prev) => ({
      ...prev,
      prestador: cuitCuil,
    }));
    setBusquedaPrestador(nombreCompleto);
    setMostrarDropdownPrestador(false);
  };

  // Filtros
  const handleFiltroChange = (campo: keyof FiltrosAgenda, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const buscarHorarios = () => {
    console.log("Buscando con filtros:", filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      prestador: "",
      especialidad: "",
    });
    setBusquedaPrestador("");
    setMostrarDropdownPrestador(false);
    setCurrentPage(1);
  };

  // Acciones menú
  const handleVerDetalle = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) {
      setViewingAgenda(agenda);
      setOpenViewPopup(true);
    }
  };

  const handleEditarAgenda = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) setEditingAgenda(agenda);
  };

  const handleSaveEditedAgenda = async (updatedAgenda: HorarioAgenda) => {
    try {
      // Recargar desde la API
      await loadData();
      setEditingAgenda(null);
      showToast("Agenda actualizada correctamente");
    } catch (err) {
      console.error("Error al actualizar agenda:", err);
      showToast("Error al actualizar la agenda");
    }
  };

  const handleEliminarAgenda = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) setAgendaToDelete(agenda);
  };

  const confirmEliminarAgenda = async () => {
    if (!agendaToDelete) return;

    try {
      await deleteAgenda(agendaToDelete.id);
      await loadData();
      setAgendaToDelete(null);
      showToast(`Agenda de ${agendaToDelete.prestador} eliminada correctamente`);
    } catch (err) {
      console.error("Error al eliminar agenda:", err);
      showToast("Error al eliminar la agenda");
    }
  };

  const cancelEliminarAgenda = () => {
    setAgendaToDelete(null);
  };

  const handleAgregarAgenda = () => {
    navigate("/agenda/nueva");
  };

  // Helper para mostrar días ordenados
  const formatDias = (dias: string[]) => {
    const orden = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    if (dias.includes("Lun") && dias.includes("Mar") && dias.includes("Mié") &&
      dias.includes("Jue") && dias.includes("Vie")) {
      return "Lun - Vie";
    }

    return dias
      .slice()
      .sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm font-medium">Cargando agendas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-6 border border-red-300 rounded-md bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <ButtonAddAffiliate text="Agregar Agenda" onClick={handleAgregarAgenda} />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Buscar horarios de atención
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Prestador */}
          <div className="relative flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">Prestador</label>
            <input
              type="text"
              value={busquedaPrestador}
              onChange={handleBusquedaPrestadorChange}
              onFocus={() => setMostrarDropdownPrestador(true)}
              onBlur={() => setTimeout(() => setMostrarDropdownPrestador(false), 200)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              placeholder="Buscar prestador..."
            />
            {mostrarDropdownPrestador && busquedaPrestador && (
              <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-y-auto">
                {prestadoresFiltrados.map((p: any) => (
                  <li
                    key={p.cuitCuil}
                    onClick={() => seleccionarPrestador(p.cuitCuil, p.nombreCompleto)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {p.nombreCompleto}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Especialidad */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">Especialidad</label>
            <select
              value={filtros.especialidad}
              onChange={(e) => handleFiltroChange("especialidad", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            >
              <option value="">Todas</option>
              {especialidades.map((especialidad: any) => (
                <option key={especialidad.idEspecialidad} value={especialidad.idEspecialidad}>
                  {especialidad.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={buscarHorarios}
            className="bg-[#5FA92C] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4c8c23] transition"
          >
            Buscar
          </button>
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla + paginado */}
      <div className="rounded-md shadow-sm border border-gray-200 overflow-hidden bg-white">
        <AgendaTable
          horarios={paginatedHorarios}
          menuAbierto={null}
          toggleMenu={() => { }}
          handleEditarAgenda={handleEditarAgenda}
          handleVerDetalle={handleVerDetalle}
          handleEliminarAgenda={handleEliminarAgenda}
          formatDias={formatDias}
        />

        {/* Controles de paginación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Página{" "}
            <span className="font-semibold">{currentPageSafe}</span> de{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPageSafe === 1}
              className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${currentPageSafe === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageSafe === totalPages}
              className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${currentPageSafe === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {openViewPopup && viewingAgenda && (
        <ViewAgendaPopup
          agenda={viewingAgenda}
          onClose={() => setOpenViewPopup(false)}
        />
      )}

      <ConfirmDeleteAgendaDialog
        open={!!agendaToDelete} 
        onClose={cancelEliminarAgenda}
        onConfirm={confirmEliminarAgenda}
        agenda={agendaToDelete}
      />

      {editingAgenda && (
        <EditAgendaPopup
          agenda={editingAgenda}
          onClose={() => setEditingAgenda(null)}
          onSave={handleSaveEditedAgenda}
        />
      )}

      {/* Toast visual */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}