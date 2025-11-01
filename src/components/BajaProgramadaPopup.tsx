import React, { useState } from "react";
import { ButtonProgramateAffiliate } from "../util/ButtonProgramateAffiliate";

interface BajaProgramadaPopupProps {
  onClose: () => void;
  onConfirm: (fechaISO: string) => void;
  title?: string;
}

export default function BajaProgramadaPopup({
  onClose,
  onConfirm,
  title = "Programar baja",
}: BajaProgramadaPopupProps) {
  const [fecha, setFecha] = useState<string>("");

  const confirmar = () => {
    if (!fecha) return;
    const iso = new Date(fecha).toISOString();
    onConfirm(iso);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[2100]">
      <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>

        <label className="block text-sm font-medium mb-2">Fecha y hora</label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Cancelar
          </button>

          <ButtonProgramateAffiliate
            text="Confirmar baja programada"
            onClick={confirmar}
          />
        </div>
      </div>
    </div>
  );
}
