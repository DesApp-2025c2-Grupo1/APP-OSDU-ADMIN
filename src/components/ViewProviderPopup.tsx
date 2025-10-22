import React from "react";
import type { Prestador, DireccionAtencion, HorarioAtencion } from "../model/Provider.model";

interface ViewProviderPopupProps {
  provider: Prestador;
  onClose: () => void;
}

// Utilidad para convertir el número del día (0–6) en texto
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function ViewProviderPopup({ provider, onClose }: ViewProviderPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Detalles del Prestador
        </h1>

        {/* Datos del Prestador */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos Generales
          </h2>

          {/* 👇 Responsive: 1 columna en mobile, 2 en md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">CUIL / CUIT</label>
              <p className="p-2 border border-gray-200 rounded break-words">{provider.cuilCuit}</p>
            </div>

            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nombre Completo</label>
              <p className="p-2 border border-gray-200 rounded break-words">{provider.nombreCompleto}</p>
            </div>

            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Tipo</label>
              <p className="p-2 border border-gray-200 rounded capitalize">{provider.tipo}</p>
            </div>

            {provider.integraCentroMedico && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Centro Médico</label>
                <p className="p-2 border border-gray-200 rounded break-words">
                  {provider.integraCentroMedico.nombre}
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Especialidades</label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {provider.especialidades.join(", ")}
              </p>
            </div>

            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Teléfonos</label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {provider.telefonos.join(" / ")}
              </p>
            </div>

            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Emails</label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {provider.emails.join(" / ")}
              </p>
            </div>
          </div>
        </div>


        {/* Direcciones de atención */}
        {provider.direcciones.length > 0 && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
              Direcciones de Atención
            </h2>

            {provider.direcciones.map((dir: DireccionAtencion, idx: number) => (
              <div key={idx} className="mb-6 p-3 border border-gray-300 rounded bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {dir.etiqueta || "Sede"} — {dir.localidad || "Localidad desconocida"}
                </h3>
                <p className="text-gray-700">
                  {dir.calle} {dir.numero || ""}, {dir.provincia || ""} ({dir.cp})
                </p>

                {/* Horarios dentro de cada dirección */}
                {dir.horarios.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-700 mb-1">Horarios:</h4>
                    <ul className="space-y-1">
                      {dir.horarios.map((h: HorarioAtencion, hIdx: number) => (
                        <li
                          key={hIdx}
                          className="p-2 border border-gray-300 rounded bg-white flex justify-between"
                        >
                          <span>
                            {h.dias.map(d => diasSemana[d]).join(", ")}
                          </span>
                          <span className="text-gray-600">
                            {h.desde} - {h.hasta}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón de cierre */}
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
