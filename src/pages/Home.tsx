import { useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup"; 
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
  return s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function Home() {
  const [field, setField] = useState<string>(OPTIONS[0].value);
  const [query, setQuery] = useState<string>("");

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);

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
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
    }
    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedAffiliate) {
      console.log("Afiliado dado de baja:", selectedAffiliate);
    }
    setShowDeleteDialog(false);
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

      {/* Popup para Ver */}
      {showViewPopup && selectedAffiliate && (
        <ViewAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowViewPopup(false)}
        />
      )}

      {/* Modal de confirmación de baja */}
      {showDeleteDialog && selectedAffiliate && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
          affiliateCredencial={selectedAffiliate.credencial}
        />
      )}
    </div>
  );
}
