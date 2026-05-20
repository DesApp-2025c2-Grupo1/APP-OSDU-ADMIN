import { useState, useEffect, useCallback } from "react";
import { fetchReintegros } from "../api/reintegroService";
import type { ReintegroAdmin } from "../model/Reintegro.model";
import { ReintegroDetailPopup } from "../components/ReintegroDetailPopup";

const LIMIT = 15;

type TabKey = "todos" | "Pendiente" | "En análisis" | "Observada" | "Aprobada" | "Rechazada";

const TABS: { key: TabKey; label: string }[] = [
  { key: "todos",        label: "Todos" },
  { key: "Pendiente",    label: "Pendientes" },
  { key: "En análisis",  label: "En análisis" },
  { key: "Observada",    label: "Observados" },
  { key: "Aprobada",     label: "Aprobados" },
  { key: "Rechazada",    label: "Rechazados" },
];

const ESTADO_DISPLAY: Record<string, string> = {
  Recibido:     "Recibido",
  "En análisis":"En análisis",
  Observado:    "Observado",
  Aprobado:     "Aprobado",
  Rechazado:    "Rechazado",
};

const ESTADO_CLS: Record<string, string> = {
  Recibido:     "bg-gray-100 text-gray-600",
  "En análisis":"bg-blue-100 text-blue-700",
  Observado:    "bg-amber-100 text-amber-700",
  Aprobado:     "bg-green-100 text-green-700",
  Rechazado:    "bg-red-100 text-red-600",
};

export function Reintegros() {
  const [tab, setTab] = useState<TabKey>("todos");
  const [reintegros, setReintegros] = useState<ReintegroAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReintegroAdmin | null>(null);

  const cargar = useCallback(async (t: TabKey, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReintegros({
        status: t === "todos" ? undefined : t,
        page: p,
        limit: LIMIT,
      });
      setReintegros(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError("No se pudieron cargar los reintegros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(tab, page);
  }, [cargar, tab, page]);

  const handleTabChange = (t: TabKey) => {
    setTab(t);
    setPage(1);
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Gestión de Reintegros</h1>
        <p className="text-sm text-gray-400 mt-1">Revisá y resolvé las solicitudes de reintegro de los afiliados.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-colors ${
              tab === key
                ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Cargando reintegros...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
        ) : reintegros.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-bold uppercase tracking-widest">Sin solicitudes</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr className="text-[10px] uppercase text-gray-400 font-black tracking-widest">
                    <th className="px-6 py-4">Afiliado</th>
                    <th className="px-6 py-4">Médico / Especialidad</th>
                    <th className="px-6 py-4">Fecha Prestación</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reintegros.map((r) => {
                    const badgeCls = ESTADO_CLS[r.estado] ?? "bg-gray-100 text-gray-600";
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 group-hover:text-[#5FA92C] transition-colors">
                            {r.afiliado ?? "—"}
                          </p>
                          {r.credencial && (
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                              Cred. {r.credencial}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{r.medico}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{r.especialidad}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{r.fechaPrestacion}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{r.lugarAtencion}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-green-600">
                            ${r.factura.valorTotal.toLocaleString("es-AR")}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{r.formaPago}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${badgeCls}`}>
                            {ESTADO_DISPLAY[r.estado] ?? r.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {total} solicitudes · Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-100"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <ReintegroDetailPopup
          reintegro={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { cargar(tab, page); setSelected(null); }}
        />
      )}
    </div>
  );
}
