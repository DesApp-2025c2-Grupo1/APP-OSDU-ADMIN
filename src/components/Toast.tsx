import { useEffect } from "react";

type Props = {
  open: boolean;
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number; // ms
  onClose?: () => void;
};

export default function Toast({ open, message, variant = "success", duration = 3000, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const bg = variant === "success" ? "bg-green-600" : variant === "error" ? "bg-red-600" : "bg-gray-700";

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] ${bg} text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <div className="text-sm">{message}</div>
        <button
          onClick={() => onClose?.()}
          className="ml-3 font-bold text-white"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
