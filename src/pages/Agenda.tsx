import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ViewAgendaPopup } from "../components/ViewAgendaPopup";
import { AgendaTable } from "../components/AgendaTable";
import { ConfirmDeleteAgendaDialog } from "../components/ConfirmDeleteAgendaDialog";
import { EditAgendaPopup } from "../components/EditAgendaPopup";
import {
  fetchAgendas,
  deleteAgenda,
  type AgendaResponse,
} from "../api/agendaService";
import { fetchProviders } from "../api/providerService";
import { fetchSpecialties } from "../api/specialtyService";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useModalPresence } from "../context/ModalContext";

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
  <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
    {message}
    <button className="ml-3 font-bold text-white" onClick={onClose}>
      ×
    </button>
  </div>
);

export function Agenda() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<HorarioAgenda[]>([]);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);

  const [viewingAgenda, setViewingAgenda] = useState<HorarioAgenda | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<HorarioAgenda | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<HorarioAgenda | null>(null);

  useModalPresence(
    "agenda-modals",
    openViewPopup || Boolean(agendaToDelete) || Boolean(editingAgenda)
  );

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [agendasData, prestadoresData, especialidadesData] = await Promise.all([
        fetchAgendas(),
        fetchProviders(),
        fetchSpecialties(),
      ]);

      const agendasMapeadas: HorarioAgenda[] = agendasData.map(
        (agenda: AgendaResponse) => ({
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
          bloques: agenda.bloques,
        })
      );

      setHorarios(agendasMapeadas);
      setPrestadores(prestadoresData);
      setEspecialidades(especialidadesData);
    } catch (err) {
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

  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      if (filtros.prestador && h.cuitCuil !== filtros.prestador) return false;
      if (
        filtros.especialidad &&
        h.idEspecialidad.toString() !== filtros.especialidad
      )
        return false;
      return true;
    });
  }, [horarios, filtros]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtros, busquedaPrestador, horarios.length]);

  const totalPages = Math.max(1, Math.ceil(horariosFiltrados.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, horariosFiltrados.length);
  const paginatedHorarios = horariosFiltrados.slice(startIndex, endIndex);
  const total = horariosFiltrados.length;

  const handleBusquedaPrestadorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleFiltroChange = (campo: keyof FiltrosAgenda, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const buscarHorarios = () => {
    // Filtros aplicados automáticamente
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

  const handleVerDetalle = (agenda: HorarioAgenda) => {
    setViewingAgenda(agenda);
    setOpenViewPopup(true);
  };

  const handleEditarAgenda = (agenda: HorarioAgenda) => {
    setEditingAgenda(agenda);
  };

  const handleSaveEditedAgenda = async (_updatedAgenda: HorarioAgenda) => {
    try {
      await loadData();
      setEditingAgenda(null);
      showToast("Agenda actualizada correctamente");
    } catch (err) {
      showToast("Error al actualizar la agenda");
    }
  };

  const handleEliminarAgenda = (agenda: HorarioAgenda) => {
    setAgendaToDelete(agenda);
  };

  const confirmEliminarAgenda = async () => {
    if (!agendaToDelete) return;

    try {
      await deleteAgenda(agendaToDelete.id);
      await loadData();
      showToast(`Agenda de ${agendaToDelete.prestador} eliminada correctamente`);
      setAgendaToDelete(null);
    } catch (err) {
      showToast("Error al eliminar la agenda");
    }
  };

  const cancelEliminarAgenda = () => {
    setAgendaToDelete(null);
  };

  const handleAgregarAgenda = () => {
    navigate("/agenda/nueva");
  };

  const handleOptionClick = (
    action: string,
    agenda: HorarioAgenda
  ) => {
    switch (action) {
      case "Editar":
        handleEditarAgenda(agenda);
        break;
      case "Ver detalles":
        handleVerDetalle(agenda);
        break;
      case "Dar de baja":
        handleEliminarAgenda(agenda);
        break;
    }
  };

  const formatDias = (dias: string[]) => {
    const orden = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    if (
      dias.includes("Lun") &&
      dias.includes("Mar") &&
      dias.includes("Mié") &&
      dias.includes("Jue") &&
      dias.includes("Vie")
    ) {
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
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-600 text-sm font-medium">Cargando agendas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-rose-600 py-6 border border-rose-300 rounded-2xl bg-rose-50">
        {error}
      </div>
    );
  }

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-700 text-slate-800">Agendas</h1>
          <p className="text-xs text-slate-400">Gestión de horarios de atención</p>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-5">
        {/* Filtros Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-600 text-slate-800 mb-4">Buscar horarios de atención</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Prestador */}
              <div className="relative flex flex-col">
                <label className="text-xs font-600 text-slate-600 mb-1.5">Prestador</label>
                <input
                  type="text"
                  value={busquedaPrestador}
                  onChange={handleBusquedaPrestadorChange}
                  onFocus={() => setMostrarDropdownPrestador(true)}
                  onBlur={() => setTimeout(() => setMostrarDropdownPrestador(false), 200)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
                  placeholder="Buscar prestador..."
                />
                {mostrarDropdownPrestador && busquedaPrestador && (
                  <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow z-50 max-h-48 overflow-y-auto">
                    {prestadoresFiltrados.map((p: any) => (
                      <li
                        key={p.cuitCuil}
                        onClick={() =>
                          seleccionarPrestador(p.cuitCuil, p.nombreCompleto)
                        }
                        className="px-3 py-2.5 hover:bg-teal-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                      >
                        {p.nombreCompleto}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Especialidad */}
              <div className="flex flex-col">
                <label className="text-xs font-600 text-slate-600 mb-1.5">Especialidad</label>
                <select
                  value={filtros.especialidad}
                  onChange={(e) => handleFiltroChange("especialidad", e.target.value)}
                  className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 bg-white"
                >
                  <option value="">Todas</option>
                  {especialidades.map((especialidad: any) => (
                    <option
                      key={especialidad.idEspecialidad}
                      value={especialidad.idEspecialidad}
                    >
                      {especialidad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <button
                onClick={buscarHorarios}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 text-sm font-600 rounded-xl transition w-full sm:w-auto"
              >
                Buscar
              </button>
              <button
                onClick={limpiarFiltros}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 text-sm font-600 rounded-xl transition w-full sm:w-auto"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-500 text-slate-400">
              Mostrando {paginatedHorarios.length} de {total} horarios
            </div>
            <button
              onClick={handleAgregarAgenda}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors w-fit"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Agenda
            </button>
          </div>

          {/* Tabla de escritorio */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <AgendaTable
                horarios={paginatedHorarios}
                onOptionClick={handleOptionClick}
                formatDias={formatDias}
              />
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-500 text-slate-400">
                Página {currentPageSafe} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPageSafe === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <NavigateBeforeIcon fontSize="small" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPageSafe === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <NavigateNextIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden">
            {paginatedHorarios.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-slate-400">
                No hay horarios para mostrar.
              </div>
            )}

            <div className="divide-y divide-slate-50">
              {paginatedHorarios.map((h) => (
                <div
                  key={h.id}
                  className="px-4 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-slate-700">{h.prestador}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{h.cuitCuil}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="col-span-2">
                      <span className="text-slate-400 font-500">Especialidad</span>
                      <p className="text-slate-600 mt-0.5">{h.especialidad}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-500">Lugar</span>
                      <p className="text-slate-600 mt-0.5">{h.lugar}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-500">Días</span>
                      <p className="text-slate-600 mt-0.5">{formatDias(h.dias)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-500">Horario</span>
                      <p className="text-slate-600 mt-0.5">{h.horario}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleVerDetalle(h)}
                      className="text-xs font-500 text-slate-600 hover:text-slate-700 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditarAgenda(h)}
                      className="text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarAgenda(h)}
                      className="text-xs font-500 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Baja
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación Mobile */}
            {total > 0 && (
              <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs font-500 text-slate-400">
                  {total === 0 ? 0 : startIndex + 1}
                  –{endIndex} de {total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPageSafe === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <NavigateBeforeIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPageSafe === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <NavigateNextIcon fontSize="small" />
                  </button>
                </div>
              </div>
            )}
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

        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </main>
  );
}
