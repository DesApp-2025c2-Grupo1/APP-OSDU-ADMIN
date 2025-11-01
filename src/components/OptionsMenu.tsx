import React, { useState, useRef, useEffect } from "react";

interface OptionsMenuProps {
  affiliate: {
    credencial: string;
    dni: string;
    nombre: string;
    apellido: string;
    tipoDocumento?: string;
    nroDocumento?: string;
  };
  onOptionClick: (option: string, affiliate: any) => void;
  options: string[];
}

export function OptionsMenu({ affiliate, onOptionClick, options }: OptionsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const handleOptionSelect = (option: string) => {
    onOptionClick(option, affiliate);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleMenuClick}
        className="text-gray-700 hover:bg-gray-100 rounded px-2 py-1 text-xl cursor-pointer"
        title="Opciones"
      >
        &#8942;
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50"
        >
          <ul className="py-1">
            {options.map((option) => (
              <li key={option}>
                <button
                  onClick={() => handleOptionSelect(option)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
