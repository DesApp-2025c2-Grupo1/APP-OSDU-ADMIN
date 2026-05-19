import React from "react";

type AltaProgramadaPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledAtISO: string) => void;
  onSimple?: () => void;
};

export default function AltaProgramadaPopup({ isOpen, onClose, onConfirm, onSimple }: AltaProgramadaPopupProps) {
  const [fechaHora, setFechaHora] = React.useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!fechaHora) return alert("Elegí una fecha y hora.");
    const d = new Date(fechaHora);
    if (isNaN(d.getTime()) || d.getTime() < Date.now() + 60_000) {
      alert("La fecha/hora debe ser al menos 1 minuto en el futuro.");
      return;
    }
    // Enviar el valor del datetime-local directamente, SIN convertir a ISO
    // Esto mantiene la hora local (ej: "2025-11-25T17:20")
    onConfirm(fechaHora);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm w-[95%] max-w-md p-6">
        <h2 className="text-lg font-600 text-slate-800 mb-2">Programar alta del afiliado</h2>
        <p className="text-sm text-slate-500 mb-4">
          Elegí fecha y hora en las que querés que se genere el alta.
        </p>

        <input
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 mb-6"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors"
          >
            Programar
          </button>
        </div>
      </div>
    </div>
  );
}
