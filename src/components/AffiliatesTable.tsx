import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import ScheduledSuccessPopup from "./BajaExitosaPopup";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { API_BASE_URL } from "../config/api";

export type Affiliate = {
  grupoFamiliar: number;
  tipoDocumento: string;
  apellido: string;
  credencial: string;
  fecha_nacimiento: string;
  direccion: string;
  dni: string;
  nombre: string;
  parentesco: string;

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
  onAffiliateDeleted?: (dni: string) => void;
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
    try {
      console.log("Datos que se envían al backend:", JSON.stringify(data, null, 2));

      const response = await fetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate?.dni}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error del servidor:", errorData);
        throw new Error(errorData.message || "Error al actualizar afiliado");
      }

      console.log("✅ Respuesta exitosa del servidor");

      // Recargar el afiliado actualizado
      const updatedResponse = await fetch(
        `${API_BASE_URL}/affiliates/affiliate/${selectedAffiliate?.dni}`
      );

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        console.log("📦 Afiliado actualizado:", updatedData);
        onAffiliateUpdated?.(updatedData.affiliates);
      }

      setShowEditPopup(false);
      setSelectedAffiliate(null);

    } catch (error) {
      console.error("❌ Error al actualizar afiliado:", error);
      alert("Error al actualizar el afiliado. Por favor, intente nuevamente.");
    }
  };




  // ✅ Eliminación inmediata sin alertas
  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.dni}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo eliminar el afiliado");
      }

      // ✅ Notifica al padre para recargar
      onAffiliateDeleted?.(selectedAffiliate.dni);

      // Cierra todo sin mostrar alertas
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);

    } catch (error) {
      console.error("❌ Error al eliminar afiliado:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleDelete = async (isoDateTime: string) => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(
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
      console.error("❌ Error al programar baja:", error);
    }
  };

  const totalPages = Math.max(1, Math.ceil(affiliates.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAffiliates = affiliates.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-lg border border-gray-300 shadow-md bg-white">
        {/* Tabla de escritorio */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#5FA92C] text-white">
              <tr>
                {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", ""].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAffiliates.map((a, idx) => (
                <tr key={a.credencial} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2 text-sm">{a.credencial}</td>
                  <td className="px-4 py-2 text-sm">{a.dni}</td>
                  <td className="px-4 py-2 text-sm">{a.nombre}</td>
                  <td className="px-4 py-2 text-sm">{a.apellido}</td>
                  <td className="px-4 py-2 text-sm">{a.fecha_nacimiento}</td>
                  <td className="px-4 py-2 text-sm">{a.plan.nombre}</td>
                  <td className="px-4 py-2 text-sm">{a.direccion}</td>
                  <td className="px-2 py-2 text-right w-10">
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
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                    No hay afiliados para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de paginación */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-700">
            Página {safePage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2 py-1 border rounded"
            >
              <NavigateBeforeIcon />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2 py-1 border rounded"
            >
              <NavigateNextIcon />
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
