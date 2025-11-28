import { useEffect, useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import SearchDropdown from "../components/SearchDropdown";
import { API_BASE_URL } from "../config/api";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPending, setShowPending] = useState(false);

  const navigate = useNavigate();

  // 🟩 Función para mostrar mensaje visual (toast)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 🔹 Carga de afiliados desde API
  const fetchAffiliates = async (pending: boolean) => {
    try {
      setLoading(true);
      const endpoint = pending ? `${API_BASE_URL}/affiliates/pending` : `${API_BASE_URL}/affiliates`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      const affiliatesData = Array.isArray(data) ? data : data.affiliates;
      if (!affiliatesData) throw new Error("No se encontraron afiliados");

      setAffiliates(affiliatesData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates(showPending);
  }, [showPending]);

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
      case "Ver grupo familiar": {
        // 👉 Navegá con la BASE de la credencial (antes del guion)
        const base = affiliate.credencial?.split("-")[0] ?? affiliate.dni;
        navigate(`/home/grupoFamiliar/${base}`);
        break;
      }
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

    setIsDeleting(true);
    try {
      // Si tu API borra por DNI (como en tu ejemplo actual):
      const res = await fetch(`${API_BASE_URL}/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) throw new Error("Error al eliminar afiliado");

      // 🔸 Actualizamos UI:
      // - Si es TITULAR (sufijo -01), quitamos TODO el grupo (misma base).
      // - Si es MIEMBRO, quitamos solo esa credencial.
      const cred = selectedAffiliate.credencial || "";
      const isTitular = cred.endsWith("-01");
      const base = cred.split("-")[0];

      setAffiliates((prev) => {
        if (isTitular && base) {
          return prev.filter((a) => a.credencial.split("-")[0] !== base);
        }
        return prev.filter((a) => a.dni !== selectedAffiliate.dni);
      });

      showToast(`Afiliado ${selectedAffiliate.nombre} eliminado correctamente`);
    } catch (error) {
      showToast("Error al eliminar el afiliado");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    }
  };

  // 🗓️ Baja programada (placeholder – ajustá al endpoint real)
  const handleScheduleDelete = async (fechaISO: string) => {
    if (!selectedAffiliate) return;
    try {
      await fetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.dni}/schedule-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha: fechaISO }),
        }
      );
      showToast(`Baja programada para ${selectedAffiliate.nombre}`);
    } catch (e) {
      showToast("No se pudo programar la baja");
    } finally {
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    }
  };

  // 🟦 Guardar edición
  const handleSaveEdit = async (updatedAffiliate: Affiliate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/affiliates/${updatedAffiliate.dni}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAffiliate),
      });

      if (!response.ok) throw new Error("Error al actualizar afiliado");

      // Recargar datos completos del afiliado
      const updatedResponse = await fetch(`${API_BASE_URL}/affiliates/affiliate/${updatedAffiliate.dni}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();

        setAffiliates((prev) =>
          prev.map((a) => (a.dni === updatedAffiliate.dni ? updatedData.affiliates : a))
        );
      }

      setShowEditPopup(false);
      setSelectedAffiliate(null);
      showToast(`Afiliado ${updatedAffiliate.nombre} actualizado`);
    } catch (error) {
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

        <div className="self-start md:self-auto flex gap-2">
          <button
            onClick={() => setShowPending(!showPending)}
            className={`px-4 py-2 rounded font-medium transition-colors ${showPending
              ? "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
          >
            {showPending ? "Ver Activos" : "Ver Pendientes"}
          </button>
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
            <AffiliatesTable
              affiliates={filtered}
              onOptionClick={handleOptionClick}
              onAffiliateDeleted={(dni) => {
                setAffiliates(prev => prev.filter(a => a.dni !== dni));
                showToast("Afiliado eliminado correctamente");
              }}
              onAffiliateUpdated={(updated) => {
                setAffiliates(prev =>
                  prev.map(a => (a.dni === updated.dni ? updated : a))
                );
                showToast("Afiliado actualizado correctamente");
              }}
            />
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
              onSchedule={handleScheduleDelete}
              affiliateName={selectedAffiliate.nombre}
              affiliateSurname={selectedAffiliate.apellido}
              affiliateDni={selectedAffiliate.dni}
              affiliateCredencial={selectedAffiliate.credencial}
              isDeleting={isDeleting}
            />
          )}
        </>
      )}

      {/* ✅ Toast visual */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
