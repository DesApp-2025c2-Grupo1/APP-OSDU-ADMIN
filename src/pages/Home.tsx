import { useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import SearchDropdown from "../components/SearchDropdown";
import { affiliates } from "../data/affiliates";


const OPTIONS = [
  { value: "dni", label: "DNI" },
  { value: "nombre", label: "Nombre" },
  { value: "apellido", label: "Apellido" },
  { value: "credencial", label: "Credencial" },
  { value: "plan", label: "Plan" },
];

function norm(s: string) {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function Home() {
  const [field, setField] = useState<string>(OPTIONS[0].value);
  const [query, setQuery] = useState<string>("");
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

  const navigate = useNavigate();

  const fieldMap: Record<string, (a: Affiliate) => string> = {
    dni: (a) => a.dni,
    nombre: (a) => a.nombre,
    apellido: (a) => a.apellido,
    credencial: (a) => a.credencial,
    plan: (a) => a.plan,
  };

  const filtered = useMemo(() => {
    if (!query) return affiliates;
    const q = norm(query);
    return affiliates.filter((a) => norm(fieldMap[field](a)).includes(q));
  }, [field, query]);

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      navigate(`/home/editarAfiliado/${affiliate.credencial}`);
    }
    if (option === "Ver grupo familiar") {
      const grupoFamiliarId = affiliate.credencial.split("-")[0]; 
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
    }
    if (option === "Ver detalles") {
      navigate(`/home/detalleAfiliado/${affiliate.credencial}`);
    }
    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setOpenDelete(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAffiliate) {
      console.log("Eliminar:", selectedAffiliate.credencial);
    }
    setOpenDelete(false);
    setSelectedAffiliate(null);
  };

  return (
    <div className="w-full p-6 space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <SearchDropdown
          options={OPTIONS}
          placeholder="Buscar"
          onSearch={(f, q) => {
            setField(f);
            setQuery(q);
          }}
          className="w-full sm:w-2/3"
        />
        <ButtonAddAffiliate
          text="Agregar Afiliado"
          onClick={() => navigate("/home/agregarAfiliado")}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-md shadow-sm border border-gray-200">
        <AffiliatesTable affiliates={filtered} onOptionClick={handleOptionClick} />
      </div>

      {/* Modal de confirmación de baja */}
      <ConfirmDeleteDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
        affiliateName={selectedAffiliate?.nombre || ""}
        affiliateSurname={selectedAffiliate?.apellido || ""}
        affiliateDni={selectedAffiliate?.dni || ""}
      />
    </div>
  );
}
