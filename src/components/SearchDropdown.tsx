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
      <div className="searchbar__wrapper">
        {/* Botón dropdown */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="searchbar__dropdown-btn"
        >
          {fieldLabel}
          <svg
            className="searchbar__dropdown-icon"
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
          <div className="searchbar__dropdown">
            <ul className="searchbar__dropdown-list">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className="searchbar__dropdown-item"
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input */}
        <div className="searchbar__input-wrapper">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${placeholder} por ${fieldLabel}`}
            className="searchbar__input"
          />
          <button type="submit" className="searchbar__submit-btn">
            <svg
              className="searchbar__submit-icon"
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
