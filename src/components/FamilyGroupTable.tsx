import React from "react";
import { OptionsMenu } from "./OptionsMenu";

export type FamilyMember = {
  credencial: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  plan: string;
  direccion: string;
};

interface FamilyGroupTableProps {
  members: FamilyMember[];
  onOptionClick: (option: string, member: FamilyMember) => void;
}

export function FamilyGroupTable({ members, onOptionClick }: FamilyGroupTableProps) {
  const handleOptionClick = (option: string, member: FamilyMember) => {
    onOptionClick(option, member);
  };

  return (
    <div className="rounded-lg border border-gray-300 shadow-md bg-white">
      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Credencial","DNI","Nombre","Apellido","Fecha Nac.","Plan","Dirección",""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((m, idx) => (
              <tr key={m.credencial} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-2 text-sm">{m.credencial}</td>
                <td className="px-4 py-2 text-sm">{m.dni}</td>
                <td className="px-4 py-2 text-sm">{m.nombre}</td>
                <td className="px-4 py-2 text-sm">{m.apellido}</td>
                <td className="px-4 py-2 text-sm">{m.fechaNacimiento}</td>
                <td className="px-4 py-2 text-sm">{m.plan}</td>
                <td className="px-4 py-2 text-sm">{m.direccion}</td>
                <td className="px-2 py-2 text-right w-10">
                  <OptionsMenu
                    affiliate={{
                      credencial: m.credencial,
                      dni: m.dni,
                      nombre: m.nombre,
                      apellido: m.apellido,
                    } as any}
                    options={["Ver Detalles","Editar","Dar de Baja"]}
                    onOptionClick={(opt) => handleOptionClick(opt, m)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE*/}
      <div className="md:hidden p-3">
        {members.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-gray-500">
            No hay miembros para mostrar.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.credencial} className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase">Credencial</div>
                <div className="font-semibold break-all">{m.credencial}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 uppercase">DNI</div>
                  <div className="text-sm">{m.dni}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Fecha Nac.</div>
                  <div className="text-sm">{m.fechaNacimiento}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Nombre</div>
                  <div className="text-sm">{m.nombre}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Apellido</div>
                  <div className="text-sm">{m.apellido}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase">Plan</div>
                  <div className="text-sm">{m.plan}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase">Dirección</div>
                  <div className="text-sm">{m.direccion}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleOptionClick("Ver detalles", m)}
                  className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Ver detalles
                </button>
                <button
                  onClick={() => handleOptionClick("Editar", m)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleOptionClick("Dar de baja", m)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Dar de baja
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
