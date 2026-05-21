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
  Recibido:      "Recibido",
  "En análisis": "En análisis",
  Observado:     "Observado",
  Aprobado:      "Aprobado",
  Rechazado:     "Rechazado",
};

const ESTADO_CLS: Record<string, string> = {
  Recibido:      "bg-slate-100 text-slate-600",
  "En análisis": "bg-blue-100 text-blue-700",
  Observado:     "bg-amber-100 text-amber-700",
  Aprobado:      "bg-green-100 text-green-700",
  Rechazado:     "bg-red-100 text-red-600",
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
        estado: t === "todos" ? undefined : t,
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
    <div className="w-full p-4 sm:p-8 space-y-5">
      {/* Título */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">Gestión de Reintegros</h1>
        <p className="text-xs text-slate-400 mt-0.5">Revisá y resolvé las solicitudes de reintegro de los afiliados.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
              tab === key
                ? "bg-teal-600 text-white border-teal-600"
                : "border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Cargando reintegros...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
        ) : reintegros.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-300 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-bold uppercase tracking-widest">Sin solicitudes</p>
          </div>
        ) : (
          <>
            {/* Tabla — solo desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                    <th className="px-6 py-4">Afiliado</th>
                    <th className="px-6 py-4">Médico / Especialidad</th>
                    <th className="px-6 py-4">Fecha Prestación</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reintegros.map((r) => {
                    const badgeCls = ESTADO_CLS[r.estado] ?? "bg-slate-100 text-slate-600";
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                            {r.afiliado ?? "—"}
                          </p>
                          {r.credencial && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                              Cred. {r.credencial}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">{r.medico}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{r.especialidad}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">{r.fechaPrestacion}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{r.lugarAtencion}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-green-600">
                            ${r.factura.valorTotal.toLocaleString("es-AR")}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{r.formaPago}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badgeCls}`}>
                            {ESTADO_DISPLAY[r.estado] ?? r.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards — solo mobile */}
            <div className="md:hidden divide-y divide-slate-50">
              {reintegros.map((r) => {
                const badgeCls = ESTADO_CLS[r.estado] ?? "bg-slate-100 text-slate-600";
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="px-4 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{r.afiliado ?? "—"}</p>
                        {r.credencial && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Cred. {r.credencial}</p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${badgeCls}`}>
                        {ESTADO_DISPLAY[r.estado] ?? r.estado}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{r.medico}</span>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">{r.especialidad}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{r.fechaPrestacion}</span>
                      <span className="text-sm font-bold text-green-600">
                        ${r.factura.valorTotal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {total} solicitudes · Pág. {page}/{totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 rounded border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 rounded border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-100"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
