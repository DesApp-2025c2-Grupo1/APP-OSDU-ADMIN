import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Affiliate } from "../components/AffiliatesTable";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import { OptionsMenu } from "../components/OptionsMenu";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { ButtonVolver } from "../util/ButtonVolver";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

const API_URL = import.meta.env.VITE_API_URL;

interface FamilyMemberAPI {
  idGrupoFamiliarFK: number;
  tipoDocumento: string;
  apellido: string;
  credencial: string;
  direccion: string;
  dni: string;
  email: string;
  nombre: string;
  parentesco: string;
  telefono: string;
}

interface FamilyGroupResponse {
  grupo: {
    idGrupoFamiliar: number;
    nroAfiliado: string;
    idPlanFK: number;
    plan: {
      idPlan: number;
      nombre: string;
    };
  };
  afiliados: FamilyMemberAPI[];
}

export function GrupoFamiliar() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const navigate = useNavigate();

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddFamiliarPopup, setShowAddFamiliarPopup] = useState(false);

  // Estados para la API
  const [members, setMembers] = useState<Affiliate[]>([]);
  const [grupoInfo, setGrupoInfo] = useState<FamilyGroupResponse["grupo"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch del grupo familiar
  useEffect(() => {
    const fetchFamilyGroup = async () => {
      if (!grupoId) return;

      try {
        setLoading(true);
        setError(null);

        console.log(`Obteniendo grupo familiar ID: ${grupoId}`);
        const response = await fetch(`${API_URL}/affiliates/family/${grupoId}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar el grupo familiar`);
        }

        const data: FamilyGroupResponse = await response.json();
        console.log("Datos del grupo familiar:", data);

        // Mapear los datos de la API al formato Affiliate
        const mappedMembers: Affiliate[] = data.afiliados.map((afiliado) => ({
          credencial: afiliado.credencial,
          dni: afiliado.dni,
          nombre: afiliado.nombre,
          apellido: afiliado.apellido,
          fechaNacimiento: "", // La API no devuelve fecha de nacimiento
          plan: data.grupo.plan.nombre,
          direccion: afiliado.direccion,
          parentesco: afiliado.parentesco,
          email: afiliado.email,
          telefono: afiliado.telefono,
          idGrupoFamiliarFK: data.grupo.idGrupoFamiliar,
          tipoDocumento: afiliado.tipoDocumento,
        }));

        setMembers(mappedMembers);
        setGrupoInfo(data.grupo);
      } catch (err) {
        console.error("Error al cargar grupo familiar:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyGroup();
  }, [grupoId]);

  const titular = members.find((m) => m.parentesco?.toLowerCase() === "titular") || members[0];
  const planFijo = grupoInfo?.plan.nombre || "210";

  const handleAgregarFamiliar = () => setShowAddFamiliarPopup(true);

  const handleSaveFamiliar = async (nuevoFamiliar: any) => {
    try {
      console.log("Nuevo familiar a guardar:", nuevoFamiliar, "para el grupo:", grupoId);

      // Aquí iría el POST al backend para agregar el familiar
      // const response = await fetch(`${API_URL}/affiliates/family/${grupoId}/member`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevoFamiliar),
      // });

      // Por ahora, recargar los datos
      setShowAddFamiliarPopup(false);

      // Recargar la lista
      window.location.reload();
    } catch (error) {
      console.error("Error al agregar familiar:", error);
    }
  };

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);

    if (option === "Editar") {
      setShowEditPopup(true);
      return;
    }
    if (option === "Ver detalles") {
      setShowViewPopup(true);
      return;
    }
    if (option === "Dar de baja") {
      setShowDeleteDialog(true);
      return;
    }
  };

  const handleSaveAffiliate = async (updated: Affiliate) => {
    try {
      console.log("Afiliado actualizado:", updated);

      // Aquí iría el PUT al backend
      // const response = await fetch(`${API_URL}/affiliates/${updated.dni}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updated),
      // });

      // Actualizar la lista local
      setMembers(prev => prev.map(m =>
        m.credencial === updated.credencial ? updated : m
      ));

      setShowEditPopup(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al actualizar afiliado:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;

    try {
      console.log("Afiliado dado de baja:", selectedAffiliate);

      // Aquí iría el DELETE al backend
      // const response = await fetch(`${API_URL}/affiliates/${selectedAffiliate.dni}`, {
      //   method: 'DELETE',
      // });

      // Actualizar la lista local
      setMembers(prev => prev.filter(m => m.credencial !== selectedAffiliate.credencial));

      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al dar de baja:", error);
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

  // Loading state
  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5FA92C]"></div>
          <span className="ml-3 text-gray-600">Cargando grupo familiar...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Empty state
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

        <p className="text-center text-gray-600 py-8">
          No se encontraron miembros para el grupo {grupoId}.
        </p>

        {showAddFamiliarPopup && (
          <AddFamiliarPopup
            grupoId={grupoId}
            planFijo={planFijo}
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
        <div>
          <h1 className="text-2xl font-bold">Ver Grupo Familiar</h1>
          <p className="text-sm text-gray-600 mt-1">
            Grupo N° {grupoInfo?.nroAfiliado} - Plan: {planFijo}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 [&>*]:w-36 [&>*]:h-12">
          <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
          <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 mb-4 [&>*]:w-full [&>*]:h-12">
        <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
        <ButtonAddAffiliate text="Agregar Familiar" onClick={handleAgregarFamiliar} />
      </div>

      {/* Mobile titular principal */}
      <div className="md:hidden mb-4 p-4 border rounded-lg bg-white shadow-sm">
        <div className="inline-block text-xs font-semibold bg-[#5FA92C] text-white px-2 py-1 rounded mb-2">
          TITULAR
        </div>
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
            <div className="text-xs text-gray-500 uppercase">Plan</div>
            <div className="text-sm">{planFijo}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500 uppercase">Dirección</div>
            <div className="text-sm">{titular.direccion}</div>
          </div>
        </div>
      </div>

      {/* Desktop Tabla */}
      <div className="hidden md:block rounded-lg border border-gray-300 shadow-md bg-white mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#5FA92C] text-white">
            <tr>
              {["Credencial", "DNI", "Nombre", "Apellido", "Dirección", "Parentesco", ""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((m, idx) => (
              <tr key={m.credencial} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-4 py-3 text-sm font-medium">{m.credencial}</td>
                <td className="px-4 py-3 text-sm">{m.dni}</td>
                <td className="px-4 py-3 text-sm">{m.nombre}</td>
                <td className="px-4 py-3 text-sm">{m.apellido}</td>
                <td className="px-4 py-3 text-sm">{m.direccion}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${m.parentesco === "Titular"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                      }`}
                  >
                    {m.parentesco}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
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

        {/* Footer con contador */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total de miembros: <span className="font-semibold text-gray-900">{members.length}</span>
          </p>
        </div>
      </div>

      {/* Mobile miembros con paginación */}
      <div className="md:hidden space-y-3 mb-2">
        {currentMembers.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            No hay más miembros para mostrar.
          </div>
        )}

        {currentMembers.map((m) => (
          <div key={m.credencial} className="border border-gray-200 rounded-lg shadow-sm p-3 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-gray-500 uppercase">Credencial</div>
                <div className="font-semibold">{m.credencial}</div>
              </div>
              <OptionsMenu
                affiliate={m}
                onOptionClick={handleOptionClick}
                options={["Editar", "Ver detalles", "Dar de baja"]}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div className="text-xs text-gray-500 uppercase">DNI</div>
                <div className="text-sm">{m.dni}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Nombre</div>
                <div className="text-sm">{m.nombre}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Apellido</div>
                <div className="text-sm">{m.apellido}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Parentesco</div>
                <div className="text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${m.parentesco === "Titular"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                      }`}
                  >
                    {m.parentesco}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 uppercase">Dirección</div>
                <div className="text-sm">{m.direccion}</div>
              </div>
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
          <span className="text-sm text-gray-700">
            {safePage}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Anterior"
          >
            <NavigateBeforeIcon fontSize="small" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Siguiente"
          >
            <NavigateNextIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Popups */}
      {showAddFamiliarPopup && (
        <AddFamiliarPopup
          grupoId={grupoId}
          planFijo={planFijo}
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
            setShowDeleteDialog(false);
            setSelectedAffiliate(null);
          }}
          onConfirm={handleConfirmDelete}
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
          affiliateCredencial={selectedAffiliate.credencial}
        />
      )}
    </div>
  );
}

interface AddFamiliarPopupProps {
  grupoId: string | undefined;
  planFijo: string;
  onClose: () => void;
  onSave: (familiar: any) => void;
}

function AddFamiliarPopup({ grupoId, planFijo, onClose, onSave }: AddFamiliarPopupProps) {
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoFamiliar = {
      ...formData,
      grupoFamiliarId: grupoId,
      plan: planFijo,
    };
    onSave(nuevoFamiliar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Agregar Familiar al Grupo {grupoId}
        </h1>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-semibold">
            Plan del grupo familiar: <span className="text-green-600">{planFijo}</span>
          </p>
          <p className="text-blue-600 text-sm">
            Todos los miembros del grupo familiar comparten el mismo plan médico.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Tipo Documento</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="DNI">DNI</option>
                <option value="CUIL">CUIL</option>
                <option value="PASAPORTE">Pasaporte</option>
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

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col col-span-full">
              <label className="font-semibold mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition"
            >
              Guardar Familiar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow  hover:bg-green-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}