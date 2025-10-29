import React from "react";

interface ViewAgendaPopupProps {
  agenda: {
    id: string;
    prestador: string;
    especialidad: string;
    lugar: string;
    dias: string[];
    horario: string;
    duracion: number;
  };
  onClose: () => void;
}

export function ViewAgendaPopup({ agenda, onClose }: ViewAgendaPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        {/* Título principal */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Detalles de la Agenda
        </h1>

        {/* DATOS DEL PRESTADOR */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos del Prestador
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Nombre del Prestador
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.prestador}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Especialidad
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.especialidad}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Lugar de Atención
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.lugar}
              </p>
            </div>
          </div>
        </div>

        {/* DEFINICIÓN DE TURNOS */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Definición de Turnos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Días
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.dias.join(", ")}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Horario
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.horario}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                Duración del Turno
              </label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {agenda.duracion} minutos
              </p>
            </div>
          </div>
        </div>

        {/* BOTÓN CERRAR */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
