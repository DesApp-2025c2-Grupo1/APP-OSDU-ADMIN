import React from "react";

type AltaProgramadaPopupProps = {
  onClose: () => void;
  onConfirm: (scheduledAtISO: string) => void;
};

export default function AltaProgramadaPopup({ onClose, onConfirm }: AltaProgramadaPopupProps) {
  const [fechaHora, setFechaHora] = React.useState<string>("");

  const handleConfirm = () => {
    if (!fechaHora) return alert("Elegí una fecha y hora.");
    const d = new Date(fechaHora);
    if (isNaN(d.getTime()) || d.getTime() < Date.now() + 60_000) {
      alert("La fecha/hora debe ser al menos 1 minuto en el futuro.");
      return;
    }
    onConfirm(new Date(fechaHora).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[95%] max-w-md p-5">
        <h2 className="text-xl font-semibold mb-3">Programar alta del afiliado</h2>
        <p className="text-sm text-gray-600 mb-4">
          Elegí fecha y hora en las que querés que se genere el alta.
        </p>

        <input
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-[#5FA92C] text-white hover:bg-[#4A8926]"
          >
            Programar
          </button>
        </div>
      </div>
    </div>
  );
}
