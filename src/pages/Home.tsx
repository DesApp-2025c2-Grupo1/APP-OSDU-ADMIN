import { useEffect, useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import { API_BASE_URL, apiFetch } from "../config/api";

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
      const endpoint = pending ? `${API_BASE_URL}/affiliates?status=false` : `${API_BASE_URL}/affiliates`;
      const response = await apiFetch(endpoint, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      const affiliatesData = Array.isArray(data) ? data : data.affiliates;
      if (!affiliatesData) throw new Error("No se encontraron afiliados");

      const normalized = affiliatesData.map((a: any) => {
        let formattedDate = a.fecha_nacimiento || a.fechaNacimiento || "";
        if (formattedDate && formattedDate.includes('-')) {
          const d = new Date(formattedDate);
          if (!isNaN(d.getTime())) {
             formattedDate = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
          }
        }
        
        return {
          ...a,
          nombre: a.nombre || "",
          apellido: a.apellido || "",
          dni: a.dni || a.nroDocumento || "",
          credencial: a.credencial || `PENDING-${a.nroDocumento || a.id}`,
          fecha_nacimiento: formattedDate,
          direccion: a.direccion || "",
          activo: a.activo,
        };
      });

      setAffiliates(normalized);
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
      const res = await apiFetch(`${API_BASE_URL}/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
        credentials: "include"
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
      await apiFetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.dni}/schedule-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha: fechaISO }),
          credentials: "include"
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
      const response = await apiFetch(`${API_BASE_URL}/affiliates/${updatedAffiliate.dni}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAffiliate),
        credentials: "include"
      });

      if (!response.ok) throw new Error("Error al actualizar afiliado");

      // Recargar datos completos del afiliado
      const updatedResponse = await apiFetch(`${API_BASE_URL}/affiliates/affiliate/${updatedAffiliate.dni}`, {
        credentials: "include"
      });
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
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-700 text-slate-800">Afiliados</h1>
          <p className="text-xs text-slate-400">Gestión de afiliados y grupos familiares</p>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search bar y controles */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar afiliado por nombre, DNI, credencial..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
                />
                {query && (
                  <button 
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-600 bg-white"
              >
                {OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowPending(!showPending)}
                className={`px-4 py-2 text-xs font-600 rounded-lg transition-colors ${
                  showPending
                    ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {showPending ? "Ver Activos" : "Ver Pendientes"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-500 text-slate-400">
              Mostrando {filtered.length} de {affiliates.length} afiliados
            </div>
            <button
              onClick={() => navigate("/home/agregarAfiliado")}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors w-fit"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar Afiliado
            </button>
          </div>

          {/* Estado de carga */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-slate-600 text-sm font-medium">Cargando afiliados...</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
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

      {/* ✅ Toast visual */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </main>
  );
}
