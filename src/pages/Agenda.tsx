import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ViewAgendaPopup } from "../components/ViewAgendaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
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

  const handleVerDetalle = (agenda: HorarioAgenda) => {
    setViewingAgenda(agenda);
    setOpenViewPopup(true);
  };

  const handleEditarAgenda = (agenda: HorarioAgenda) => {
    setEditingAgenda(agenda);
  };

  const handleSaveEditedAgenda = async (updatedAgenda: HorarioAgenda) => {
    try {
      await loadData();
      setEditingAgenda(null);
      showToast("Agenda actualizada correctamente");
    } catch (err) {
      console.error("Error al actualizar agenda:", err);
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

  const handleOptionClick = (
    action: "Editar" | "Ver detalles" | "Dar de baja",
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
          <div className="w-10 h-10 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin mb-3" />
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
        <h1 className="text-xl font-semibold text-gray-800">Horarios de Atención</h1>

        <div className="self-start md:self-auto">
          <ButtonAddAffiliate text="Agregar Agenda" onClick={handleAgregarAgenda} />
        </div>
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
                    onClick={() =>
                      seleccionarPrestador(p.cuitCuil, p.nombreCompleto)
                    }
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={buscarHorarios}
            className="bg-[#5FA92C] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4c8c23] transition w-full sm:w-auto"
          >
            Buscar
          </button>
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition w-full sm:w-auto"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* DESKTOP: tabla + paginado */}
      <div className="hidden md:block rounded-md shadow-sm border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <AgendaTable
            horarios={paginatedHorarios}
            onOptionClick={handleOptionClick}
            formatDias={formatDias}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
          <p className="text-gray-700">
            Página{" "}
            <span className="font-semibold">{currentPageSafe}</span> de{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPageSafe === 1}
              className={`w-8 h-8 flex items-center justify-center border rounded ${
                currentPageSafe === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageSafe === totalPages}
              className={`w-8 h-8 flex items-center justify-center border rounded ${
                currentPageSafe === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE: cards + paginado */}
      <div className="md:hidden space-y-3">
        <div className="grid grid-cols-1 gap-4">
          {paginatedHorarios.length === 0 && (
            <div className="text-center text-gray-500 py-6 border rounded-md bg-white">
              No hay horarios para mostrar.
            </div>
          )}

          {paginatedHorarios.map((h) => (
            <div
              key={h.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase">Prestador</div>
                <div className="font-semibold break-words">{h.prestador}</div>
                <div className="text-xs text-gray-500">{h.cuitCuil}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase">
                    Especialidad
                  </div>
                  <div>{h.especialidad}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase">Lugar</div>
                  <div>{h.lugar}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Días</div>
                  <div>{formatDias(h.dias)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Horario</div>
                  <div>{h.horario}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">
                    Duración
                  </div>
                  <div>{h.duracion} min</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleVerDetalle(h)}
                  className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Ver detalles
                </button>
                <button
                  onClick={() => handleEditarAgenda(h)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarAgenda(h)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Dar de baja
                </button>
              </div>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="bg-white px-4 py-3 mt-1 flex items-center justify-between gap-3 border border-gray-200 rounded">
            <span className="text-sm text-gray-700">
              {total === 0 ? 0 : startIndex + 1}
              –{endIndex} de {total} {currentPageSafe}/{totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPageSafe === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <NavigateBeforeIcon fontSize="small" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageSafe === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <NavigateNextIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

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
  );
}
