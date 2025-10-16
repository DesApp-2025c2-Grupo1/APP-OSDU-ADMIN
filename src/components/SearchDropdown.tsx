import { useState } from "react";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  placeholder?: string;
  onSearch?: (field: string, query: string) => void;
  className?: string;
};

export default function SearchDropdown({
  options,
  placeholder = "Buscar…",
  onSearch,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [field, setField] = useState(options[0].value);
  const [fieldLabel, setFieldLabel] = useState(options[0].label);
  const [query, setQuery] = useState("");

  const handleSelect = (opt: Option) => {
    setField(opt.value);
    setFieldLabel(opt.label);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(field, query);
  };

  return (
    <form onSubmit={handleSubmit} className={`searchbar ${className}`}>
      <div className="flex relative items-stretch">
        {/* Botón dropdown (misma altura que input) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="
            inline-flex items-center gap-1 px-3 border border-gray-300 bg-white
            rounded-l-md hover:bg-gray-50
            whitespace-nowrap h-[42px]
          "
        >
          {fieldLabel}
          <svg
            className="w-3 h-3 ml-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {/* Lista de opciones */}
        {isOpen && (
          <div className="absolute top-[42px] left-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-full w-max">
            <ul className="py-1 px-1 text-sm text-gray-700">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className="w-full text-left px-3 py-3 bg-transparent hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input + lupa: wrapper con altura fija */}
        <div className="relative flex-1 h-[42px]">
          {/* Mobile */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="
              block md:hidden
              w-full h-full p-2.5 text-sm text-gray-900
              border bg-white border-gray-300 rounded-r-md
            "
          />
          {/* Desktop */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar por ${fieldLabel}`}
            className="
              hidden md:block
              w-full h-full p-2.5 text-sm text-gray-900
              border bg-white border-gray-300 rounded-r-md
            "
          />

          {/* Botón lupa centrado verticalmente respecto al wrapper */}
          <button
            type="submit"
            className="absolute right-2.5 inset-y-0 my-auto grid place-items-center"
            aria-label="Buscar"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
