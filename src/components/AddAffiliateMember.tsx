import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

interface Situacion {
  idSituacion: number;
  fechaFinalizacion: string;
}

interface SituacionDisponible {
  idSituacion: number;
  nombre: string;
}

interface AddFamiliarMemberProps {
  grupoId: string | undefined;
  planFijo: string;
  titularDireccion?: string;
  titularTelefono?: string;
  titularEmail?: string;
  onClose: () => void;
  onSave: (familiar: any) => void;
}

export function AddFamiliarMember({
  grupoId,
  planFijo,
  titularDireccion = "",
  titularTelefono = "",
  titularEmail = "",
  onClose,
  onSave
}: AddFamiliarMemberProps) {
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
    usaDireccionTitular: true,
    usaContactoTitular: false,
  });

  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [situacionesDisponibles, setSituacionesDisponibles] = useState<SituacionDisponible[]>([]);
  const [loadingSituaciones, setLoadingSituaciones] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar situaciones terapéuticas desde la BD
  useEffect(() => {
    const fetchSituaciones = async () => {
      try {
        setLoadingSituaciones(true);
        const response = await fetch(`${API_BASE_URL}/therapeutic`);

        if (!response.ok) throw new Error("Error al cargar situaciones terapéuticas");

        const data = await response.json();
        console.log("📋 Situaciones cargadas:", data.situaciones);
        setSituacionesDisponibles(data.situaciones || []);
      } catch (error) {
        console.error("Error al cargar situaciones:", error);
        setErrors(prev => ({
          ...prev,
          situaciones: "No se pudieron cargar las situaciones terapéuticas"
        }));
      } finally {
        setLoadingSituaciones(false);
      }
    };

    fetchSituaciones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const agregarSituacion = () => {
    if (situacionesDisponibles.length === 0) {
      console.warn("No hay situaciones terapéuticas disponibles");
      setErrors(prev => ({
        ...prev,
        situaciones: "No hay situaciones terapéuticas disponibles. Verifique la conexión con el servidor."
      }));
      return;
    }
    setSituaciones((prev) => [
      ...prev,
      { idSituacion: situacionesDisponibles[0].idSituacion, fechaFinalizacion: "" }
    ]);
  };

  const eliminarSituacion = (index: number) => {
    setSituaciones((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarSituacion = (
    index: number,
    campo: "idSituacion" | "fechaFinalizacion",
    valor: string | number
  ) => {
    setSituaciones((prev) => {
      const nuevas = [...prev];
      nuevas[index] = {
        ...nuevas[index],
        [campo]: campo === "idSituacion" ? parseInt(valor as string) : valor
      };
      return nuevas;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construir situaciones con el formato correcto para el backend
    const situacionesPayload = situaciones
      .filter(s => s.idSituacion)
      .map(s => ({
        id: s.idSituacion,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: s.fechaFinalizacion || null,
      }));

    // Construir email usando la lógica del titular si corresponde
    const emailFinal = formData.usaContactoTitular && titularEmail
      ? titularEmail
      : formData.email;

    // Construir teléfono usando la lógica del titular si corresponde
    const telefonoFinal = formData.usaContactoTitular && titularTelefono
      ? titularTelefono
      : formData.telefono;

    // Construir dirección usando la lógica del titular si corresponde
    const direccionFinal = formData.usaDireccionTitular && titularDireccion
      ? titularDireccion
      : formData.direccion;

    const nuevoFamiliar = {
      dni: formData.nroDocumento,
      tipoDocumento: formData.tipoDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: formData.fechaNacimiento,
      parentesco: formData.parentesco,
      telefono: telefonoFinal,
      email: emailFinal,
      direccion: direccionFinal,
      planId: planFijo,
      situaciones: situacionesPayload,
      usaDireccionTitular: formData.usaDireccionTitular,
      usaContactoTitular: formData.usaContactoTitular,
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

        {loadingSituaciones && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-center">
            <p className="text-blue-600">Cargando situaciones terapéuticas...</p>
          </div>
        )}

        {errors.situaciones && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
            <p className="text-yellow-600">{errors.situaciones}</p>
          </div>
        )}

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

            <div className="col-span-2 border p-4 rounded-md">
              <h2 className="font-semibold mb-2">Dirección</h2>

              <label className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-2 rounded">
                <input
                  type="checkbox"
                  name="usaDireccionTitular"
                  checked={formData.usaDireccionTitular}
                  onChange={handleInputChange}
                  className="w-5 h-5 cursor-pointer"
                />
                Usar dirección del titular
              </label>

              {!formData.usaDireccionTitular && (
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded mt-2 w-full"
                  placeholder="Dirección del familiar"
                />
              )}

              {formData.usaDireccionTitular && titularDireccion && (
                <p className="text-sm text-gray-600 mt-2 ml-6 italic">
                  📍 Usando: {titularDireccion}
                </p>
              )}

              {formData.usaDireccionTitular && !titularDireccion && (
                <p className="text-sm text-orange-600 mt-2 ml-6 italic">
                  ⚠️ El titular no tiene dirección registrada
                </p>
              )}
            </div>

            <div className="col-span-2 border p-4 rounded-md">
              <h2 className="font-semibold mb-2">Contacto</h2>

              <label className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-2 rounded">
                <input
                  type="checkbox"
                  name="usaContactoTitular"
                  checked={formData.usaContactoTitular}
                  onChange={handleInputChange}
                  className="w-5 h-5 cursor-pointer"
                />
                Usar contacto del titular
              </label>

              {!formData.usaContactoTitular && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}

              {formData.usaContactoTitular && (titularTelefono || titularEmail) && (
                <div className="text-sm text-gray-600 mt-2 ml-6 italic space-y-1">
                  {titularTelefono && <p>📞 Teléfono: {titularTelefono}</p>}
                  {titularEmail && <p>📧 Email: {titularEmail}</p>}
                </div>
              )}

              {formData.usaContactoTitular && !titularTelefono && !titularEmail && (
                <p className="text-sm text-orange-600 mt-2 ml-6 italic">
                  ⚠️ El titular no tiene contacto registrado
                </p>
              )}
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
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Situación</label>
                    <select
                      value={situacion.idSituacion}
                      onChange={(e) => actualizarSituacion(index, "idSituacion", e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm"
                      disabled={loadingSituaciones}
                    >
                      <option value="">-- Seleccionar --</option>
                      {situacionesDisponibles.map(sit => (
                        <option key={sit.idSituacion} value={sit.idSituacion}>
                          {sit.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Fecha Finalización (opcional)</label>
                    <input
                      type="date"
                      value={situacion.fechaFinalizacion || ""}
                      onChange={(e) => actualizarSituacion(index, "fechaFinalizacion", e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div className="justify-self-end">
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
              disabled={loadingSituaciones || situacionesDisponibles.length === 0}
            >
              + Agregar Situación Terapéutica
            </button>
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
              className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}