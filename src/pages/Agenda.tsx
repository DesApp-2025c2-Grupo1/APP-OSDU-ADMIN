import React, { useState, useMemo } from "react";
import { providersMock } from "../data/providers";
import { SPECIALTIES } from "../data/specialties";
import { AddAgenda } from "../pages/AddAgenda";
import { ViewAgendaPopup } from "../components/ViewAgendaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { AgendaTable } from "../components/AgendaTable";
import { ConfirmDeleteAgendaDialog } from "../components/ConfirmDeleteAgendaDialog";

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
  duracionTurno: number;
  dias: string[];
}

export function Agenda() {
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [viewingAgenda, setViewingAgenda] = useState<HorarioAgenda | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [agendaToDelete, setAgendaToDelete] = useState<HorarioAgenda | null>(null);

  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    prestador: "",
    especialidad: "",
    duracionTurno: 30,
    dias: [],
  });

  const [horarios, setHorarios] = useState<HorarioAgenda[]>([
    {
      id: "1",
      prestador: "Tito Merello",
      especialidad: "Cardiología",
      lugar: "Av. Vergara 1805",
      dias: ["Lunes"],
      horario: "08:00 - 12:00",
      duracion: 30,
    },
    {
      id: "2",
      prestador: "Juan Pérez",
      especialidad: "Pediatría",
      lugar: "San Martín 555",
      dias: ["Martes", "Jueves"],
      horario: "10:00 - 14:00",
      duracion: 20,
    },
  ]);

  const prestadores = useMemo(() => {
    return providersMock.map((provider) => ({
      id: provider.id,
      nombre: provider.nombreCompleto,
      tipo: provider.tipo,
      especialidades: provider.especialidades,
    }));
  }, []);

  const especialidadesPrestador = useMemo(() => {
    if (!filtros.prestador) return [];
    const prestadorSeleccionado = prestadores.find(
      (p) => p.id === filtros.prestador
    );
    if (!prestadorSeleccionado) return [];
    return prestadorSeleccionado.especialidades.map((espId) => {
      const especialidad = SPECIALTIES.find((s) => s.id === espId);
      return { id: espId, nombre: especialidad?.nombre || espId };
    });
  }, [filtros.prestador, prestadores]);

  const diasSemana = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ];


  const handleFiltroChange = (campo: keyof FiltrosAgenda, valor: any) => {
    if (campo === "prestador") {
      setFiltros((prev) => ({
        ...prev,
        prestador: valor,
        especialidad: "",
      }));
    } else {
      setFiltros((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  const handleDiaChange = (diaId: string) => {
    setFiltros((prev) => ({
      ...prev,
      dias: prev.dias.includes(diaId)
        ? prev.dias.filter((d) => d !== diaId)
        : [...prev.dias, diaId],
    }));
  };

  const buscarHorarios = () => {
    console.log("Buscando con filtros:", filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      prestador: "",
      especialidad: "",
      duracionTurno: 30,
      dias: [],
    });
  };

  const toggleMenu = (id: string) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  const handleEditarAgenda = (id: string) => {
    console.log("Editar agenda:", id);
    setMenuAbierto(null);
  };

  const handleVerDetalle = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) {
      setViewingAgenda(agenda);
      setOpenViewPopup(true);
    }
    setMenuAbierto(null);
  };

  const handleEliminarAgenda = (id: string) => {
    const agenda = horarios.find((h) => h.id === id);
    if (agenda) {
      setAgendaToDelete(agenda);
    }
    setMenuAbierto(null);
  };

  const confirmEliminarAgenda = () => {
    if (agendaToDelete) {
      console.log("Eliminar agenda:", agendaToDelete.id);
      setHorarios((prev) => prev.filter((h) => h.id !== agendaToDelete.id));
      setAgendaToDelete(null);
    }
  };

  const cancelEliminarAgenda = () => {
    setAgendaToDelete(null);
  };

  const handleAgregarAgenda = () => {
    setMostrarPopup(true);
  };

  const handleGuardarAgenda = (data: any) => {
    const prestador = providersMock.find((p) => p.id === data.prestadorId);
    const especialidad =
      SPECIALTIES.find((s) => s.id === data.especialidadId)?.nombre || "";

    const nuevaAgenda: HorarioAgenda = {
      id: crypto.randomUUID(),
      prestador: prestador ? prestador.nombreCompleto : "",
      especialidad,
      lugar: data.lugarAtencion,
      dias: data.dias.split(",").map((d: string) => d.trim()),
      horario: data.horario,
      duracion: parseInt(data.duracionTurno) || 0,
    };

    setHorarios((prev) => [...prev, nuevaAgenda]);
    setMostrarPopup(false);
  };

  const formatDias = (dias: string[]) => {
    if (
      dias.length === 5 &&
      dias.includes("Lunes") &&
      dias.includes("Martes") &&
      dias.includes("Miércoles") &&
      dias.includes("Jueves") &&
      dias.includes("Viernes")
    ) {
      return "Lun - Vie";
    }
    return dias.join(", ");
  };


  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <ButtonAddAffiliate text="Agregar Agenda" onClick={handleAgregarAgenda} />
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Prestador */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">Prestador</label>
            <select
              value={filtros.prestador}
              onChange={(e) => handleFiltroChange("prestador", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            >
              <option value="">Seleccionar</option>
              {prestadores.map((prestador) => (
                <option key={prestador.id} value={prestador.id}>
                  {prestador.nombre} ({prestador.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Especialidad */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">Especialidad</label>
            <select
              value={filtros.especialidad}
              onChange={(e) => handleFiltroChange("especialidad", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              disabled={!filtros.prestador}
            >
              <option value="">
                {filtros.prestador
                  ? "Seleccionar"
                  : "Seleccione un prestador primero"}
              </option>
              {especialidadesPrestador.map((especialidad) => (
                <option key={especialidad.id} value={especialidad.id}>
                  {especialidad.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Días */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">
              Días de la semana
            </label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <label key={dia.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={filtros.dias.includes(dia.id)}
                    onChange={() => handleDiaChange(dia.id)}
                    className="rounded border-gray-300 text-[#5FA92C] focus:ring-[#5FA92C]"
                  />
                  {dia.label}
                </label>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2 text-gray-700">
              Duración de turno (min)
            </label>
            <select
              value={filtros.duracionTurno}
              onChange={(e) =>
                handleFiltroChange("duracionTurno", parseInt(e.target.value))
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
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
            className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <AgendaTable
        horarios={horarios}
        menuAbierto={menuAbierto}
        toggleMenu={toggleMenu}
        handleEditarAgenda={handleEditarAgenda}
        handleVerDetalle={handleVerDetalle}
        handleEliminarAgenda={handleEliminarAgenda}
        formatDias={formatDias}
      />

      {/* Popup Nueva Agenda */}
      {mostrarPopup && (
        <AddAgenda onClose={() => setMostrarPopup(false)} onSave={handleGuardarAgenda} />
      )}

      {/* Popup Ver Detalle Agenda */}
      {openViewPopup && viewingAgenda && (
        <ViewAgendaPopup agenda={viewingAgenda} onClose={() => setOpenViewPopup(false)} />
      )}

      {/* Popup de Confirmación para Eliminar Agenda */}
      <ConfirmDeleteAgendaDialog
        open={agendaToDelete !== null}
        onClose={cancelEliminarAgenda}
        onConfirm={confirmEliminarAgenda}
        agenda={agendaToDelete}
      />
    </div>
  );
}