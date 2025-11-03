import React from "react";
import type { HorarioAgenda } from "../pages/Agenda";
import { OptionsMenu } from "./OptionsMenu";

interface AgendaTableProps {
  horarios: HorarioAgenda[];
  menuAbierto: string | null;
  toggleMenu: (id: string) => void;
  handleEditarAgenda: (id: string) => void;
  handleVerDetalle: (id: string) => void;
  handleEliminarAgenda: (id: string) => void;
  formatDias: (dias: string[]) => string;
}

export function AgendaTable({
  horarios,
  handleEditarAgenda,
  handleVerDetalle,
  handleEliminarAgenda,
  formatDias,
}: AgendaTableProps) {
  const handleOptionClick = (option: string, horario: HorarioAgenda) => {
    switch (option) {
      case "Editar":
        handleEditarAgenda(horario.id);
        break;
      case "Ver Detalles":
        handleVerDetalle(horario.id);
        break;
      case "Dar de Baja":
        handleEliminarAgenda(horario.id);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Horarios de Atención</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Prestador", "Especialidad", "Lugar", "Días", "Horario", "Duración", ""].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {horarios.map((horario) => (
              <tr key={horario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{horario.prestador}</td>
                <td className="px-6 py-4 text-sm">{horario.especialidad}</td>
                <td className="px-6 py-4 text-sm">{horario.lugar}</td>
                <td className="px-6 py-4 text-sm">{formatDias(horario.dias)}</td>
                <td className="px-6 py-4 text-sm">{horario.horario}</td>
                <td className="px-6 py-4 text-sm">{horario.duracion} min</td>
                <td className="px-2 py-4 text-right w-10">
                  <OptionsMenu
                    affiliate={{
                      credencial: horario.id,
                      dni: horario.id,
                      nombre: horario.prestador.split(' ')[0] || '',
                      apellido: horario.prestador.split(' ').slice(1).join(' ') || '',
                    }}
                    options={["Editar", "Ver Detalles", "Dar de Baja"]}
                    onOptionClick={(opt) => handleOptionClick(opt, horario)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}