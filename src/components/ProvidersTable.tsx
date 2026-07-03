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
    <div>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            {["CUIL/CUIT", "NOMBRE COMPLETO", "ESPECIALIDAD", "LOCALIDAD", "ESTADO", "TIPO", ""].map((h) => (
              <th key={h} scope="col" className="px-6 py-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {pageItems.map((p) => {
            const especialidad = firstSpecialtyLabel(p.especialidades);
            const localidad = p.lugaresAtencion?.[0]?.localidad ?? "-";
            const tipoPrestador = p.tipoPrestador === "profesional" ? "Profesional" : "Centro Médico";
            const estado = p.estado === "baja" ? "Baja" : p.estado === "suspendido" ? "Suspendido" : "Activo";

            return (
              <tr key={p.cuitCuil} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{p.cuitCuil}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{p.nombreCompleto}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{especialidad}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{localidad}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${estado === "Activo" ? "bg-green-100 text-green-700" : estado === "Suspendido" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{tipoPrestador}</td>
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
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showPagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Mostrando {from}–{to} de {prestadores.length} prestadores
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="h-8 w-8 rounded border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="h-8 w-8 rounded border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProvidersTable;
