import React from "react";

interface ScheduledSuccessPopupProps {
  open: boolean;
  onClose: () => void;
  nombre?: string;
  fechaISO: string; 
}

function formatISOToDiaMes(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function parseISOToLocalDateOnly(iso: string): Date | null {
  if (!iso) return null;
  const s = iso.slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function isTodayOrPast(iso: string): boolean {
  const picked = parseISOToLocalDateOnly(iso);
  if (!picked) return true;
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const pickedOnly = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return pickedOnly.getTime() <= todayOnly.getTime(); // Si es la misma fecha o anterior no es valido.
}

export default function ScheduledSuccessPopup({
  open,
  onClose,
  nombre,
  fechaISO,
}: ScheduledSuccessPopupProps) {
  if (!open) return null;

  const fechaCorta = formatISOToDiaMes(fechaISO);
  const invalid = isTodayOrPast(fechaISO);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2300]">
      <div className="relative bg-white w-[420px] max-w-[92vw] rounded-lg shadow-lg p-6 text-center">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className={`absolute top-3 right-3 text-xl ${
            invalid ? "text-red-600 hover:text-red-700" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ✕
        </button>

        <h3
          className={`text-xl font-semibold mb-2 ${
            invalid ? "text-red-700" : "text-gray-900"
          }`}
        >
          {invalid ? "Error al programar la baja" : "Baja programada"}
        </h3>

        {invalid ? (
          <p className="text-gray-700">
            Por favor seleccione una fecha futura.
          </p>
        ) : (
          <p className="text-gray-700 mb-4">
            {nombre ? (
              <>
                La baja para <b>{nombre}</b> fue programada para el <b>{fechaCorta}</b>.
              </>
            ) : (
              <>
                La baja fue programada para el <b>{fechaCorta}</b>.
              </>
            )}
          </p>
        )}

        {!invalid && (
          <button
            onClick={onClose}
            className="mt-1 px-4 py-2 rounded-md bg-[#5FA92C] text-white hover:brightness-95 font-medium"
          >
            Entendido
          </button>
        )}
      </div>
    </div>
  );
}
