import AddIcon from '@mui/icons-material/Add';

type ButtonAddAffiliateProps = {
  text: string;
  onClick?: () => void;
};

export function ButtonAddAffiliate({ text, onClick }: ButtonAddAffiliateProps) {
  return (
    <button
      onClick={onClick}
      type="button" 
      className="
        inline-flex items-center gap-3
    mt-2 md:mt-0     /* <- en mobile deja margen arriba, en desktop lo quita */
    ml-0 md:ml-2     /* <- en mobile sin margen izquierdo, en desktop agrega 8px */
    bg-[#5FA92C] text-white 
    px-6 py-2 
    border border-black
    rounded-lg font-medium shadow-md 
    transition duration-200 
    hover:bg-[#4c8c23] 
    focus:outline-none focus:ring-2 focus:ring-[#5FA92C] focus:ring-offset-2
    "
    >
      <AddIcon fontSize="small" />
      {text}
    </button>
  );
}

