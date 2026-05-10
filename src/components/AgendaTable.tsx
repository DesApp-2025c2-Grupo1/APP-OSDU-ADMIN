import React from "react";
import type { HorarioAgenda } from "../pages/Agenda";
import { OptionsMenu } from "./OptionsMenu";

interface AgendaTableProps {
  horarios: HorarioAgenda[];
  onOptionClick: (option: string, horario: HorarioAgenda) => void;
  formatDias: (dias: string[]) => string;
}

export function AgendaTable({
  horarios,
  onOptionClick,
  formatDias,
}: AgendaTableProps) {
  const handleOptionClick = (option: string, horario: HorarioAgenda) => {
    onOptionClick(option, horario);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Tabla de escritorio */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Prestador", "Especialidad", "Lugar", "Días", "Duración", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {horarios.map((horario) => (
                <tr key={horario.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-500 text-slate-700">{horario.prestador}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{horario.especialidad}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{horario.lugar}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDias(horario.dias)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{horario.duracion} min</td>
                  <td className="px-4 py-4 text-right">
                    <OptionsMenu
                      affiliate={{
                        credencial: horario.id,
                        dni: horario.id,
                        nombre: horario.prestador.split(' ')[0] || '',
                        apellido: horario.prestador.split(' ').slice(1).join(' ') || '',
                      }}
                      options={["Editar", "Ver detalles", "Dar de baja"]}
                      onOptionClick={(opt) => handleOptionClick(opt, horario)}
                    />
                  </td>
                </tr>
              ))}

              {horarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No hay horarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista móvil */}
      <div className="md:hidden">
        {horarios.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-400">
            No hay horarios para mostrar.
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {horarios.map((h) => (
            <div
              key={h.id}
              className="px-4 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-700">{h.prestador}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{h.cuitCuil}</p>
                </div>
                <OptionsMenu
                  affiliate={{
                    credencial: h.id,
                    dni: h.id,
                    nombre: h.prestador.split(' ')[0] || '',
                    apellido: h.prestador.split(' ').slice(1).join(' ') || '',
                  }}
                  options={["Editar", "Ver detalles", "Dar de baja"]}
                  onOptionClick={(opt) => handleOptionClick(opt, h)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
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
                  <span className="text-slate-400 font-500">Duración</span>
                  <p className="text-slate-600 mt-0.5">{h.duracion} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
