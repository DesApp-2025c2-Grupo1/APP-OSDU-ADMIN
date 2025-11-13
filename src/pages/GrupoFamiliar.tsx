import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Affiliate } from "../components/AffiliatesTable";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import { AddFamiliarMember } from "../components/AddAffiliateMember";
import { OptionsMenu } from "../components/OptionsMenu";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import ScheduledSuccessPopup from "../components/BajaExitosaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { ButtonVolver } from "../util/ButtonVolver";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

// Tipo para el afiliado que viene del endpoint
interface AffiliateFromAPI {
  grupoFamiliar: number;
  tipoDocumento: string;
  apellido: string;
  credencial: string;
  direccion: string;
  dni: string;
  email: Array<{ idEmail: number; email: string }>;
  nombre: string;
  parentesco: string;
  telefonos: Array<{ idTelefono?: number; telefono: string }>;
  plan: { idPlan: number; nombre: string };
  fecha_nacimiento: string | null;
  situaciones?: Array<{
    idSituacionAfiliado: number;
    fechaInicio: string;
    fechaFin: string | null;
    situacionTerapeutica: {
      idSituacion: number;
      nombre: string;
    };
  }>;
}

// Tipo para la respuesta del endpoint
interface FamilyGroupAPIResponse {
  affiliates: AffiliateFromAPI[];
}

