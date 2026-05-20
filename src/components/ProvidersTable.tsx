import { useEffect, useMemo, useState } from "react";
import { OptionsMenu } from "./OptionsMenu";
import type { Prestador } from "../model/Provider.model"; 

type Props = {
  prestadores: Prestador[];
  onOptionClick: (option: string, prestador: Prestador) => void;
  pageSize?: number;
  showPagination?: boolean;
};





function firstSpecialtyLabel(especialidades: any[]) {
  if (!especialidades || especialidades.length === 0) return "-";
  // Ahora especialidades es array de objetos { id, nombre }
  const first = especialidades[0];
  return typeof first === "object" ? first.nombre : "-";
}

export function ProvidersTable({ prestadores, onOptionClick, pageSize = 10, showPagination = true }: Props) {
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
        <thead className="bg-[#14B8A6] text-white">
          <tr>
            {["CUIL/CUIT", "NOMBRE COMPLETO", "ESPECIALIDAD", "LOCALIDAD", "ESTADO", "TIPO", ""].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {pageItems.map((p, idx) => {
            const especialidad = firstSpecialtyLabel(p.especialidades);
            const localidad = p.lugaresAtencion?.[0]?.localidad ?? "-";
            const tipoPrestador = p.tipoPrestador === "profesional" ? "Profesional" : "Centro Médico";
            const estado = p.estado === "baja" ? "Baja" : p.estado === "suspendido" ? "Suspendido" : "Activo";

            return (
              <tr key={p.cuitCuil} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-3 text-sm">{p.cuitCuil}</td>
                <td className="px-4 py-3 text-sm">{p.nombreCompleto}</td>
                <td className="px-4 py-3 text-sm">{especialidad}</td>
                <td className="px-4 py-3 text-sm">{localidad}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${estado === "Activo" ? "bg-green-100 text-green-700" : estado === "Suspendido" ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-700"}`}>
                    {estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{tipoPrestador}</td>
                <td className="px-2 py-3 text-right w-10">
                  <OptionsMenu
                    affiliate={{
                      credencial: p.cuitCuil,
                      dni: p.cuitCuil,
                      nombre: p.nombreCompleto,
                      apellido: "",
                    }}
                    options={[
                      "Editar",
                      "Ver Detalles",
                      ...(p.estado === "activo" || !p.estado ? ["Suspender", "Dar de Baja"] : []),
                      ...(p.estado === "suspendido" ? ["Reactivar", "Dar de Baja"] : []),
                      ...(p.estado === "baja" ? ["Reactivar"] : []),
                      "Resetear contraseña",
                      "Reenviar credenciales",
                      "Forzar cambio de contraseña",
                    ]}
                    onOptionClick={(opt) => onOptionClick(opt, p)}
                  />
                </td>
              </tr>
            );
          })}

          {pageItems.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showPagination && <div className="flex items-center justify-between px-4 py-3">
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
      </div>}

    </div>
  );
}

export default ProvidersTable;
