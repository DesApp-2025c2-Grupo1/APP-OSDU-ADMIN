import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

type ButtonCreateAffiliateProps = {
  text: string;
  onClick?: () => void;
};

export function ButtonCreateAffiliate({ text, onClick }: ButtonCreateAffiliateProps) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-3
        mt-2 ml-2
        bg-[#14B8A6] text-white 
        px-6 py-2 
        border border-black
        rounded-lg font-medium shadow-md 
        transition duration-200 
        hover:bg-[#4c8c23] 
        focus:outline-none focus:ring-2 focus:ring-[#14B8A6]  focus:ring-offset-2
      "
    >
      <PersonAddAlt1Icon fontSize="small" />
      {text}
    </button>
  );
}
