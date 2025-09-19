import AddIcon from '@mui/icons-material/Add';
export function ButtonAddAffiliate({ text }: { text: string }) {
    return (
        <button
            className="
                inline-flex items-center gap-3
                mt-2
                ml-2
                bg-[#5FA92C] 
                text-white 
                px-6 py-2 
                rounded-2xl
                font-medium 
                shadow-md 
                transition 
                duration-200 
                hover:bg-[#4c8c23] 
                focus:outline-none 
                focus:ring-2 
                focus:ring-[#5FA92C] 
                focus:ring-offset-2
                "
        >
        <AddIcon fontSize="small"/>
            {text}
        </button>
    );
}
