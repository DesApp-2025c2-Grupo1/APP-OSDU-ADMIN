import { useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import SearchDropdown from "../components/SearchDropdown";
import { useAffiliates } from "../hocks/UseAffiliate";

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
  const [showEditPopup, setShowEditPopup] = useState(false);

  const navigate = useNavigate();

  // Usar el hook para obtener afiliados del endpoint
  const { affiliates, loading, error } = useAffiliates();

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
  }, [field, query, affiliates]);

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    console.log(selectedAffiliate)

    if (option === "Editar") {
      setShowEditPopup(true);
    }
    if (option === "Ver grupo familiar") {
      const grupoFamiliarId = affiliate.idGrupoFamiliarFK;
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
    }
    if (option === "Ver detalles") {
      setShowViewPopup(true);
    }
    if (option === "Dar de baja") {
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

  // Manejo de estados de carga y error
  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FA92C]"></div>
            <p className="mt-2 text-gray-600">Cargando afiliados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error al cargar afiliados</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#5FA92C] text-white rounded hover:bg-[#4d8a23] transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        {/* 🔍 Buscador */}
        <SearchDropdown
          options={OPTIONS}
          placeholder="Buscar"
          onSearch={(f, q) => { setField(f); setQuery(q); }}
          className="w-full md:w-2/3"
        />

        {/* ➕ Botón: pegado a la izquierda en mobile, normal en desktop */}
        <div className="self-start md:self-auto">
          <ButtonAddAffiliate
            text="Agregar Afiliado"
            onClick={() => navigate("/home/agregarAfiliado")}
          />
        </div>
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

      {/* Popup para Editar */}
      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowEditPopup(false)}
          onSave={(updatedAffiliate) => {
            console.log("Afiliado editado:", updatedAffiliate);
            setShowEditPopup(false);
          }}
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