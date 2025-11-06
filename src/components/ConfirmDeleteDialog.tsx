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
  isDeleting?: boolean; 
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
  isDeleting = false, 
}: ConfirmDeleteDialogProps) {
  const [showScheduler, setShowScheduler] = useState(false);

  if (!open) return null;

  const isTitular = affiliateCredencial.endsWith("-01");

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg">
          {/* ✅ Indicador de carga */}
          {isDeleting ? (
            <div className="text-4xl mb-4" aria-hidden>
              <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="text-4xl text-red-600 mb-4" aria-hidden>⚠️</div>
          )}

          <h2 id="confirm-delete-title" className="sr-only">
            Confirmar baja del afiliado
          </h2>

          {/* ✅ Mensaje durante eliminación */}
          {isDeleting ? (
            <p className="text-gray-800 text-base mb-6">
              Eliminando afiliado <br />
              <b>{affiliateName} {affiliateSurname}</b>...
            </p>
          ) : (
            <>
              {isTitular ? (
                <>
                  <p className="text-gray-800 text-base mb-6">
                    ¿Está seguro que desea dar de baja al afiliado <br />
                    <b>{affiliateName} {affiliateSurname}, DNI {affiliateDni}</b>?
                  </p>
                  <p className="text-red-600 text-sm mb-6">
                    Si elimina este afiliado se eliminarán todos los miembros del grupo familiar.
                  </p>
                </>
              ) : (
                <p className="text-gray-800 text-base mb-6">
                  ¿Está seguro que desea dar de baja al afiliado <br />
                  <b>{affiliateName} {affiliateSurname}, DNI {affiliateDni}</b>?
                </p>
              )}
            </>
          )}

          {/* ✅ Botones deshabilitados durante eliminación */}
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              No, cancelar
            </button>

            <button
              onClick={() => setShowScheduler(true)}
              disabled={isDeleting}
              className="bg-[#5FA92C] hover:brightness-95 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              Baja programada
            </button>

            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ No mostrar scheduler mientras está eliminando */}
      {showScheduler && !isDeleting && (
        <BajaProgramadaPopup
          withOverlay={false}
          onClose={() => setShowScheduler(false)}
          onConfirm={(iso) => {
            setShowScheduler(false);
            onSchedule(iso);
          }}
          title="Programar baja"
        />
      )}
    </>
  );
}