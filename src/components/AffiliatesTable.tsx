import React, { useState } from "react";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

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

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    console.log(
      `Opción seleccionada: ${option} para ${affiliate.nombre} ${affiliate.apellido}`
    );

    if (option === "Editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
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
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#5FA92C", color: "white" }}>
            <th>Credencial</th>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha De Nac.</th>
            <th>Plan</th>
            <th>Dirección</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((a) => (
            <tr key={a.credencial}>
              <td>{a.credencial}</td>
              <td>{a.dni}</td>
              <td>{a.nombre}</td>
              <td>{a.apellido}</td>
              <td>{a.fechaNacimiento}</td>
              <td>{a.plan}</td>
              <td>{a.direccion}</td>
              <td>
                <OptionsMenu affiliate={a} onOptionClick={handleOptionClick} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
