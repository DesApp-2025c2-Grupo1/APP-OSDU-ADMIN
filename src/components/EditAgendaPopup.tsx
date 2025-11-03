import React, { useState } from "react";
import type { HorarioAgenda } from "../pages/Agenda";

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
  const [formData, setFormData] = useState({
    prestador: agenda.prestador,
    especialidad: agenda.especialidad,
    lugar: agenda.lugar,
    duracion: agenda.duracion,
    franjas: [
      {
        dias: agenda.dias.length ? agenda.dias : [],
        desde: agenda.horario.split(" - ")[0] || "",
        hasta: agenda.horario.split(" - ")[1] || "",
      },
    ] as FranjaHoraria[],
  });

  const diasSemana = [
    { id: "Lun", label: "Lun" },
    { id: "Mar", label: "Mar" },
    { id: "Mié", label: "Mié" },
    { id: "Jue", label: "Jue" },
    { id: "Vie", label: "Vie" },
    { id: "Sáb", label: "Sáb" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duracion" ? parseInt(value) : value,
    }));
  };

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

  const handleSave = () => {
    const primeraFranja = formData.franjas[0];
    const updated: HorarioAgenda = {
      ...agenda,
      prestador: formData.prestador,
      especialidad: formData.especialidad,
      lugar: formData.lugar,
      dias: primeraFranja.dias,
      horario: `${primeraFranja.desde} - ${primeraFranja.hasta}`,
      duracion: formData.duracion,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Agenda</h1>

        {/* DATOS DEL PRESTADOR */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos del prestador
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombre</label>
              <input
                type="text"
                name="prestador"
                value={formData.prestador}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Especialidad</label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">
                Lugar de atención
              </label>
              <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
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
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="time"
                  value={f.hasta}
                  onChange={(e) => setHasta(idx, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {formData.franjas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFranja(idx)}
                  className="mt-2 text-red-500 font-semibold text-sm"
                >
                  Eliminar franja
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addFranja}
            className="text-[#5FA92C] text-sm font-semibold"
          >
            + Agregar franja horaria
          </button>

          <div className="mt-6">
            <label className="font-semibold mb-1 bg-gray-100 px-2 block">
              Duración del turno
            </label>
            <select
              name="duracion"
              value={formData.duracion}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
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
            className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

