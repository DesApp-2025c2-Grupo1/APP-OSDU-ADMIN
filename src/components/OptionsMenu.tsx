import React, { useState, useRef, useEffect } from "react";

interface OptionsMenuProps {
  affiliate: {
    credencial: string;
    dni: string;
    nombre: string;
    apellido: string;
  };
  onOptionClick: (option: string, affiliate: any) => void;
}

export function OptionsMenu({ affiliate, onOptionClick }: OptionsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOptionSelect = (option: string) => {
    onOptionClick(option, affiliate);
    setIsMenuOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className="options-btn"
        title="Opciones"
        onClick={handleMenuClick}
        style={{ 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          fontSize: "20px",
          padding: "5px 10px"
        }}
      >
        &#8942;
      </button>
      
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            right: "0",
            top: "30px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "180px",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: "5px 0" }}>
            <li>
              <button
                onClick={() => handleOptionSelect("Editar")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Editar
              </button>
            </li>
            <li>
              <button
                onClick={() => handleOptionSelect("Ver grupo familiar")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Ver grupo familiar
              </button>
            </li>
            <li>
              <button
                onClick={() => handleOptionSelect("Ver detalles")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Ver detalles
              </button>
            </li>
            <li>
              <button
                onClick={() => handleOptionSelect("Dar de baja")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 15px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Dar de baja
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}