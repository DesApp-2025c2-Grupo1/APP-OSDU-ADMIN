import React, { useState } from "react";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
<<<<<<< Updated upstream
=======
import { useNavigate } from "react-router-dom";
import { ViewAffiliatePopup } from "./ViewAffiliatePopup";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
>>>>>>> Stashed changes

export type Affiliate = {
  credencial: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  plan: string;
  direccion: string;
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

export function AffiliatesTable({ affiliates }: AffiliatesTableProps) {
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
    null
  );
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
<<<<<<< Updated upstream
=======
  const [showViewPopup, setShowViewPopup] = useState(false);

  // PAGINACIÓN: Estados simples
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
>>>>>>> Stashed changes

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
    }

<<<<<<< Updated upstream
=======
    if (option === "Ver detalles") {
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
    }

    if (option === "Ver grupo familiar") {
      const grupoFamiliarId = affiliate.credencial.split("-")[0];
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
    }

>>>>>>> Stashed changes
    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
    }
  };

  const handleSaveAffiliate = (data: any) => {
    console.log("Datos guardados:", data);
  };

  const handleConfirmDelete = () => {
    console.log("Afiliado dado de baja:", selectedAffiliate);
    setShowDeleteDialog(false);
    setSelectedAffiliate(null);
  };

  // PAGINACIÓN: Calcular qué afiliados mostrar
  const totalPages = Math.ceil(affiliates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAffiliates = affiliates.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", ""].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
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
                  <OptionsMenu affiliate={a} onOptionClick={handleOptionClick} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN: Controles */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          {/* Izquierda: Info y selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, affiliates.length)} de {affiliates.length} afiliados
            </span>
          </div>

          {/* Derecha: Botones de navegación */}
          <div className="flex items-center gap-2">

            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <NavigateBeforeIcon />
            </button>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <NavigateNextIcon />
            </button>
          </div>
        </div>
      </div>

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
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
        />
      )}
    </>
  );
}