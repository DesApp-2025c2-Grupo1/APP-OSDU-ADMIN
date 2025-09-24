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
      <div className="flex relative">
        {/* Botón dropdown */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-3 border border-gray-300 bg-white
            rounded-l-md hover:bg-gray-50"
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
          <div className="absolute top-[40px] left-0 bg-white border border-white rounded-md shadow-lg z-20 w-[175px]">
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

        {/* Input */}
        <div className="relative w-1/2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${placeholder} por ${fieldLabel}`}
            className="
            w-full
            p-2.5
            text-sm
            text-gray-900
            border
            bg-white
            border-gray-300
            rounded-r-md
            "
          />
          <button type="submit">
            <svg
              className="w-5 h-5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2"
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
            <span className="sr-only">Buscar</span>
          </button>
        </div>
      </div>
    </form>
  );
}
