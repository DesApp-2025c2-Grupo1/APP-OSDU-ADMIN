import { useState } from "react";
import type { Prestador } from "../model/Provider.model";

interface ConfirmDeleteProviderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  provider: Prestador;
  action?: "baja" | "suspension";
}

export function ConfirmDeleteProviderDialog({
  open,
  onClose,
  onConfirm,
  provider,
  action = "baja",
}: ConfirmDeleteProviderDialogProps) {
  const [motivo, setMotivo] = useState("");

  if (!open) return null;

  const isCentro = provider.tipoPrestador === "centro_medico";
  const isSuspension = action === "suspension";
  const actionText = isSuspension ? "suspender" : "dar de baja";
  const buttonText = isSuspension ? "Sí, suspender" : "Sí, dar de baja";
  const disabled = !motivo.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[440px] max-w-[calc(100vw-2rem)] text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
          !
        </div>

        {isCentro ? (
          <>
            <p className="text-gray-800 text-base mb-6">
              ¿Está seguro que desea {actionText} al centro médico <br />
              <b>{provider.nombreCompleto}</b>?
            </p>
          </>
        ) : (
          <p className="text-gray-800 text-base mb-6">
            ¿Está seguro que desea {actionText} al prestador <br />
            <b>{provider.nombreCompleto}</b>?
          </p>
        )}

        <label className="block text-left text-sm font-semibold text-gray-700 mb-2" htmlFor="motivo-prestador">
          Motivo obligatorio
        </label>
        <textarea
          id="motivo-prestador"
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          rows={4}
          placeholder={isSuspension ? "Ej.: documentación pendiente de regularización" : "Ej.: baja solicitada por el prestador"}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#5FA92C] focus:ring-2 focus:ring-[#5FA92C]/20"
        />
        {disabled && (
          <p className="mt-2 text-left text-xs text-red-600">
            Indicá el motivo para continuar.
          </p>
        )}

        <div className="flex justify-around mt-4 gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-medium transition"
          >
            No, cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo.trim())}
            disabled={disabled}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
