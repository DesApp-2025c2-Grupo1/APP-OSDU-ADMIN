import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { affiliates } from "../data/affiliates";
import type { Affiliate } from "../components/AffiliatesTable";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import { OptionsMenu } from "../components/OptionsMenu";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";

export function GrupoFamiliar() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filtrar miembros del grupo por credencial
  const members = affiliates.filter(a => a.credencial.startsWith(`${grupoId}-`));

  // Buscar titular: el que tenga parentesco === "Titular" o el primero
  const titular = members.find(m => m.parentesco?.toLowerCase() === "titular") || members[0];

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
    }
    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
    }
  };

  const handleSaveAffiliate = (updated: Affiliate) => {
    console.log("Afiliado actualizado:", updated);
    setShowEditPopup(false);
    setSelectedAffiliate(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAffiliate) {
      console.log("Afiliado dado de baja:", selectedAffiliate);
      // Aquí podrías eliminar del array o hacer llamada API
    }
    setShowDeleteDialog(false);
    setSelectedAffiliate(null);
  };

  if (!titular || members.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Ver Grupo Familiar</h1>
        <p className="text-gray-600">No se encontraron miembros para el grupo {grupoId}.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ver Grupo Familiar</h1>

      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <p><strong>Nombre:</strong> {titular.nombre} {titular.apellido}</p>
        <p><strong>DNI:</strong> {titular.dni}</p>
        <p className="uppercase font-semibold">TITULAR</p>
      </div>

      <div className="rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", "Parentesco", ""].map(h => (
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
            {members.map((m, idx) => (
              <tr key={m.credencial} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-2 text-sm">{m.credencial}</td>
                <td className="px-4 py-2 text-sm">{m.dni}</td>
                <td className="px-4 py-2 text-sm">{m.nombre}</td>
                <td className="px-4 py-2 text-sm">{m.apellido}</td>
                <td className="px-4 py-2 text-sm">{m.fechaNacimiento}</td>
                <td className="px-4 py-2 text-sm">{m.plan}</td>
                <td className="px-4 py-2 text-sm">{m.direccion}</td>
                <td className="px-4 py-2 text-sm">{m.parentesco || "-"}</td>
                <td className="px-4 py-2 text-center">
                  <OptionsMenu
                    affiliate={m}
                    onOptionClick={handleOptionClick}
                    options={["Editar", "Dar de baja"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup para Editar */}
      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveAffiliate}
        />
      )}

      {/* Popup para Confirmar Baja */}
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
    </div>
  );
}
