import React, { useState } from "react";
import BajaProgramadaPopup from "./BajaProgramadaPopup";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;                  
  onSchedule: (fechaISO: string) => void; 
  affiliateName: string;
  affiliateSurname: string;
  affiliateDni: string;
  affiliateCredencial: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  onSchedule,
  affiliateName,
  affiliateSurname,
  affiliateDni,
  affiliateCredencial,
}: ConfirmDeleteDialogProps) {
  const [showScheduler, setShowScheduler] = useState(false);

  if (!open) return null;

  const isTitular = affiliateCredencial.endsWith("-01");

  return (
    <div className="fixed inset-0 bg-light-gray bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg">
        {/* Ícono de advertencia */}
        <div className="text-4xl text-red-600 mb-4">⚠️</div>

        {/* Mensaje */}
        {isTitular ? (
          <>
            <p className="text-gray-800 text-base mb-6">
              ¿Está seguro que desea dar de baja al afiliado <br />
              <b>
                {affiliateName} {affiliateSurname}, DNI {affiliateDni}
              </b>
              ?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Si elimina este afiliado se eliminarán todos los miembros del grupo familiar.
            </p>
          </>
        ) : (
          <p className="text-gray-800 text-base mb-6">
            ¿Está seguro que desea dar de baja al afiliado <br />
            <b>
              {affiliateName} {affiliateSurname}, DNI {affiliateDni}
            </b>
            ?
          </p>
        )}

        {/* Botonera */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-medium transition"
          >
            No, cancelar
          </button>

          <button
            onClick={() => setShowScheduler(true)}
            className="bg-[#5FA92C] hover:brightness-95 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Baja programada
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>

      {showScheduler && (
        <BajaProgramadaPopup
          onClose={() => setShowScheduler(false)}
          onConfirm={(iso) => {
            setShowScheduler(false);
            onSchedule(iso);
          }}
          title="Programar baja"
        />
      )}
    </div>
  );
}
