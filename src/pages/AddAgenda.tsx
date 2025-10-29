import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { providersMock } from "../data/providers";
import { SPECIALTIES } from "../data/specialties";

interface AddAgendaProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddAgenda({ onClose, onSave }: AddAgendaProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prestadorId: "",
    especialidadId: "",
    lugarAtencion: "",
    dias: [] as string[],
    horario: "",
    duracionTurno: "30",
  });

  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);

  useEffect(() => {
    if (formData.prestadorId) {
      const prestador = providersMock.find((p) => p.id === formData.prestadorId);
      if (prestador) {
        const especialidades = prestador.especialidades.map((espId) => {
          const especialidad = SPECIALTIES.find((s) => s.id === espId);
          return { id: espId, nombre: especialidad?.nombre || espId };
        });
        setEspecialidadesDisponibles(especialidades);
        
        // Auto-seleccionar la primera especialidad si hay solo una
        if (especialidades.length === 1) {
          setFormData(prev => ({ ...prev, especialidadId: especialidades[0].id }));
        }
      }
    } else {
      setEspecialidadesDisponibles([]);
      setFormData(prev => ({ ...prev, especialidadId: "" }));
    }
  }, [formData.prestadorId]);

  const diasSemana = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ];

  const horariosDisponibles = [
    "08:00 - 12:00",
    "09:00 - 13:00",
    "10:00 - 14:00",
    "14:00 - 18:00",
    "15:00 - 19:00",
    "16:00 - 20:00",
  ];

  const handleDiaChange = (diaId: string) => {
    setFormData((prev) => ({
      ...prev,
      dias: prev.dias.includes(diaId)
        ? prev.dias.filter((d) => d !== diaId)
        : [...prev.dias, diaId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="bg-[#5FA92C] text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Nueva Agenda</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos del prestador */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Datos del prestador
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <select
                  value={formData.prestadorId}
                  onChange={(e) => handleChange("prestadorId", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
                  required
                >
                  <option value="">Seleccionar prestador</option>
                  {providersMock.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.nombreCompleto} ({provider.tipo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Especialidad
            </h3>
            <select
              value={formData.especialidadId}
              onChange={(e) => handleChange("especialidadId", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              required
              disabled={!formData.prestadorId}
            >
              <option value="">
                {formData.prestadorId
                  ? "Seleccionar especialidad"
                  : "Seleccione un prestador primero"}
              </option>
              {especialidadesDisponibles.map((especialidad) => (
                <option key={especialidad.id} value={especialidad.id}>
                  {especialidad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Definición de turnos
            </h3>

            {/* Días de la semana */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Días de la semana
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {diasSemana.map((dia) => (
                  <label key={dia.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.dias.includes(dia.id)}
                      onChange={() => handleDiaChange(dia.id)}
                      className="rounded border-gray-300 text-[#5FA92C] focus:ring-[#5FA92C]"
                    />
                    <span className="text-sm text-gray-700">{dia.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario
              </label>
              <select
                value={formData.horario}
                onChange={(e) => handleChange("horario", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
                required
              >
                <option value="">Seleccionar horario disponible</option>
                {horariosDisponibles.map((horario) => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
            </div>

            {/* Duración del turno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración del turno (min)
              </label>
              <input
                type="number"
                value={formData.duracionTurno}
                onChange={(e) => handleChange("duracionTurno", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
                placeholder="Ej: 30"
                min="15"
                max="120"
                step="15"
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-[#4c8c23] transition flex-1"
            >
              Guardar Agenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}