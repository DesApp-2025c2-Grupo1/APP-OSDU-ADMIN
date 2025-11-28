import React, { useState } from "react";
import type { HorarioAgenda } from "../pages/Agenda";
import { updateAgenda } from "../api/agendaService";

interface FranjaHoraria {
  dias: string[];
  desde: string;
  hasta: string;
}

interface EditAgendaPopupProps {
  agenda: HorarioAgenda;
  onClose: () => void;
  onSave: (data: HorarioAgenda) => void;
}

export function EditAgendaPopup({ agenda, onClose, onSave }: EditAgendaPopupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mapear días abreviados a nombres completos
  const mapDiaToComplete = (dia: string): string => {
    const map: Record<string, string> = {
      "Lun": "Lunes",
      "Mar": "Martes",
      "Mié": "Miercoles",
      "Jue": "Jueves",
      "Vie": "Viernes",
      "Sáb": "Sabado",
      "Dom": "Domingo"
    };
    return map[dia] || dia;
  };

  // Inicializar franjas desde los bloques de la agenda
  const initialFranjas = agenda.bloques && agenda.bloques.length > 0
    ? agenda.bloques.map(bloque => ({
      dias: bloque.dias.map(mapDiaToComplete),
      desde: bloque.desde,
      hasta: bloque.hasta,
    }))
    : [{
      dias: agenda.dias.map(mapDiaToComplete),
      desde: agenda.horario.split(" - ")[0] || "",
      hasta: agenda.horario.split(" - ")[1] || "",
    }];

  const [formData, setFormData] = useState({
    duracion: agenda.duracion,
    franjas: initialFranjas as FranjaHoraria[],
  });

  const diasSemana = [
    { id: "Lunes", label: "Lun" },
    { id: "Martes", label: "Mar" },
    { id: "Miercoles", label: "Mié" },
    { id: "Jueves", label: "Jue" },
    { id: "Viernes", label: "Vie" },
    { id: "Sabado", label: "Sáb" },
  ];

  // ---------- Franjas horarias ----------
  const toggleDia = (franjaIdx: number, dia: string) => {
    const arr = [...formData.franjas];
    const esta = arr[franjaIdx].dias.includes(dia);
    arr[franjaIdx].dias = esta
      ? arr[franjaIdx].dias.filter((d) => d !== dia)
      : [...arr[franjaIdx].dias, dia];
    setFormData((prev) => ({ ...prev, franjas: arr }));
  };

  const setDesde = (franjaIdx: number, value: string) => {
    const arr = [...formData.franjas];
    arr[franjaIdx].desde = value;
    setFormData((prev) => ({ ...prev, franjas: arr }));
  };

  const setHasta = (franjaIdx: number, value: string) => {
    const arr = [...formData.franjas];
    arr[franjaIdx].hasta = value;
    setFormData((prev) => ({ ...prev, franjas: arr }));
  };

  const addFranja = () => {
    setFormData((prev) => ({
      ...prev,
      franjas: [...prev.franjas, { dias: [], desde: "", hasta: "" }],
    }));
  };

  const removeFranja = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      franjas:
        prev.franjas.length > 1
          ? prev.franjas.filter((_, i) => i !== idx)
          : prev.franjas,
    }));
  };

  const handleSave = async () => {
    // Validaciones
    if (formData.franjas.length === 0) {
      setError("Debe tener al menos una franja horaria");
      return;
    }

    const franjasValidas = formData.franjas.filter(f =>
      f.dias.length > 0 && f.desde && f.hasta
    );

    if (franjasValidas.length === 0) {
      setError("Debe configurar al menos una franja horaria con días y horarios válidos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        duracionTurno: formData.duracion,
        bloques: franjasValidas.map(f => ({
          dias: f.dias,
          desde: f.desde,
          hasta: f.hasta
        }))
      };

      await updateAgenda(agenda.id, payload);

      // Crear objeto actualizado para el estado local
      const updated: HorarioAgenda = {
        ...agenda,
        duracion: formData.duracion,
        bloques: franjasValidas,
      };

      onSave(updated);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la agenda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800 disabled:opacity-50"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Agenda</h1>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* DATOS DEL PRESTADOR (solo lectura) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos del prestador
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombre</label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                {agenda.prestador}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Especialidad</label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                {agenda.especialidad}
              </div>
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">
                Lugar de atención
              </label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                {agenda.lugar}
              </div>
            </div>
          </div>
        </div>

        {/* DEFINICIÓN DE TURNOS */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Definición de turnos
          </h2>

          {formData.franjas.map((f, idx) => (
            <div key={idx} className="mb-4 border rounded-lg p-3 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Días y horarios:</p>

              <div className="flex gap-2 flex-wrap mb-2">
                {diasSemana.map((d) => (
                  <label key={d.id} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={f.dias.includes(d.id)}
                      onChange={() => toggleDia(idx, d.id)}
                      disabled={loading}
                    />
                    {d.label}
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <input
                  type="time"
                  value={f.desde}
                  onChange={(e) => setDesde(idx, e.target.value)}
                  disabled={loading}
                  className="border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                />
                <input
                  type="time"
                  value={f.hasta}
                  onChange={(e) => setHasta(idx, e.target.value)}
                  disabled={loading}
                  className="border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50"
                />
              </div>

              {formData.franjas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFranja(idx)}
                  disabled={loading}
                  className="mt-2 text-red-500 font-semibold text-sm disabled:opacity-50"
                >
                  Eliminar franja
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFranja}
            disabled={loading}
            className="text-[#5FA92C] text-sm font-semibold disabled:opacity-50"
          >
            + Agregar franja horaria
          </button>

          <div className="mt-6">
            <label className="font-semibold mb-1 bg-gray-100 px-2 block">
              Duración del turno
            </label>
            <select
              value={formData.duracion}
              onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
              disabled={loading}
              className="p-2 border border-gray-300 rounded disabled:opacity-50"
            >
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}