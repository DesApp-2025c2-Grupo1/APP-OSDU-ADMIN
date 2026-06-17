import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import ScheduledSuccessPopup from "./BajaExitosaPopup";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { API_BASE_URL, apiFetch } from "../config/api";
import { useModalPresence } from "../context/ModalContext";

export type Affiliate = {
  id: number;
  grupoFamiliar: number;
  tipoDocumento: string;
  apellido: string;
  credencial: string;
  fecha_nacimiento: string;
  direccion: string;
  dni: string;
  nombre: string;
  parentesco: string;
  status?: boolean;

  email: Array<{
    idEmail: number;
    email: string;
  }>;

  telefonos: Array<{
    idTelefono: number;
    telefono: string;
  }>;

  plan: {
    idPlan: number;
    nombre: string;
  };

  fechaNacimiento?: string;
  direccion2?: string;

  situaciones?: Array<{
    idSituacionAfiliado: number;
    fechaInicio: string;
    fechaFin: string | null;
    situacionTerapeutica: {
      idSituacion: number;
      nombre: string;
    };
  }>;
};


interface AffiliatesTableProps {
  affiliates: Affiliate[];
  onOptionClick: (option: string, affiliate: Affiliate) => void;
  onAffiliateDeleted?: () => void;
  onAffiliateUpdated?: (affiliate: Affiliate) => void;
}

export function AffiliatesTable({
  affiliates,
  onOptionClick,
  onAffiliateDeleted,
  onAffiliateUpdated
}: AffiliatesTableProps) {
  const navigate = useNavigate();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successISO, setSuccessISO] = useState<string>("");
  const [successName, setSuccessName] = useState<string>("");

  useModalPresence(
    "affiliates-table-modals",
    showEditPopup || showDeleteDialog || showSuccess
  );

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    const opt = option.trim().toLowerCase();

    if (opt === "editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
      return;
    }
    if (opt === "ver detalles") {
      onOptionClick?.("Ver detalles", affiliate);
      return;
    }
    if (opt === "ver miembros del grupo familiar" || opt === "ver grupo familiar") {
      navigate(`/home/grupoFamiliar/${affiliate.dni}`);
      return;
    }
    if (opt === "dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }

    onOptionClick?.(option, affiliate);
  };

  const handleSaveAffiliate = async (data: any) => {
    if (!selectedAffiliate?.id) return;
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar afiliado");
      }

      const updated = await response.json();
      onAffiliateUpdated?.(updated);
      setShowEditPopup(false);
      setSelectedAffiliate(null);
    } catch (error) {
      alert("Error al actualizar el afiliado. Por favor, intente nuevamente.");
    }
  };




  const handleConfirmDelete = async () => {
    if (!selectedAffiliate?.id) return;
    setIsDeleting(true);

    try {
      // El backend no tiene DELETE — "dar de baja" desactiva el afiliado
      const response = await apiFetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.id}/deactivate`,
        { method: "PUT" }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo dar de baja al afiliado");
      }

      onAffiliateDeleted?.();
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleDelete = async (isoDateTime: string) => {
    if (!selectedAffiliate) return;

    try {
      const response = await apiFetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.dni}/schedule-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledDate: isoDateTime }),
        }
      );

      if (!response.ok) throw new Error("Error al programar la baja");

      setSuccessISO(isoDateTime);
      setSuccessName(`${selectedAffiliate.nombre} ${selectedAffiliate.apellido}`);
      setShowSuccess(true);

      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    } catch (error) {
    }
  };

  const totalPages = Math.max(1, Math.ceil(affiliates.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAffiliates = affiliates.slice(startIndex, endIndex);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabla de escritorio */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", ""].map((h) => (
                    <th 
                      key={h} 
                      className="text-left text-xs font-600 text-slate-400 uppercase tracking-wider px-6 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentAffiliates.map((a) => (
                  <tr key={a.credencial} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-500 text-slate-700">{a.credencial}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.dni}</td>
                    <td className="px-6 py-4 text-sm font-500 text-slate-700">{a.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.apellido}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.fecha_nacimiento}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.plan?.nombre || (a as any).plan_type || "-"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.direccion}</td>
                    <td className="px-4 py-4 text-right">
                      <OptionsMenu
                        affiliate={a}
                        options={["Editar", "Ver Detalles", "Dar de Baja", "Ver Grupo Familiar"]}
                        onOptionClick={(opt) => handleOptionClick(opt, a)}
                      />
                    </td>
                  </tr>
                ))}

                {currentAffiliates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                      No hay afiliados para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista móvil */}
        <div className="md:hidden">
          {currentAffiliates.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-400">
              No hay afiliados para mostrar.
            </div>
          )}

          <div className="divide-y divide-slate-50">
            {currentAffiliates.map((a) => (
              <div 
                key={a.credencial || a.dni} 
                className="px-4 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-700">{a.nombre} {a.apellido}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.credencial}</p>
                  </div>
                  <OptionsMenu
                    affiliate={a}
                    options={["Editar", "Ver Detalles", "Dar de Baja", "Ver Grupo Familiar"]}
                    onOptionClick={(opt) => handleOptionClick(opt, a)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-500">DNI</span>
                    <p className="text-slate-600 mt-0.5">{a.dni}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-500">Fecha Nac.</span>
                    <p className="text-slate-600 mt-0.5">{a.fecha_nacimiento}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-500">Plan</span>
                    <p className="text-slate-600 mt-0.5">{a.plan?.nombre || (a as any).plan_type || "-"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-500">Dirección</span>
                    <p className="text-slate-600 mt-0.5 truncate">{a.direccion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginación mejorada */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-500 text-slate-400">
            Página {safePage} de {totalPages} ({affiliates.length} afiliados)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <NavigateBeforeIcon fontSize="small" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <NavigateNextIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveAffiliate}
        />
      )}

      {showDeleteDialog && selectedAffiliate && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onClose={() => !isDeleting && setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          onSchedule={handleScheduleDelete}
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
          affiliateCredencial={selectedAffiliate.credencial}
          isDeleting={isDeleting}
        />
      )}

      <ScheduledSuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        fechaISO={successISO}
        nombre={successName}
      />
    </>
  );
}
