
import ReplayIcon from '@mui/icons-material/Replay'; 

type ButtonVolverProps = {
  text: string;
  onClick?: () => void;
};

export function ButtonVolver({ text, onClick }: ButtonVolverProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="
        inline-flex items-center gap-3
        border border-black
        bg-gray-800 text-gray-200 
        px-6 py-2 
        rounded-lg font-medium shadow-md 
        transition duration-200 
        hover:bg-gray-600 
        focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
      "
    >
      <ReplayIcon fontSize="small" />
      {text}
    </button>

  );
}
