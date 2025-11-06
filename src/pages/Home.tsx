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

  // ✅ CORRECCIÓN: Cambiar AffiliateT por Affiliate
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  // ✅ Carga de datos desde la API
  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
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
      console.log("🔍 DNI del afiliado:", affiliate.dni); 
      navigate(`/home/grupoFamiliar/${affiliate.dni}`); 
      break;
    case "Ver detalles":
      setShowViewPopup(true);
      break;
    case "Dar de baja":
      setShowDeleteDialog(true);
      break;
  }
};

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;

    try {
      // Llamada a la API para eliminar
      const response = await fetch(`http://localhost:3000/api/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar afiliado");

      console.log("Afiliado dado de baja:", selectedAffiliate);

      // Actualizar la lista local removiendo el afiliado eliminado
      setAffiliates((prev) => prev.filter((a) => a.dni !== selectedAffiliate.dni));
    } catch (error) {
      console.error("Error al eliminar afiliado:", error);
      alert("Error al eliminar el afiliado. Por favor, intenta nuevamente.");
    } finally {
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    }
  };

  const handleSaveEdit = async (updatedAffiliate: Affiliate) => {
    try {
      // Llamada a la API para actualizar
      const response = await fetch(`http://localhost:3000/api/affiliates/${updatedAffiliate.dni}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAffiliate),
      });

      if (!response.ok) throw new Error("Error al actualizar afiliado");

      const result = await response.json();
      console.log("Afiliado editado:", result);

      // Actualizar la lista local
      setAffiliates((prev) =>
        prev.map((a) => (a.dni === updatedAffiliate.dni ? updatedAffiliate : a))
      );

      setShowEditPopup(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al actualizar afiliado:", error);
      alert("Error al actualizar el afiliado. Por favor, intenta nuevamente.");
    }
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
            <div className="w-10 h-10 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin mb-3"></div>
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
              onSave={handleSaveEdit}
            />
          )}

          {showDeleteDialog && selectedAffiliate && (
            <ConfirmDeleteDialog
              open={showDeleteDialog}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={handleConfirmDelete}
              onSchedule={() => {
                console.log("Baja programada para:", selectedAffiliate);
                // Aquí puedes implementar la lógica de baja programada
              }}
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