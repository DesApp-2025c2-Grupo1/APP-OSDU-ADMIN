
type Props = {
  open: boolean;
  title?: string;
  message: string;
  acceptLabel?: string;
  onClose: () => void;
};

export default function InfoDialog({ open, title, message, acceptLabel = "Aceptar", onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg w-[420px] text-center shadow-lg">
        {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}

        <div className="text-gray-700 text-sm mb-6">{message}</div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