export function GrupoFamiliar() {
  const { dni } = useParams<{ dni: string }>();
  const navigate = useNavigate();

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddFamiliarPopup, setShowAddFamiliarPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para datos del API
  const [members, setMembers] = useState<Affiliate[]>([]);
  const [planNombre, setPlanNombre] = useState<string>("");
  const [grupoFamiliarId, setGrupoFamiliarId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // popup de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successISO, setSuccessISO] = useState<string>("");
  const [successName, setSuccessName] = useState<string>("");

  // Fetch del grupo familiar
  const fetchFamilyGroup = async () => {
    if (!dni) {
      setError("DNI no proporcionado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/api/affiliates/family/${dni}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: FamilyGroupAPIResponse = await response.json();
      console.log("Grupo familiar cargado:", data);

      if (!data.affiliates || data.affiliates.length === 0) {
        setError("No se encontraron afiliados en el grupo familiar");
        setLoading(false);
        return;
      }

      // Transformar y establecer miembros
      const transformedMembers: Affiliate[] = data.affiliates.map(apiAffiliate => ({
        grupoFamiliar: apiAffiliate.grupoFamiliar,
        tipoDocumento: apiAffiliate.tipoDocumento,
        apellido: apiAffiliate.apellido,
        credencial: apiAffiliate.credencial,
        fecha_nacimiento: apiAffiliate.fecha_nacimiento || "",
        fechaNacimiento: apiAffiliate.fecha_nacimiento || "",
        direccion: apiAffiliate.direccion,
        dni: apiAffiliate.dni,
        nombre: apiAffiliate.nombre,
        parentesco: apiAffiliate.parentesco,
        email: apiAffiliate.email || [],
        telefonos: apiAffiliate.telefonos || [],
        plan: apiAffiliate.plan,
        situaciones: apiAffiliate.situaciones || []
      }));

      setMembers(transformedMembers);
      setPlanNombre(data.affiliates[0].plan.nombre);
      setGrupoFamiliarId(data.affiliates[0].grupoFamiliar);
    } catch (err) {
      console.error("Error al cargar grupo familiar:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyGroup();
  }, [dni]);

  // Obtener el titular
  const titular = useMemo(() => {
    return members.find(m => m.parentesco === "Titular") || members[0] || null;
  }, [members]);

  const dniTitular = titular?.dni || dni || "";

  const determinarParentesco = (affiliate: Affiliate) => {
    if (affiliate.parentesco) return affiliate.parentesco;
    const partesCredencial = affiliate.credencial.split("-");
    if (partesCredencial.length !== 2) return "Familiar a cargo";
    const numeroCredencial = parseInt(partesCredencial[1]);
    switch (numeroCredencial) {
      case 1: return "Titular";
      case 2: return "Cónyuge";
      case 3:
      case 4:
      case 5: return "Hijo";
      default: return "Familiar a cargo";
    }
  };

  const handleAgregarFamiliar = () => setShowAddFamiliarPopup(true);

  const handleSaveFamiliar = async (nuevoFamiliar: any) => {
    try {
      const response = await fetch(`http://localhost:3000/api/affiliates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nuevoFamiliar,
          dni: dniTitular,
        }),
      });

      if (!response.ok) throw new Error("Error al agregar familiar");

      const result = await response.json();
      console.log("Nuevo familiar guardado:", result);

      // Recargar datos del grupo familiar
      await fetchFamilyGroup();

      setShowAddFamiliarPopup(false);
    } catch (error) {
      console.error("Error al guardar familiar:", error);
      alert("Error al agregar el familiar. Por favor, intenta nuevamente.");
    }
  };

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      if (!affiliate) {
        console.error("❌ Afiliado nulo al intentar editar");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
      return;
    }

    if (option === "Ver detalles") {
      if (!affiliate) {
        console.error("❌ Afiliado nulo al intentar ver detalles");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
      return;
    }

    if (option === "Dar de baja") {
      if (!affiliate) {
        console.error("❌ Afiliado nulo al intentar eliminar");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }
  };


  const handleSaveAffiliate = async (data: any) => {
    if (!selectedAffiliate) return;

    try {
      console.log("Datos que se envían al backend:", JSON.stringify(data, null, 2));

      const response = await fetch(
        `http://localhost:3000/api/affiliates/${selectedAffiliate.dni}`,
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

      // Recargar el grupo familiar completo
      await fetchFamilyGroup();

      setShowEditPopup(false);
      setSelectedAffiliate(null);

    } catch (error) {
      console.error("❌ Error al actualizar afiliado:", error);
      alert("Error al actualizar el afiliado. Por favor, intente nuevamente.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo eliminar el afiliado");
      }

      console.log("Afiliado dado de baja:", selectedAffiliate);

      // Recargar el grupo familiar
      await fetchFamilyGroup();

      setShowDeleteDialog(false);
      setSelectedAffiliate(null);

    } catch (error) {
      console.error("❌ Error al eliminar afiliado:", error);
      alert("Error al eliminar el afiliado.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleDelete = async (isoDateTime: string) => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/affiliates/${selectedAffiliate.dni}/schedule-delete`,
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

  // Paginación mobile
  const nonTitularMembers = useMemo(
    () => (titular ? members.filter((m) => m.credencial !== titular.credencial) : members),
    [members, titular]
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(nonTitularMembers.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = nonTitularMembers.slice(startIndex, endIndex);

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#5FA92C] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Cargando grupo familiar...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg font-semibold mb-2">Error al cargar grupo familiar</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-[#5FA92C] text-white rounded hover:bg-green-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Sin datos
  if (!titular || members.length === 0) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ver Grupo Familiar</h1>

          <div className="hidden md:flex items-center gap-4 [&>*]:w-36 [&>*]:h-12">
            <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
            <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-3 mb-4 [&>*]:w-full [&>*]:h-12">
          <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
          <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
        </div>

        <div className="text-center py-8">
          <p className="text-gray-500">No hay datos del grupo familiar</p>
        </div>

        {showAddFamiliarPopup && (
          <AddFamiliarMember
            grupoId={dniTitular}
            planFijo={planNombre}
            onClose={() => setShowAddFamiliarPopup(false)}
            onSave={handleSaveFamiliar}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ver Grupo Familiar</h1>

        <div className="hidden md:flex items-center gap-4 [&>*]:w-36 [&>*]:h-12">
          <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
          <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
        </div>
      </div>

      <div className="md:hidden grid grid-cols-2 gap-3 mb-4 [&>*]:w-full [&>*]:h-12">
        <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
        <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
      </div>

      {/* TITULAR (mobile) */}
      <div className="md:hidden mb-4 p-4 border rounded-lg bg-white shadow-sm">
        <div className="inline-block text-xs font-semibold bg-[#5FA92C] text-white px-2 py-1 rounded mb-2">TITULAR</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-xs text-gray-500 uppercase">Nombre</div>
            <div className="text-sm">{titular.nombre}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Apellido</div>
            <div className="text-sm">{titular.apellido}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">DNI</div>
            <div className="text-sm">{titular.dni}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Fecha Nac.</div>
            <div className="text-sm">{titular.fecha_nacimiento || titular.fechaNacimiento || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Plan</div>
            <div className="text-sm">{planNombre}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 uppercase">Dirección</div>
            <div className="text-sm">{titular.direccion}</div>
          </div>
        </div>
      </div>

      {/* TABLA (desktop) */}
      <div className="hidden md:block rounded-lg border border-gray-300 shadow-md bg-white mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Credencial", "DNI", "Nombre", "Apellido", "Fecha Nac.", "Dirección", "Parentesco", ""].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider">
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
                <td className="px-4 py-2 text-sm">{m.fecha_nacimiento || m.fechaNacimiento || "-"}</td>
                <td className="px-4 py-2 text-sm">{m.direccion}</td>
                <td className="px-4 py-2 text-sm">{determinarParentesco(m)}</td>
                <td className="px-4 py-2 text-center">
                  <OptionsMenu
                    affiliate={m}
                    onOptionClick={handleOptionClick}
                    options={["Editar", "Ver detalles", "Dar de baja"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TARJETAS (mobile) */}
      <div className="md:hidden space-y-3 mb-2">
        {currentMembers.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            No hay más miembros para mostrar.
          </div>
        )}

        {currentMembers.map((m) => (
          <div key={m.credencial} className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white">
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase">Credencial</div>
              <div className="font-semibold break-all">{m.credencial}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 uppercase">DNI</div>
                <div className="text-sm">{m.dni}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Fecha Nac.</div>
                <div className="text-sm">{m.fecha_nacimiento || m.fechaNacimiento || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Nombre</div>
                <div className="text-sm">{m.nombre}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Apellido</div>
                <div className="text-sm">{m.apellido}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 uppercase">Dirección</div>
                <div className="text-sm">{m.direccion}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 uppercase">Parentesco</div>
                <div className="text-sm">{determinarParentesco(m)}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleOptionClick("Ver detalles", m)}
                className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50"
              >
                Ver detalles
              </button>
              <button
                onClick={() => handleOptionClick("Editar", m)}
                className="px-3 py-2 text-sm border-2 rounded-md border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white font-semibold"
              >
                Editar
              </button>
              <button
                onClick={() => handleOptionClick("Dar de baja", m)}
                className="px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold"
              >
                Dar de baja
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación mobile */}
      <div className="md:hidden bg-white px-3 py-2 mt-2 flex items-center justify-between border border-gray-200 rounded">
        <span className="text-sm text-gray-700">
          {nonTitularMembers.length === 0 ? 0 : startIndex + 1}
          –{Math.min(endIndex, nonTitularMembers.length)} / {nonTitularMembers.length}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{safePage}/{totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Anterior"
            title="Anterior"
          >
            <NavigateBeforeIcon fontSize="small" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Siguiente"
            title="Siguiente"
          >
            <NavigateNextIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Popups */}
      {showAddFamiliarPopup && (
        <AddFamiliarMember
          grupoId={dniTitular}
          planFijo={planNombre}
          onClose={() => setShowAddFamiliarPopup(false)}
          onSave={handleSaveFamiliar}
        />
      )}

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
          affiliate={selectedAffiliate}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          onScheduleDelete={handleScheduleDelete}
          isDeleting={isDeleting}
        />
      )}

      <ScheduledSuccessPopup
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        fechaISO={successISO}
        nombre={successName}
      />
    </div>
  );
}