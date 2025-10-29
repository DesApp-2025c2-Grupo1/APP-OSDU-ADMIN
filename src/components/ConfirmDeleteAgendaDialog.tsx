import React from "react";

export interface HorarioAgenda {
  id: string;
  prestador: string;
  especialidad: string;
  lugar: string;
  dias: string[];
  horario: string;
  duracion: number;
}

interface ConfirmDeleteAgendaDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agenda: HorarioAgenda | null;
}

export function ConfirmDeleteAgendaDialog({
  open,
  onClose,
  onConfirm,
  agenda,
}: ConfirmDeleteAgendaDialogProps) {
  if (!open || !agenda) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg">
        <div className="text-4xl text-red-600 mb-4">⚠️</div>


        <p className="text-gray-800 text-base mb-6">
          ¿Está seguro que desea eliminar la agenda de <br />
          <b>Dr/Dra {agenda.prestador}</b>?
        </p>

        <div className="flex justify-around mt-4 gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-medium transition"
          >
            No, cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}