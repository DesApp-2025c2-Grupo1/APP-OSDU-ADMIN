import { useEffect, useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import SearchDropdown from "../components/SearchDropdown";

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
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // 👈 NUEVO estado

  const navigate = useNavigate();

  // ✅ Carga de datos desde la API
  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        setLoading(true); // 👈 activa el efecto de carga
        const response = await fetch("http://localhost:3000/api/affiliates");
        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        const affiliatesData = Array.isArray(data) ? data : data.affiliates;

        if (!affiliatesData) throw new Error("No se encontraron afiliados en la respuesta");

        console.log("Afiliados cargados:", affiliatesData);
        setAffiliates(affiliatesData);
      } catch (error) {
        console.error("Error al obtener afiliados:", error);
      } finally {
        setLoading(false); // 👈 desactiva el efecto de carga
      }
    };

    fetchAffiliates();
  }, []);

  const fieldMap: Record<string, (a: Affiliate) => string> = {
    dni: (a) => a.dni,
    nombre: (a) => a.nombre,
    apellido: (a) => a.apellido,
    credencial: (a) => a.credencial,
    plan: (a) => a.plan?.nombre || "",
  };

  const filtered = useMemo(() => {
    if (!query) return affiliates;
    const q = norm(query);
    return affiliates.filter((a) => norm(fieldMap[field](a)).includes(q));
  }, [field, query, affiliates]);

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);

    switch (option) {
      case "Editar":
        setShowEditPopup(true);
        break;
      case "Ver grupo familiar":
        const grupoFamiliarId = affiliate.credencial.split("-")[0];
        navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
        break;
      case "Ver detalles":
        setShowViewPopup(true);
        break;
      case "Dar de baja":
        setShowDeleteDialog(true);
        break;
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <SearchDropdown
          options={OPTIONS}
          placeholder="Buscar"
          onSearch={(f, q) => {
            setField(f);
            setQuery(q);
          }}
          className="w-full md:w-2/3"
        />

        <div className="self-start md:self-auto">
          <ButtonAddAffiliate
            text="Agregar Afiliado"
            onClick={() => navigate("/home/agregarAfiliado")}
          />
        </div>
      </div>

      {/* ⚙️ Efecto de carga */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Cargando afiliados...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="rounded-md shadow-sm border border-gray-200">
            <AffiliatesTable affiliates={filtered} onOptionClick={handleOptionClick} />
          </div>

          {/* Popups */}
          {showViewPopup && selectedAffiliate && (
            <ViewAffiliatePopup
              affiliate={selectedAffiliate}
              onClose={() => setShowViewPopup(false)}
            />
          )}

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

          {showDeleteDialog && selectedAffiliate && (
            <ConfirmDeleteDialog
              open={showDeleteDialog}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={handleConfirmDelete}
              onSchedule={() => { }}
              affiliateName={selectedAffiliate.nombre}
              affiliateSurname={selectedAffiliate.apellido}
              affiliateDni={selectedAffiliate.dni}
              affiliateCredencial={selectedAffiliate.credencial}
            />
          )}
        </>
      )}
    </div>
  );
}
