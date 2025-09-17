export function Button({ text }: { text: string }) {
    return (
        <button
            className="
                mt-2
                ml-2
                bg-[#5FA92C] 
                text-white 
                px-6 py-2 
                rounded-lg 
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
            {text}
        </button>
    );
}
