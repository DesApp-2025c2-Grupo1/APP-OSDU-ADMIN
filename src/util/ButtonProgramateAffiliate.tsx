import AccessTimeIcon from '@mui/icons-material/AccessTime';

type ButtonProgramateAffiliateProps = {
  text: string;
  onClick?: () => void;
};

export function ButtonProgramateAffiliate({ text, onClick }: ButtonProgramateAffiliateProps) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-3
        bg-[#14B8A6] text-white 
        px-6 py-2 
        border border-black
        rounded-lg font-medium shadow-md 
        transition duration-200 
        hover:bg-[#4c8c23] 
        focus:outline-none focus:ring-2 focus:ring-[#14B8A6]  focus:ring-offset-2
      "
    >
      <AccessTimeIcon fontSize="small" />
      {text}
    </button>
  );
}
