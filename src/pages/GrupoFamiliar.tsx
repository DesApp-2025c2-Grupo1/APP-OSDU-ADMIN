import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Affiliate } from "../components/AffiliatesTable";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import { OptionsMenu } from "../components/OptionsMenu";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import ScheduledSuccessPopup from "../components/BajaExitosaPopup";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { ButtonVolver } from "../util/ButtonVolver";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { API_BASE_URL } from "../config/api";

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
    {message}
    <button className="ml-3 font-bold text-white" onClick={onClose}>
      ×
    </button>
  </div>
);

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

interface FamilyGroupAPIResponse {
  affiliates: AffiliateFromAPI[];
}

// ✅ Función para transformar correctamente
function transformAffiliate(apiAffiliate: AffiliateFromAPI): Affiliate {
  return {
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
    telefonos: (apiAffiliate.telefonos || []).map(t => ({
      idTelefono: t.idTelefono || 0,
      telefono: t.telefono
    })),
    plan: apiAffiliate.plan,
    situaciones: apiAffiliate.situaciones || [],
  };
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

  const [members, setMembers] = useState<Affiliate[]>([]);
  const [planNombre, setPlanNombre] = useState<string>("");
  const [planId, setPlanId] = useState<number | null>(null);
  const [grupoFamiliarId, setGrupoFamiliarId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successISO, setSuccessISO] = useState<string>("");
  const [successName, setSuccessName] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchFamilyGroup = async () => {
    if (!dni) {
      setError("DNI no proporcionado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/affiliates/family/${dni}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: FamilyGroupAPIResponse = await response.json();

      if (!data.affiliates || data.affiliates.length === 0) {
        setError("No se encontraron afiliados en el grupo familiar");
        setLoading(false);
        return;
      }

      const transformedMembers = data.affiliates.map(transformAffiliate);

      setMembers(transformedMembers);
      setPlanNombre(data.affiliates[0].plan.nombre);
      setPlanId(data.affiliates[0].plan.idPlan);
      setGrupoFamiliarId(data.affiliates[0].grupoFamiliar);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyGroup();
  }, [dni]);

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
      const payload = {
        dni: nuevoFamiliar.dni || nuevoFamiliar.nroDocumento,
        tipoDocumento: nuevoFamiliar.tipoDocumento,
        nombre: nuevoFamiliar.nombre,
        apellido: nuevoFamiliar.apellido,
        fecha_nacimiento: nuevoFamiliar.fecha_nacimiento || nuevoFamiliar.fechaNacimiento,
        parentesco: nuevoFamiliar.parentesco,
        direccion: nuevoFamiliar.direccion || "",
        plan: planId,
        emails: nuevoFamiliar.emails || (nuevoFamiliar.email ? [{ email: nuevoFamiliar.email }] : []),
        telefonos: nuevoFamiliar.telefonos || (nuevoFamiliar.telefono ? [{ telefono: nuevoFamiliar.telefono }] : []),
        situaciones: nuevoFamiliar.situaciones || [],
        grupoFamiliar: grupoFamiliarId,
      };

      const response = await fetch(
        `${API_BASE_URL}/affiliates/family/${dniTitular}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al agregar familiar");
      }

      const result = await response.json();

      await fetchFamilyGroup();
      setShowAddFamiliarPopup(false);
      showToast(`Familiar ${nuevoFamiliar.nombre} ${nuevoFamiliar.apellido} agregado correctamente`);
    } catch (error) {
      showToast(`Error al agregar el familiar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    const opt = option.trim().toLowerCase();

    if (opt === "editar") {
      if (!affiliate || !affiliate.dni) {
        showToast("Error: No se pueden cargar los datos del afiliado");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
      return;
    }

    if (opt === "ver detalles") {
      if (!affiliate || !affiliate.dni) {
        showToast("Error: No se pueden cargar los datos del afiliado");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
      return;
    }

    if (opt === "dar de baja") {
      if (!affiliate || !affiliate.dni) {
        showToast("Error: No se puede eliminar el afiliado");
        return;
      }
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }
  };

  const handleSaveAffiliate = async (data: any) => {
    if (!selectedAffiliate) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/affiliates/${selectedAffiliate.dni}`,
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
        throw new Error(errorData.message || "Error al actualizar afiliado");
      }
      await fetchFamilyGroup();
      setShowEditPopup(false);
      setSelectedAffiliate(null);
      showToast(`Afiliado ${selectedAffiliate.nombre} ${selectedAffiliate.apellido} actualizado correctamente`);

    } catch (error) {
      showToast(`Error al actualizar el afiliado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowEditPopup(false);
      setSelectedAffiliate(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;
    setIsDeleting(true);

    try {
      // Detectar si estamos eliminando al titular
      const isTitular = selectedAffiliate.parentesco === 'Titular' ||
        determinarParentesco(selectedAffiliate) === 'Titular';

      // Usar el nuevo endpoint para eliminar solo un miembro del grupo familiar
      const response = await fetch(
        `${API_BASE_URL}/affiliates/family/member/${selectedAffiliate.dni}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo eliminar el afiliado");
      }

      setShowDeleteDialog(false);
      setSelectedAffiliate(null);

      showToast(`Afiliado ${selectedAffiliate.nombre} ${selectedAffiliate.apellido} eliminado correctamente`);

      // Si eliminamos al titular, redirigir al home
      if (isTitular) {
        setTimeout(() => {
          navigate('/home');
        }, 1500); // Dar tiempo para ver el toast
      } else {
        // Si es un familiar, recargar el grupo
        await fetchFamilyGroup();
      }

    } catch (error) {
      showToast(`Error al eliminar el afiliado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
    }
  };

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

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Cargando grupo familiar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg font-semibold mb-2">Error al cargar grupo familiar</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-[#14B8A6] text-white rounded hover:bg-teal-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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
        <div className="inline-block text-xs font-semibold bg-[#14B8A6] text-white px-2 py-1 rounded mb-2">TITULAR</div>
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
            <div className="text-sm">{titular.fecha_nacimiento || titular.fechaNacimiento || "N/A"}</div>
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
          <thead className="bg-[#14B8A6] text-white">
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
                <td className="px-4 py-2 text-sm">{m.fecha_nacimiento || m.fechaNacimiento || "N/A"}</td>
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
                <div className="text-sm">{m.fecha_nacimiento || m.fechaNacimiento || "N/A"}</div>
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

            <div className="mt-4 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOptionClick("Ver detalles", m)}
                  className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50 text-center"
                >
                  Ver detalles
                </button>
                <button
                  onClick={() => handleOptionClick("Editar", m)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white font-semibold text-center"
                >
                  Editar
                </button>
              </div>
              <button
                onClick={() => handleOptionClick("Dar de baja", m)}
                className="w-full px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold text-center"
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
          >
            <NavigateBeforeIcon fontSize="small" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <NavigateNextIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Popups */}
      {showAddFamiliarPopup && (
        <AddFamiliarPopup
          grupoId={grupoFamiliarId}
          dniTitular={dniTitular}
          planFijo={planNombre}
          planId={planId}
          titular={titular}
          onClose={() => setShowAddFamiliarPopup(false)}
          onSave={handleSaveFamiliar}
        />
      )}

      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => {
            setShowEditPopup(false);
            setSelectedAffiliate(null);
          }}
          onSave={handleSaveAffiliate}
        />
      )}

      {showViewPopup && selectedAffiliate && (
        <ViewAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => {
            setShowViewPopup(false);
            setSelectedAffiliate(null);
          }}
        />
      )}

      {showDeleteDialog && selectedAffiliate && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onClose={() => {
            if (!isDeleting) {
              setShowDeleteDialog(false);
              setSelectedAffiliate(null);
            }
          }}
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

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

/* ====== AddFamiliarPopup Component ====== */
interface AddFamiliarPopupProps {
  grupoId: number | null;
  dniTitular: string;
  planFijo: string;
  planId: number | null;
  titular: Affiliate | null;
  onClose: () => void;
  onSave: (familiar: any) => void;
}

interface SituacionDisponible {
  idSituacion: number;
  nombre: string;
}

interface Situacion {
  idSituacion: number;
  fechaFinalizacion: string;
}

function AddFamiliarPopup({ grupoId, dniTitular, planFijo, planId, titular, onClose, onSave }: AddFamiliarPopupProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    nroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    parentesco: "Hijo",
    telefono: "",
    email: "",
    direccion: "",
    usaDireccionTitular: false,
    usaContactoTitular: false,
  });

  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [situacionesDisponibles, setSituacionesDisponibles] = useState<SituacionDisponible[]>([]);
  const [loadingSituaciones, setLoadingSituaciones] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar situaciones terapéuticas al montar
  useEffect(() => {
    const loadSituaciones = async () => {
      try {
        setLoadingSituaciones(true);
        const response = await fetch(`${API_BASE_URL}/therapeutic`);
        if (!response.ok) throw new Error("Error al cargar situaciones terapéuticas");
        const data = await response.json();
        setSituacionesDisponibles(data.situaciones || []);
      } catch (error) {
        setErrors(prev => ({ ...prev, situaciones: "No se pudieron cargar las situaciones terapéuticas" }));
      } finally {
        setLoadingSituaciones(false);
      }
    };
    loadSituaciones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSituacion = () => {
    if (situacionesDisponibles.length === 0) {
      setErrors(prev => ({ ...prev, situaciones: "No hay situaciones disponibles" }));
      return;
    }
    setSituaciones((prev) => [...prev, { idSituacion: situacionesDisponibles[0].idSituacion, fechaFinalizacion: "" }]);
  };

  const removeSituacion = (idx: number) =>
    setSituaciones((prev) => prev.filter((_, i) => i !== idx));

  const updateSituacion = (idx: number, field: keyof Situacion, value: string | number) => {
    setSituaciones((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nroDocumento?.trim()) {
      newErrors.nroDocumento = "Requerido";
    } else if (!/^[0-9]{7,8}$/.test(formData.nroDocumento)) {
      newErrors.nroDocumento = "El DNI debe tener 7 u 8 dígitos numéricos";
    }

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "Requerido";
    } else if (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 50) {
      newErrors.nombre = "El nombre debe tener entre 2 y 50 caracteres";
    }

    if (!formData.apellido?.trim()) {
      newErrors.apellido = "Requerido";
    } else if (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 50) {
      newErrors.apellido = "El apellido debe tener entre 2 y 50 caracteres";
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "Requerido";
    } else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) {
        newErrors.fechaNacimiento = "La fecha no puede ser futura";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.usaContactoTitular && formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.usaContactoTitular && formData.telefono && !/^[0-9]{7,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const situacionesPayload = situaciones.map(s => ({
      id: s.idSituacion,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: s.fechaFinalizacion || null,
    }));

    // Determinar qué datos usar basándose en los checkboxes
    const direccionFinal = formData.usaDireccionTitular && titular?.direccion
      ? titular.direccion
      : formData.direccion || "";

    const emailFinal = formData.usaContactoTitular && titular?.email && titular.email.length > 0
      ? titular.email[0].email
      : formData.email;

    const telefonoFinal = formData.usaContactoTitular && titular?.telefonos && titular.telefonos.length > 0
      ? titular.telefonos[0].telefono
      : formData.telefono;

    const payload = {
      dni: formData.nroDocumento,
      tipoDocumento: formData.tipoDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      fecha_nacimiento: formData.fechaNacimiento,
      parentesco: formData.parentesco,
      direccion: direccionFinal,
      emails: emailFinal ? [{ email: emailFinal }] : [],
      telefonos: telefonoFinal ? [{ telefono: telefonoFinal }] : [],
      situaciones: situacionesPayload,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-600 text-2xl hover:text-gray-800 z-10">
          ✕
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pr-8">
          Agregar Familiar al Grupo
        </h1>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-semibold text-sm sm:text-base">
            Plan del grupo familiar: <span className="text-green-600">{planFijo}</span>
          </p>
          <p className="text-blue-600 text-xs sm:text-sm">
            Todos los miembros del grupo familiar comparten el mismo plan médico.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Tipo Documento *</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="DNI">DNI</option>
                <option value="CUIL">CUIL</option>
                <option value="CUIT">CUIT</option>
                <option value="DOCUMENTO EXTRANJERO">DOCUMENTO EXTRANJERO</option>
                <option value="CDI">CDI</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Nro Documento *</label>
              <input
                type="text"
                name="nroDocumento"
                value={formData.nroDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
              {errors.nroDocumento && (
                <p className="text-red-500 text-xs mt-1">{errors.nroDocumento}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Nombres *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
              {errors.apellido && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Fecha Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
              {errors.fechaNacimiento && (
                <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Parentesco *</label>
              <select
                name="parentesco"
                value={formData.parentesco}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="Cónyuge">Cónyuge</option>
                <option value="Hijo">Hijo</option>
                <option value="Hija">Hija</option>
                <option value="Familiar a cargo">Familiar a cargo</option>
              </select>
            </div>

            <div className="flex flex-col col-span-1 sm:col-span-2">
              <label className="font-semibold mb-1 text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  name="usaDireccionTitular"
                  checked={formData.usaDireccionTitular}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Usar dirección del titular
              </label>
              {!formData.usaDireccionTitular && (
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded mt-2"
                  placeholder="Dirección del familiar"
                />
              )}
              {formData.usaDireccionTitular && titular?.direccion && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">
                  {titular.direccion}
                </div>
              )}
            </div>

            <div className="flex flex-col col-span-1 sm:col-span-2">
              <label className="font-semibold mb-1 text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  name="usaContactoTitular"
                  checked={formData.usaContactoTitular}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Usar contacto del titular
              </label>
              {!formData.usaContactoTitular && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                      placeholder="Ej: 1145678901"
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                      placeholder="ejemplo@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              )}
              {formData.usaContactoTitular && titular && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 space-y-1">
                  <div><strong>Teléfono:</strong> {titular.telefonos && titular.telefonos.length > 0 ? titular.telefonos[0].telefono : 'Sin teléfono'}</div>
                  <div><strong>Email:</strong> {titular.email && titular.email.length > 0 ? titular.email[0].email : 'Sin email'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Situaciones Terapéuticas */}
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Situaciones Terapéuticas</h3>
              <button
                type="button"
                onClick={addSituacion}
                disabled={loadingSituaciones}
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-blue-600 disabled:bg-gray-400 transition w-full sm:w-auto"
              >
                {loadingSituaciones ? "Cargando..." : "+ Agregar Situación"}
              </button>
            </div>

            {errors.situaciones && (
              <p className="text-red-500 text-sm mb-2">{errors.situaciones}</p>
            )}

            {situaciones.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hay situaciones terapéuticas agregadas</p>
            ) : (
              <div className="space-y-3">
                {situaciones.map((sit, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-gray-300 rounded bg-gray-50">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1">Situación</label>
                      <select
                        value={sit.idSituacion}
                        onChange={(e) => updateSituacion(idx, "idSituacion", parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        {situacionesDisponibles.map((s) => (
                          <option key={s.idSituacion} value={s.idSituacion}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1">Fecha Finalización (opcional)</label>
                      <input
                        type="date"
                        value={sit.fechaFinalizacion}
                        onChange={(e) => updateSituacion(idx, "fechaFinalizacion", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSituacion(idx)}
                      className="sm:mt-6 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition w-full sm:w-auto"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#14B8A6] text-white px-6 py-3 rounded font-semibold shadow hover:bg-teal-700 transition w-full sm:w-auto order-2 sm:order-1"
            >
              Guardar Familiar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition w-full sm:w-auto order-1 sm:order-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
