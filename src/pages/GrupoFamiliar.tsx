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

// Tipo para la respuesta del endpoint
interface FamilyGroupResponse {
  dni: string;
  titular: Affiliate;
  miembros: Affiliate[];
  plan: {
    id: string;
    nombre: string;
    descripcion: string;
  };
  totalMiembros: number;
}

export function GrupoFamiliar() {
  const { dni } = useParams<{ dni: string }>();
  const navigate = useNavigate();

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddFamiliarPopup, setShowAddFamiliarPopup] = useState(false);

  // Estados para datos del API
  const [familyData, setFamilyData] = useState<FamilyGroupResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // popup de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successISO, setSuccessISO] = useState<string>("");
  const [successName, setSuccessName] = useState<string>("");

  // ✅ FETCH del endpoint con el DNI
  useEffect(() => {
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

        const data: FamilyGroupResponse = await response.json();
        console.log("Grupo familiar cargado:", data);
        setFamilyData(data);
      } catch (err) {
        console.error("Error al cargar grupo familiar:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyGroup();
  }, [dni]);

  // Datos derivados del estado
  const members = useMemo(() => {
    if (!familyData) return [];
    return [familyData.titular, ...familyData.miembros];
  }, [familyData]);

  const titular = familyData?.titular || null;
  const planFijo = familyData?.plan.nombre || "";
  const dniTitular = familyData?.dni || "";

  const determinarParentesco = (affiliate: Affiliate) => {
    if (affiliate.parentesco) return affiliate.parentesco;
    const partesCredencial = affiliate.credencial.split("-");
    if (partesCredencial.length !== 2) return "Familiar a cargo";
    const numeroCredencial = parseInt(partesCredencial[1]);
    switch (numeroCredencial) {
      case 1:
        return "Titular";
      case 2:
        return "Cónyuge";
      case 3:
      case 4:
      case 5:
        return "Hijo";
      default:
        return "Familiar a cargo";
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
      const refreshResponse = await fetch(`http://localhost:3000/api/affiliates/family/${dni}`);
      const refreshedData = await refreshResponse.json();
      setFamilyData(refreshedData);

      setShowAddFamiliarPopup(false);
    } catch (error) {
      console.error("Error al guardar familiar:", error);
      alert("Error al agregar el familiar. Por favor, intenta nuevamente.");
    }
  };

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    if (option === "Editar") {
      setSelectedAffiliate(affiliate);
      setShowEditPopup(true);
      return;
    }
    if (option === "Ver detalles") {
      setSelectedAffiliate(affiliate);
      setShowViewPopup(true);
      return;
    }
    if (option === "Dar de baja") {
      setSelectedAffiliate(affiliate);
      setShowDeleteDialog(true);
      return;
    }
  };

  const handleSaveAffiliate = async (updated: Affiliate) => {
    try {
      const response = await fetch(`http://localhost:3000/api/affiliates/${updated.dni}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error("Error al actualizar afiliado");

      console.log("Afiliado actualizado:", updated);

      // Actualizar datos localmente
      if (familyData) {
        setFamilyData({
          ...familyData,
          titular: familyData.titular.dni === updated.dni ? updated : familyData.titular,
          miembros: familyData.miembros.map(m => m.dni === updated.dni ? updated : m),
        });
      }

      setShowEditPopup(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al actualizar afiliado:", error);
      alert("Error al actualizar el afiliado. Por favor, intenta nuevamente.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;

    try {
      const response = await fetch(`http://localhost:3000/api/affiliates/${selectedAffiliate.dni}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar afiliado");

      console.log("Afiliado dado de baja:", selectedAffiliate);

      // Actualizar datos localmente
      if (familyData) {
        setFamilyData({
          ...familyData,
          miembros: familyData.miembros.filter(m => m.dni !== selectedAffiliate.dni),
          totalMiembros: familyData.totalMiembros - 1,
        });
      }

      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al eliminar afiliado:", error);
      alert("Error al eliminar el afiliado. Por favor, intenta nuevamente.");
    }
  };

  const handleScheduleDelete = (isoDateTime: string) => {
    if (selectedAffiliate) {
      setShowDeleteDialog(false);
      setSuccessISO(isoDateTime);
      setSuccessName(`${selectedAffiliate.nombre} ${selectedAffiliate.apellido}`);
      setShowSuccess(true);
      setSelectedAffiliate(null);
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

  // ⚙️ Estado de carga
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

  // ❌ Estado de error
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

  // ❌ Sin datos
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

        {/* <p className="text-gray-600">No se encontraron miembros para el grupo {grupoId}.</p> */}

        {showAddFamiliarPopup && (
          <AddFamiliarPopup
            grupoId={dniTitular}
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
            <div className="text-xs text-gray-500 uppercase">Plan</div>
            <div className="text-sm">{planFijo}</div>
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
                <td className="px-4 py-2 text-sm">{m.fechaNacimiento}</td>
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
                <div className="text-sm">{m.fechaNacimiento}</div>
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

      {/* popups */}
      {showAddFamiliarPopup && (
        <AddFamiliarPopup
          grupoId={dniTitular}
          planFijo={planFijo}
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
        <ViewAffiliatePopup affiliate={selectedAffiliate} onClose={() => setShowViewPopup(false)} />
      )}

      {showDeleteDialog && selectedAffiliate && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          onSchedule={handleScheduleDelete}
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
    </div>
  );
}

/* ====== AddFamiliarPopup ====== */
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

  const [situaciones, setSituaciones] = useState<
    Array<{ situacion: string; fechaFinalizacion: string }>
  >([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const agregarSituacion = () => {
    setSituaciones((prev) => [...prev, { situacion: "", fechaFinalizacion: "" }]);
  };

  const eliminarSituacion = (index: number) => {
    setSituaciones((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarSituacion = (index: number, campo: "situacion" | "fechaFinalizacion", valor: string) => {
    setSituaciones((prev) => {
      const nuevas = [...prev];
      nuevas[index] = { ...nuevas[index], [campo]: valor };
      return nuevas;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevoFamiliar = {
      dni: formData.nroDocumento,
      tipoDocumento: formData.tipoDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: formData.fechaNacimiento.split("-").reverse().join("/"),
      parentesco: formData.parentesco,
      telefono: formData.telefono,
      email: formData.email,
      direccion: formData.direccion,
      planId: planFijo,
      situaciones,
    };
    onSave(nuevoFamiliar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800">
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
          <div className="grid grid-cols-2 gap-4">
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

            <div className="flex flex-col col-span-2">
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

          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
              Situaciones Terapéuticas
            </h3>

            <div className="space-y-3">
              {situaciones.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No hay situaciones terapéuticas agregadas
                </p>
              )}

              {situaciones.map((situacion, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-end">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Situación</label>
                    <input
                      type="text"
                      value={situacion.situacion}
                      onChange={(e) => actualizarSituacion(index, "situacion", e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm"
                      placeholder="Descripción de la situación"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Fecha Finalización</label>
                    <input
                      type="date"
                      value={situacion.fechaFinalizacion}
                      onChange={(e) => actualizarSituacion(index, "fechaFinalizacion", e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => eliminarSituacion(index)}
                      className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={agregarSituacion}
              className="mt-3 text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
            >
              + Agregar Situación Terapéutica
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button type="submit" className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition">
              Guardar Familiar
            </button>
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}