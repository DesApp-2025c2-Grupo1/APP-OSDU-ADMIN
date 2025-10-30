import { OptionsMenu } from "./OptionsMenu";

export type FamilyMember = {
  credencial: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  plan: string;
  direccion: string;
};

interface FamilyGroupTableProps {
  members: FamilyMember[];
  onOptionClick: (option: string, member: FamilyMember) => void;
}

export function FamilyGroupTable({ members, onOptionClick }: FamilyGroupTableProps) {
  const handleOptionClick = (option: string, member: FamilyMember) => {
    onOptionClick(option, member);
  };

  return (
    <div className="rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#5FA92C] text-white">
          <tr>
            {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", ""].map(
              (h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((m, idx) => (
            <tr key={m.credencial} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="px-4 py-2 text-sm">{m.credencial}</td>
              <td className="px-4 py-2 text-sm">{m.dni}</td>
              <td className="px-4 py-2 text-sm">{m.nombre}</td>
              <td className="px-4 py-2 text-sm">{m.apellido}</td>
              <td className="px-4 py-2 text-sm">{m.fechaNacimiento}</td>
              <td className="px-4 py-2 text-sm">{m.plan}</td>
              <td className="px-4 py-2 text-sm">{m.direccion}</td>
              <td className="px-4 py-2 text-center relative">
                <OptionsMenu 
                affiliate={m} 
                onOptionClick={handleOptionClick} 
                options={["Editar", "Dar de baja"]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
