interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affiliateName: string;
  affiliateSurname: string;
  affiliateDni: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  affiliateName,
  affiliateSurname,
  affiliateDni,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-light-gray bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg">
        {/* Ícono de advertencia */}
        <div className="text-4xl text-red-600 mb-4">⚠️</div>

        {/* Mensaje */}
        <p className="text-gray-800 text-base mb-6">
          ¿Está seguro que desea dar de baja al afiliado <br />
          <b>
            {affiliateName} {affiliateSurname}, DNI {affiliateDni}
          </b>
          ?
        </p>

        {/* Botones */}
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
