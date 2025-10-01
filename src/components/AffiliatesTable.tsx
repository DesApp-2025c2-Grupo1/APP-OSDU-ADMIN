import React, { useState } from "react";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useNavigate } from "react-router-dom";
import { ViewAffiliatePopup } from "./ViewAffiliatePopup";

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

export function AffiliatesTable({ affiliates }: AffiliatesTableProps) {
  const navigate = useNavigate();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(
    null
  );
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);


  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
    }

    if (option === "Ver detalles") {
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true)
    }

    if (option === "Ver grupo familiar") {
      const grupoFamiliarId = affiliate.credencial.split("-")[0];
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
    }

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
            {affiliates.map((a, idx) => (
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
                    options={["Editar", "Ver grupo familiar", "Ver detalles", "Dar de baja"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveAffiliate}
        />
      )}

      {showViewPopup && selectedAffiliate && (
        <ViewAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowViewPopup(false)}
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
          affiliateCredencial={selectedAffiliate.credencial}
        />
      )}
    </>
  );
}
