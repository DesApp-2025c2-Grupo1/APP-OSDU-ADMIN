import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { providersMock } from "../data/providers";
import { ViewAgendaPopup } from "../components/ViewAgendaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { AgendaTable } from "../components/AgendaTable";
import { ConfirmDeleteAgendaDialog } from "../components/ConfirmDeleteAgendaDialog";
import { EditAgendaPopup } from "../components/EditAgendaPopup";

export interface HorarioAgenda {
  id: string;
  prestador: string;
  especialidad: string;
  lugar: string;
  dias: string[];
  horario: string;
  duracion: number;
}

interface FiltrosAgenda {
  prestador: string;    
  especialidad: string; 
}

const PAGE_SIZE = 5;

const construirHorariosDesdeProviders = (): HorarioAgenda[] => {
  const diaMap: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
  };

  const horarios: HorarioAgenda[] = [];

  (providersMock as any[]).forEach((provider, indexPrestador) => {
    const direcciones = provider.direcciones || [];
    direcciones.forEach((dir: any, indexDireccion: number) => {
      const bloques = dir.horarios || [];
      bloques.forEach((bloque: any, indexBloque: number) => {
        const diasNumeros: number[] = Array.isArray(bloque.dias) ? bloque.dias : [];
        const diasLabels = diasNumeros
          .map((n) => diaMap[n] || `Día ${n}`)
          .filter(Boolean);

        horarios.push({
          id: `${provider.id ?? indexPrestador}-${indexDireccion}-${indexBloque}`,
          prestador: provider.nombreCompleto ?? "",
          especialidad: Array.isArray(provider.especialidades)
            ? provider.especialidades.join(", ")
            : "",
          lugar: `${dir.etiqueta ? dir.etiqueta + " - " : ""}${dir.calle ?? ""} ${
            dir.numero ?? ""
          }, ${dir.localidad ?? ""}`.trim(),
          dias: diasLabels,
          horario: `${bloque.desde ?? ""} - ${bloque.hasta ?? ""}`,
          duracion: 30,
        });
      });
    });
  });

  return horarios;
};

