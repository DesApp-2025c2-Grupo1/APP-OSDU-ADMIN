import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OptionsMenu } from "./OptionsMenu";
import { EditAffiliatePopup } from "./EditAffiliatePopup";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import ScheduledSuccessPopup from "./BajaExitosaPopup";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

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
    telefono: string;
  }>;

  plan: {
    idPlan: number;
    nombre: string;
  };

  // Campos opcionales o adicionales
  fechaNacimiento?: string;
  direccion2?: string;
  situaciones?: Array<{ situacion: string; fechaFinalizacion: string }>;
};


export type AffiliateRequest = {
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
    telefono: string;
  }>;

  plan: number

  // Campos opcionales o adicionales
  fechaNacimiento?: string;
  situaciones?: Array<{ situacion: string; fechaFinalizacion: string }>;
  familiares?:Array<{}>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // popup de éxito
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
    // acepta ambas variantes de texto
    if (opt === "ver miembros del grupo familiar" || opt === "ver grupo familiar") {
      const grupoFamiliarId = affiliate.credencial.split("-")[0];
      navigate(`/home/grupoFamiliar/${grupoFamiliarId}`);
      return;
    }
    if (opt === "dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }
    onOptionClick?.(option, affiliate);
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

  const handleScheduleDelete = (isoDateTime: string) => {
    console.log("Baja programada para:", selectedAffiliate, "en", isoDateTime);
    alert(`Baja programada para ${new Date(isoDateTime).toLocaleString()}`);
    setShowDeleteDialog(false);
    setSelectedAffiliate(null);
  };

  // paginación
  const totalPages = Math.max(1, Math.ceil(affiliates.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAffiliates = affiliates.slice(startIndex, endIndex);

  return (
    <>
      <div className="rounded-lg border border-gray-300 shadow-md bg-white">
        {/* DESKTOP: tabla con OptionsMenu */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#5FA92C] text-white">
              <tr>
                {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Plan", "Dirección", ""].map((h) => (
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
                      affiliate={{ credencial: a.credencial, dni: a.dni, nombre: a.nombre, apellido: a.apellido }}
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

        {/* MOBILE: cards con botones como Prestadores + botón azul extra */}
        <div className="md:hidden p-3">
          {currentAffiliates.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-gray-500">
              No hay afiliados para mostrar.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {currentAffiliates.map((a) => (
              <div key={a.credencial} className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase">Credencial</div>
                  <div className="font-semibold break-all">{a.credencial}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">DNI</div>
                    <div className="text-sm">{a.dni}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Fecha Nac.</div>
                    <div className="text-sm">{a.fechaNacimiento}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Nombre</div>
                    <div className="text-sm">{a.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Apellido</div>
                    <div className="text-sm">{a.apellido}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Fecha Nac.</div>
                    <div className="text-sm">{a.fecha_nacimiento}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Plan</div>
                    <div className="text-sm">{a.plan.nombre}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase">Dirección</div>
                    <div className="text-sm">{a.direccion}</div>
                  </div>
                </div>

                {/* Botones: MISMA estética que Prestadores */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOptionClick("Ver detalles", a)}
                    className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => handleOptionClick("Editar", a)}
                    className="px-3 py-2 text-sm border-2 rounded-md border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleOptionClick("Dar de baja", a)}
                    className="px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold"
                  >
                    Dar de baja
                  </button>

                  <button
                    onClick={() => handleOptionClick("Ver miembros del grupo familiar", a)}
                    className="px-3 py-2 text-sm border-2 rounded-md border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    Ver miembros del grupo familiar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer paginación */}
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 sm:hidden">
              {affiliates.length === 0 ? 0 : startIndex + 1}
              –{Math.min(endIndex, affiliates.length)} de {affiliates.length}
            </span>
            <span className="hidden sm:inline text-sm text-gray-700">
              Mostrando {affiliates.length === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, affiliates.length)} de {affiliates.length} afiliados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 sm:hidden">
              {safePage}/{totalPages}
            </span>
            <span className="hidden sm:inline text-sm text-gray-700">
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
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          onSchedule={handleScheduleDelete}   // ✅ <---- esta línea es la que faltaba
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
          affiliateCredencial={selectedAffiliate.credencial}
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
