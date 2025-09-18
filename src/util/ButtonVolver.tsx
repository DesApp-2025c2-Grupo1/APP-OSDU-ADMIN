
import ReplayIcon from '@mui/icons-material/Replay'; // No es identico al del figma, esta mas asociado a replay multimedia.
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'; Este icono me gustó más, hay que reemplazarlo y vemos cual nos convenece más

type ButtonVolverProps = {
  text: string;
  onClick?: () => void;
};

export function ButtonVolver({ text, onClick }: ButtonVolverProps) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-3
        mt-2 ml-2
        border border-black
        bg-gray-800 text-gray-200 
        px-6 py-2 
        rounded-lg font-medium shadow-md 
        transition duration-200 
        hover:bg-gray-600 
        focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
      "
    >
    <ReplayIcon fontSize="small"/>
      {text}
    </button>
  );
}

// Para usarlo :         <ButtonVolver text="Volver" onClick={() => window.history.back()} />
// Con window.history.back() deberia volver a la pantalla anterior segun el historial, sino se puede llevar directo a home
// Pero hay que usar React Router para usar una funcion llamada useNavigate, no se que será mejor.