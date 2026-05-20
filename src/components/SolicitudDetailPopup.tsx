import { useState } from "react";
import type { SolicitudAdmin } from "../model/Solicitud.model";
import { updateSolicitudEstado } from "../api/solicitudService";

const ESTADOS = ["Pendiente", "En análisis", "Observada", "Aprobada", "Rechazada"] as const;

const ESTADO_BADGE: Record<string, string> = {
  Pendiente:     "bg-gray-100 text-gray-600",
  "En análisis": "bg-blue-100 text-blue-700",
  Observada:     "bg-amber-100 text-amber-700",
  Aprobada:      "bg-green-100 text-green-700",
  Rechazada:     "bg-red-100 text-red-600",
};

const MOTIVO_REQUERIDO = new Set(["Aprobada", "Rechazada", "Observada"]);

interface Props {
  solicitud: SolicitudAdmin;
  onClose: () => void;
  onUpdated: () => void;
}

export function SolicitudDetailPopup({ solicitud, onClose, onUpdated }: Props) {
  const [estado, setEstado] = useState(solicitud.estado);
  const [motivo, setMotivo] = useState(solicitud.motivoEstado ?? "");
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
      await updateSolicitudEstado(solicitud.id, estado, motivo.trim() || undefined);
      onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const badgeCls = ESTADO_BADGE[solicitud.estado] ?? "bg-gray-100 text-gray-600";

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
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-[#5FA92C] uppercase tracking-widest mb-1">
              Solicitud #{solicitud.nro}
            </p>
            <h3 className="text-lg font-black text-gray-900">
              {solicitud.prestador ?? "Prestador desconocido"}
            </h3>
            {solicitud.prestadorCuit && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">CUIT {solicitud.prestadorCuit}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shrink-0 ${badgeCls}`}>
            {solicitud.estado}
          </span>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Info básica */}
          <div>
            <p className="text-[10px] font-black text-[#5FA92C] uppercase tracking-widest mb-3">
              Datos de la Solicitud
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Afiliado</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.afiliado ?? "—"}</p>
                {solicitud.credencial && (
                  <p className="text-[10px] text-gray-400 mt-0.5">Cred. {solicitud.credencial}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Tipo</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.tipo}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Fecha Solicitud</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.fecha}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Última actualización</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.fechaEstado}</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {solicitud.descripcion && (
            <div className="border-t border-gray-50 pt-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Descripción</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {solicitud.descripcion}
              </p>
            </div>
          )}

          {/* Adjunto */}
          {solicitud.adjunto && (
            <div className="border-t border-gray-50 pt-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Adjunto</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="bg-[#5FA92C]/10 text-[#5FA92C] rounded-lg p-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{solicitud.adjunto.nombre}</p>
                  <p className="text-[10px] text-gray-400">
                    {(solicitud.adjunto.tamanio / 1024).toFixed(1)} KB · {solicitud.adjunto.tipo}
                  </p>
                </div>
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                  Sin URL
                </span>
              </div>
            </div>
          )}

          {/* Motivo actual */}
          {solicitud.motivoEstado && (
            <div className="border-t border-gray-50 pt-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Motivo del estado actual</p>
              <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                {solicitud.motivoEstado}
              </p>
            </div>
          )}

          {/* Cambio de estado */}
          <div className="border-t border-gray-50 pt-4">
            <p className="text-[10px] font-black text-[#5FA92C] uppercase tracking-widest mb-3">
              Gestión del Estado
            </p>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nuevo Estado</label>
                <select
                  value={estado}
                  onChange={(e) => { setEstado(e.target.value); setError(null); }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5FA92C] outline-none bg-white"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Motivo / Mensaje
                  {MOTIVO_REQUERIDO.has(estado) && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder={
                    estado === "Observada"
                      ? "Indicar qué información adicional se requiere..."
                      : estado === "Aprobada"
                      ? "Indicar condiciones de aprobación..."
                      : "Motivo del rechazo..."
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5FA92C] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-gray-500 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-6 py-2 bg-[#5FA92C] text-white text-sm font-bold rounded-xl hover:bg-[#4a8a22] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar Cambio"}
          </button>
        </div>
      </div>
    </div>
  );
}
