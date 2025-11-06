import { useEffect, useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import SearchDropdown from "../components/SearchDropdown";

// 🔹 Pequeño Toast (notificación visual sin alert)
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
    {message}
    <button className="ml-3 font-bold text-white" onClick={onClose}>
      ×
    </button>
  </div>
);

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
  const [field, setField] = useState(OPTIONS[0].value);
  const [query, setQuery] = useState("");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // 🟩 Función para mostrar mensaje visual (toast)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 🔹 Carga de afiliados desde API
  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/affiliates");
      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      const affiliatesData = Array.isArray(data) ? data : data.affiliates;

      if (!affiliatesData) throw new Error("No se encontraron afiliados");

      setAffiliates(affiliatesData);
    } catch (error) {
      console.error("Error al obtener afiliados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // 🟧 Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(`http://localhost:3000/api/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar afiliado");

      // Actualizamos el estado local
      setAffiliates((prev) => prev.filter((a) => a.dni !== selectedAffiliate.dni));
      showToast(`Afiliado ${selectedAffiliate.nombre} eliminado correctamente`);
    } catch (error) {
      console.error("Error al eliminar afiliado:", error);
      showToast("Error al eliminar el afiliado");
    } finally {
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    }
  };

  // 🟦 Guardar edición
  const handleSaveEdit = async (updatedAffiliate: Affiliate) => {
    try {
      const response = await fetch(`http://localhost:3000/api/affiliates/${updatedAffiliate.dni}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAffiliate),
      });

      if (!response.ok) throw new Error("Error al actualizar afiliado");

      setAffiliates((prev) =>
        prev.map((a) => (a.dni === updatedAffiliate.dni ? updatedAffiliate : a))
      );

      setShowEditPopup(false);
      setSelectedAffiliate(null);
      showToast(`Afiliado ${updatedAffiliate.nombre} actualizado`);
    } catch (error) {
      console.error("Error al actualizar afiliado:", error);
      showToast("Error al actualizar el afiliado");
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

      {/* Estado de carga */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Cargando afiliados...</p>
          </div>
        </div>
      ) : (
        <>
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
              onSchedule={() => console.log("Baja programada para:", selectedAffiliate)}
              affiliateName={selectedAffiliate.nombre}
              affiliateSurname={selectedAffiliate.apellido}
              affiliateDni={selectedAffiliate.dni}
              affiliateCredencial={selectedAffiliate.credencial}
            />
          )}
        </>
      )}

      {/* ✅ Toast visual */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
