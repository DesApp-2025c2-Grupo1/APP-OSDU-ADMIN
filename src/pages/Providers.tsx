import React, { useState } from "react";
import { OptionsMenu } from "../components/OptionsMenu";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import SearchDropdown from "../components/SearchDropdown";

type Prestador = {
  cuilCuit: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  centroMedico: string;
};

export function Prestadores() {
  const [prestadores] = useState<Prestador[]>([
    {
      cuilCuit: "23-42054012-9",
      nombre: "Ramon",
      apellido: "Carrillo",
      especialidad: "Pediatría",
      telefono: "1144585907",
      centroMedico: "-"
    },
    {
      cuilCuit: "20-47875036-7",
      nombre: "Jose",
      apellido: "Grienson",
      especialidad: "Resonancias",
      telefono: "1144585909",
      centroMedico: "H. Italiano"
    },
    {
      cuilCuit: "21-1780879-3",
      nombre: "Rene",
      apellido: "Favaloro",
      especialidad: "Clínico",
      telefono: "11474125",
      centroMedico: "H. Posadas"
    }
  ]);

  const OPTIONS = [
    { value: "cuilCuit", label: "CUIL/CUIT" },
    { value: "nombre", label: "Nombre" },
    { value: "apellido", label: "Apellido" },
    { value: "especialidad", label: "Especialidad" },
    { value: "centroMedico", label: "Centro médico" }
  ];

  const handleOptionClick = (option: string, prestador: Prestador) => {
    console.log(`Opción: ${option}`, prestador);
    
    if (option === "Editar") {
      // Lógica para editar
    }
    if (option === "Ver Detalles") {
      // Lógica para ver detalles
    }
    if (option === "Dar de Baja") {
      // Lógica para dar de baja
    }
  };

  const handleSearch = (field: string, query: string) => {
    console.log("Buscar:", field, query);
    // Implementar lógica de búsqueda
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchDropdown
            options={OPTIONS}
            placeholder="Buscar"
            onSearch={handleSearch}
            className="w-full sm:w-96"
          />
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded-lg font-semibold hover:bg-[#5FA92C] hover:text-white transition">
              Ver profesionales
            </button>
            <button className="px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded-lg font-semibold hover:bg-[#5FA92C] hover:text-white transition">
              Ver centros
            </button>
          </div>
        </div>
        
        <ButtonAddAffiliate
          text="Agregar Prestador"
          onClick={() => console.log("Agregar prestador")}
        />
      </div>

      {/* Tabla de Prestadores */}
      <div className="rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["CUIL/CUIT", "Nombre", "Apellido", "Especialidad", "Teléfono", "Centro médico", ""].map(h => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prestadores.map((prestador, idx) => (
              <tr key={prestador.cuilCuit} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-3 text-sm">{prestador.cuilCuit}</td>
                <td className="px-4 py-3 text-sm">{prestador.nombre}</td>
                <td className="px-4 py-3 text-sm">{prestador.apellido}</td>
                <td className="px-4 py-3 text-sm">{prestador.especialidad}</td>
                <td className="px-4 py-3 text-sm">{prestador.telefono}</td>
                <td className="px-4 py-3 text-sm">{prestador.centroMedico}</td>
                <td className="px-4 py-3 text-center">
                  <OptionsMenu
                    affiliate={{
                      credencial: prestador.cuilCuit,
                      dni: prestador.cuilCuit,
                      nombre: prestador.nombre,
                      apellido: prestador.apellido
                    }}
                    onOptionClick={(option) => handleOptionClick(option, prestador)}
                    options={["Editar", "Ver Detalles", "Dar de Baja"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}