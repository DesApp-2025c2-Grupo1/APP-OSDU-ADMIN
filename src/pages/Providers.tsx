import React, { useMemo, useState } from "react";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import SearchDropdown from "../components/SearchDropdown";
import { ProvidersTable } from "../components/ProvidersTable";
import type { Prestador } from "../model/Provider.model";
import { providersMock } from "../data/providers";

type ProviderField = keyof Pick<
  Prestador,
  "cuilCuit" | "nombreCompleto"
>;

export function Prestadores() {
  const [prestadores] = useState<Prestador[]>(providersMock);


  const [field, setField] = useState<ProviderField>("cuilCuit");
  const [query, setQuery] = useState("");


  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "profesional" | "centro">("todos");

  const handleOptionClick = (option: string, prestador: Prestador) => {
    console.log(`Opción: ${option}`, prestador);
  };

  const handleSearch = (f: string, q: string) => {
    setField(f as ProviderField);
    setQuery(q);
  };


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = prestadores;


    if (tipoFiltro !== "todos") {
      result = result.filter((p) => p.tipo === tipoFiltro);
    }


    if (q) {
      result = result.filter((p) =>
        String(p[field] ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [prestadores, field, query, tipoFiltro]);

  return (
    <div className="w-full p-6 space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Dropdown de búsqueda */}
          <SearchDropdown
            options={[
              { value: "cuilCuit", label: "CUIL/CUIT" },
              { value: "nombreCompleto", label: "Nombre" },
            ]}
            placeholder="Buscar"
            onSearch={handleSearch}
            className="w-full sm:w-96"
          />

          {/* Botones de filtro */}
          <div className="flex gap-2">
            <button
              onClick={() => setTipoFiltro("profesional")}
              className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                tipoFiltro === "profesional"
                  ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                  : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
              }`}
            >
              Ver profesionales
            </button>

            <button
              onClick={() => setTipoFiltro("centro")}
              className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                tipoFiltro === "centro"
                  ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                  : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
              }`}
            >
              Ver centros
            </button>

            <button
              onClick={() => setTipoFiltro("todos")}
              className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                tipoFiltro === "todos"
                  ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                  : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
              }`}
            >
              Ver todos
            </button>
          </div>
        </div>

        {/* Botón agregar */}
        <ButtonAddAffiliate
          text="Agregar Prestador"
          onClick={() => console.log("Agregar prestador")}
        />
      </div>

      {/* Tabla de Prestadores */}
      <div className="rounded-md shadow-sm border border-gray-200">
              
      </div>
      <ProvidersTable
        prestadores={filtered}
        onOptionClick={handleOptionClick}
        pageSize={5}
      />
    </div>
  );
}
