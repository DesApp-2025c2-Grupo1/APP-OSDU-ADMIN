import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

export type Affiliate = {
  credencial: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  plan: string;
  direccion: string;
  parentesco?: string;
  tipoDocumento?: string;
  nroDocumento?: string;
  planMedico?: string;
  telefono?: string;
  telefono2?: string;
  email?: string;
  email2?: string;
  direccion2?: string;
  situaciones?: Array<{ situacion: string; fechaFinalizacion: string }>;
};

interface AffiliatesTableProps {
  affiliates: Affiliate[];
  onOptionClick: (option: string, affiliate: Affiliate) => void;
}

export function AffiliatesTable({ affiliates, onOptionClick }: AffiliatesTableProps) {
  const navigate = useNavigate();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      // Abrimos el modal
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
      return;
    }

    if (option === "Ver detalles") {
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
      return;
    }

    if (option === "Ver grupo familiar") {
      const grupoFamiliarId = affiliate.credencial.split("-")[0];
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
      return;
    }

    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }

    try {
      onOptionClick?.(option, affiliate);
    } catch {
      // Silencio: handler externo opcional
    }
  };

  const handleSaveAffiliate = (data: any) => {
    console.log("Datos actualizados del afiliado:", data);
    setShowEditPopup(false);
    setSelectedAffiliate(null);
  };

  const handleConfirmDelete = () => {
    console.log("Afiliado dado de baja:", selectedAffiliate);
    setShowDeleteDialog(false);
    setSelectedAffiliate(null);
  };

  // Cálculos de paginación
  const totalPages = Math.max(1, Math.ceil(affiliates.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAffiliates = affiliates.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {[
                "Credencial",
                "DNI",
                "Nombre",
                "Apellido",
                "Fecha Nac.",
                "Plan",
                "Dirección",
                "",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAffiliates.map((a, idx) => (
              <tr
                key={a.credencial}
                className={idx % 2 === 0 ? "bg-gray-50" : ""}
              >
                <td className="px-4 py-2 text-sm">{a.credencial}</td>
                <td className="px-4 py-2 text-sm">{a.dni}</td>
                <td className="px-4 py-2 text-sm">{a.nombre}</td>
                <td className="px-4 py-2 text-sm">{a.apellido}</td>
                <td className="px-4 py-2 text-sm">{a.fechaNacimiento}</td>
                <td className="px-4 py-2 text-sm">{a.plan}</td>
                <td className="px-4 py-2 text-sm">{a.direccion}</td>
                <td className="px-4 py-2 text-center relative">
                  <OptionsMenu
                    affiliate={a}
                    onOptionClick={handleOptionClick}
                    options={[
                      "Editar",
                      "Ver grupo familiar",
                      "Ver detalles",
                      "Dar de baja",
                    ]}
                  />
                </td>
              </tr>
            ))}

            {currentAffiliates.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No hay afiliados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Mostrando{" "}
              {affiliates.length === 0 ? 0 : startIndex + 1} a{" "}
              {Math.min(endIndex, affiliates.length)} de {affiliates.length}{" "}
              afiliados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Página {safePage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
              title="Página anterior"
            >
              <NavigateBeforeIcon />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
              title="Página siguiente"
            >
              <NavigateNextIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Popup de edición */}
      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveAffiliate}
        />
      )}

      {/* Diálogo de baja */}
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
    </>
  );
}
