interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affiliateName: string;
  affiliateSurname: string;
  affiliateDni: string;
  affiliateCredencial: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  affiliateName,
  affiliateSurname,
  affiliateDni,
  affiliateCredencial,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  const isTitular = affiliateCredencial.endsWith("-01");

  const handleDelete = async () => {
    try {
      const response = await fetch(import.meta.env.BASE_URL + `/affiliates/${affiliateDni}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el afiliado");
      }

      // Actualizar frontend
      onConfirm();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(`No se pudo eliminar el afiliado: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[400px] text-center shadow-lg">
        <div className="text-4xl text-red-600 mb-4">⚠️</div>

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

        <div className="flex justify-around mt-4 gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-medium transition"
          >
            No, cancelar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
