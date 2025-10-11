import React, { useEffect, useMemo, useState } from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { OptionsMenu } from "./OptionsMenu";
import type { Prestador } from "../model/Provider.model";
import { SPECIALTIES } from "../data/specialties"; 

type Props = {
  prestadores: Prestador[];
  onOptionClick: (option: string, prestador: Prestador) => void;
  pageSize?: number;
};


function splitFullName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { nombre: full, apellido: "" };
  const apellido = parts.pop() as string;
  return { nombre: parts.join(" "), apellido };
}


const specMap = new Map(SPECIALTIES.map(s => [s.id, s.nombre]));
function firstSpecialtyLabel(ids: string[]) {
  if (!ids || ids.length === 0) return "-";
  return specMap.get(ids[0]) ?? ids[0];
}

export function ProvidersTable({ prestadores, onOptionClick, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [prestadores, pageSize]);
  const totalPages = Math.max(1, Math.ceil(prestadores.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return prestadores.slice(start, start + pageSize);
  }, [prestadores, page, pageSize]);

  const from = prestadores.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, prestadores.length);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#5FA92C] text-white">
          <tr>
            {["CUIL/CUIT", "NOMBRE", "APELLIDO", "ESPECIALIDAD", "TELÉFONO", "CENTRO MÉDICO", ""].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {pageItems.map((p, idx) => {
            const { nombre, apellido } = splitFullName(p.nombreCompleto);
            const especialidad = firstSpecialtyLabel(p.especialidades);
            const telefono = p.telefonos?.[0] ?? "-";
            const centroMedico =
              p.tipo === "profesional"
                ? (p.integraCentroMedico?.nombre ?? "-")
                : "-";

            return (
              <tr key={p.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-3 text-sm">{p.cuilCuit}</td>
                <td className="px-4 py-3 text-sm">{nombre}</td>
                <td className="px-4 py-3 text-sm">{apellido}</td>
                <td className="px-4 py-3 text-sm">{especialidad}</td>
                <td className="px-4 py-3 text-sm">{telefono}</td>
                <td className="px-4 py-3 text-sm">{centroMedico}</td>
                <td className="px-2 py-3 text-right w-10">
                  <OptionsMenu
                    affiliate={{
                      credencial: p.cuilCuit,
                      dni: p.cuilCuit,
                      nombre, 
                      apellido,
                    }}
                    options={["Editar", "Ver Detalles", "Dar de Baja"]}
                    onOptionClick={(opt) => onOptionClick(opt, p)}
                  />
                </td>
              </tr>
            );
          })}

          {pageItems.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginado*/}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-gray-600">
          Mostrando {from} a {to} de {prestadores.length} prestadores
        </span>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Página {page} de {totalPages}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="h-8 w-8 grid place-items-center rounded border border-gray-300 text-gray-700
                        hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
              title="Anterior"
            >
              ‹
            </button>

            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="h-8 w-8 grid place-items-center rounded border border-gray-300 text-gray-700
                        hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Siguiente"
              title="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ProvidersTable;