export function Agenda() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados principales
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [viewingAgenda, setViewingAgenda] = useState<HorarioAgenda | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<HorarioAgenda | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<HorarioAgenda | null>(null);

  // Búsqueda y filtros
  const [busquedaPrestador, setBusquedaPrestador] = useState("");
  const [mostrarDropdownPrestador, setMostrarDropdownPrestador] =
    useState(false);

  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    prestador: "",
    especialidad: "",
  });

  const [horarios, setHorarios] = useState<HorarioAgenda[]>(() =>
    construirHorariosDesdeProviders()
  );

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const state = location.state as { nuevaAgenda?: HorarioAgenda } | null;
    if (state?.nuevaAgenda) {
      setHorarios((prev) => [...prev, state.nuevaAgenda]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const prestadoresFiltrados = useMemo(() => {
    if (!busquedaPrestador.trim()) return providersMock;
    const busqueda = busquedaPrestador.toLowerCase();
    return providersMock.filter(
      (p: any) =>
        (p.nombreCompleto ?? "").toLowerCase().includes(busqueda) ||
        (p.tipo ?? "").toLowerCase().includes(busqueda)
    );
  }, [busquedaPrestador]);

  const prestadores = useMemo(() => {
    return (providersMock as any[]).map((provider) => ({
      id: provider.id as string,
      nombre: provider.nombreCompleto as string,
      tipo: provider.tipo as string,
      especialidades: (provider.especialidades as string[]) ?? [],
    }));
  }, []);


  const todasEspecialidades = useMemo(() => {
    const codigos = new Set<string>();

    (providersMock as any[]).forEach((p) => {
      (p.especialidades ?? []).forEach((code: string) => codigos.add(code));
    });

    return Array.from(codigos).map((code) => ({
      id: code,
      nombre: code.charAt(0).toUpperCase() + code.slice(1),
    }));
  }, []);

  // Horarios filtrados según prestador y/o especialidad
  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      if (filtros.prestador) {
        const prestadorSeleccionado = prestadores.find(
          (p) => p.id === filtros.prestador
        );
        if (prestadorSeleccionado && h.prestador !== prestadorSeleccionado.nombre) {
          return false;
        }
      }
      if (filtros.especialidad) {
        const codigo = filtros.especialidad.toLowerCase();
        if (!h.especialidad.toLowerCase().includes(codigo)) {
          return false;
        }
      }

      return true;
    });
  }, [horarios, filtros, prestadores]);
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

  const seleccionarPrestador = (prestadorId: string, nombreCompleto: string) => {
    setFiltros((prev) => ({
      ...prev,
      prestador: prestadorId,
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
  const toggleMenu = (id: string) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  const handleVerDetalle = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) {
      setViewingAgenda(agenda);
      setOpenViewPopup(true);
    }
    setMenuAbierto(null);
  };

  const handleEditarAgenda = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) setEditingAgenda(agenda);
    setMenuAbierto(null);
  };

  const handleSaveEditedAgenda = (updatedAgenda: HorarioAgenda) => {
    setHorarios((prev) =>
      prev.map((h) => (h.id === updatedAgenda.id ? updatedAgenda : h))
    );
    setEditingAgenda(null);
  };

  const handleEliminarAgenda = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) setAgendaToDelete(agenda);
    setMenuAbierto(null);
  };

  const confirmEliminarAgenda = () => {
    if (agendaToDelete) {
      setHorarios((prev) => prev.filter((h) => h.id !== agendaToDelete.id));
      setAgendaToDelete(null);
    }
  };

  const cancelEliminarAgenda = () => {
    setAgendaToDelete(null);
  };

  const handleAgregarAgenda = () => {
    navigate("/add-agenda");
  };

  // Helper para mostrar días ordenados
  const formatDias = (dias: string[]) => {
    const orden = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    if (
      dias.includes("Lunes") &&
      dias.includes("Martes") &&
      dias.includes("Miércoles") &&
      dias.includes("Jueves") &&
      dias.includes("Viernes")
    ) {
      return "Lun - Vie";
    }

    return dias
      .slice()
      .sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
      .join(", ");
  };

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
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              placeholder="Buscar prestador..."
            />
            {mostrarDropdownPrestador && busquedaPrestador && (
              <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-y-auto">
                {prestadoresFiltrados.map((p: any) => (
                  <li
                    key={p.id}
                    onClick={() =>
                      seleccionarPrestador(
                        p.id as string,
                        p.nombreCompleto as string
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {p.nombreCompleto}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Especialidad (global, no depende de prestador) */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">Especialidad</label>
            <select
              value={filtros.especialidad}
              onChange={(e) => handleFiltroChange("especialidad", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            >
              <option value="">Todas</option>
              {todasEspecialidades.map((especialidad) => (
                <option key={especialidad.id} value={especialidad.id}>
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

      {/* Tabla + paginado con estilo Home.tsx */}
      <div className="rounded-md shadow-sm border border-gray-200 overflow-hidden bg-white">
        <AgendaTable
          horarios={paginatedHorarios}
          menuAbierto={menuAbierto}
          toggleMenu={toggleMenu}
          handleEditarAgenda={handleEditarAgenda}
          handleVerDetalle={handleVerDetalle}
          handleEliminarAgenda={handleEliminarAgenda}
          formatDias={formatDias}
        />

        {/* Controles de paginación estilo "Página X de Y" */}
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
              className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${
                currentPageSafe === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              ◀
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPageSafe === totalPages}
              className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${
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

      {/* Popups */}
      {openViewPopup && viewingAgenda && (
        <ViewAgendaPopup
          agenda={viewingAgenda}
          onClose={() => setOpenViewPopup(false)}
        />
      )}

      <ConfirmDeleteAgendaDialog
        isOpen={!!agendaToDelete}
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
    </div>
  );
}
