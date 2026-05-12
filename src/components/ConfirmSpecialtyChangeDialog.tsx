
interface ConfirmSpecialtyChangeDialogProps {
  open: boolean;
  providerName: string;
  specialty: string;
  agendaCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmSpecialtyChangeDialog({
  open,
  providerName,
  specialty,
  agendaCount,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmSpecialtyChangeDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              ¿Eliminar especialidad?
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Esta acción tiene consecuencias importantes
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-3">
            <strong>{providerName}</strong> tiene{" "}
            <strong>{agendaCount} agenda{agendaCount > 1 ? "s" : ""}</strong> activa
            {agendaCount > 1 ? "s" : ""} asociada{agendaCount > 1 ? "s" : ""} a la 
            especialidad <strong>{specialty}</strong>.
          </p>
          <p className="text-sm text-gray-700">
            Si eliminas esta especialidad, todas las agendas relacionadas se
            <strong> eliminarán permanentemente</strong>.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 p-3 rounded mb-6">
          <p className="text-xs text-red-700 font-semibold mb-1">
            ⛔ ACCIÓN IRREVERSIBLE
          </p>
          <p className="text-xs text-red-600">
            Los turnos de pacientes pueden estar vinculados a estas agendas.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
