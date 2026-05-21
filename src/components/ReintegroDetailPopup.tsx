import { useState } from "react";
import type { ReintegroAdmin } from "../model/Reintegro.model";
import { updateReintegroEstado } from "../api/reintegroService";

const ESTADOS = ["Pendiente", "En análisis", "Observada", "Aprobada", "Rechazada"] as const;

const ESTADO_BADGE: Record<string, string> = {
  Recibido:      "bg-slate-100 text-slate-600",
  "En análisis": "bg-blue-100 text-blue-700",
  Observado:     "bg-amber-100 text-amber-700",
  Aprobado:      "bg-green-100 text-green-700",
  Rechazado:     "bg-red-100 text-red-600",
};

const MOTIVO_REQUERIDO = new Set(["Aprobada", "Rechazada", "Observada"]);

interface Props {
  reintegro: ReintegroAdmin;
  onClose: () => void;
  onUpdated: () => void;
}

export function ReintegroDetailPopup({ reintegro, onClose, onUpdated }: Props) {
  const [estado, setEstado] = useState<string>(reintegro.estadoRaw);
  const [motivo, setMotivo] = useState(reintegro.motivoEstado ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    setError(null);
    if (MOTIVO_REQUERIDO.has(estado) && !motivo.trim()) {
      setError("El motivo es requerido para este estado.");
      return;
    }
    setSaving(true);
    try {
      await updateReintegroEstado(reintegro.id, estado, motivo.trim() || undefined);
      onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const badgeCls = ESTADO_BADGE[reintegro.estado] ?? "bg-slate-100 text-slate-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1">
              Solicitud #{reintegro.nro}
            </p>
            <h3 className="text-lg font-bold text-slate-800">{reintegro.medico}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {reintegro.afiliado ?? "Afiliado desconocido"}
              {reintegro.credencial ? ` · Cred. ${reintegro.credencial}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${badgeCls}`}>
              {reintegro.estado}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Datos prestación */}
          <div>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">
              Datos de la Prestación
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Especialidad</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.especialidad}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Lugar</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.lugarAtencion}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fecha Prestación</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.fechaPrestacion}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fecha Estado</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.fechaEstado}</p>
              </div>
            </div>
          </div>

          {/* Datos factura */}
          <div className="border-t border-slate-50 pt-4">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">
              Datos de Facturación
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">CUIT Emisor</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.factura.cuit || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Monto Total</p>
                <p className="text-sm font-bold text-green-600">
                  ${reintegro.factura.valorTotal.toLocaleString("es-AR")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Forma de Pago</p>
                <p className="text-sm font-semibold text-slate-800">{reintegro.formaPago}</p>
              </div>
              {reintegro.cbu && (
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">CBU / CVU</p>
                  <p className="text-sm font-semibold text-slate-800 font-mono">{reintegro.cbu}</p>
                </div>
              )}
            </div>
            {reintegro.observaciones && (
              <div className="mt-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Observaciones del Afiliado</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{reintegro.observaciones}</p>
              </div>
            )}
          </div>

          {/* Cambio de estado */}
          <div className="border-t border-slate-50 pt-4">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-3">
              Gestión del Estado
            </p>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nuevo Estado</label>
                <select
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setError(null); }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-700"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Motivo / Mensaje
                  {MOTIVO_REQUERIDO.has(estado) && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder={
                    estado === "Observada"
                      ? "Indicar qué documentación o aclaración se requiere..."
                      : estado === "Aprobada"
                      ? "Indicar el monto aprobado u otra aclaración..."
                      : "Motivo del rechazo..."
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-500 rounded-lg hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar Cambio"}
          </button>
        </div>
      </div>
    </div>
  );
}
