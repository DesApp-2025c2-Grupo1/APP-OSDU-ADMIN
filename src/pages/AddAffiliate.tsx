import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { fetchPlans, type Plan } from "../api/planService";
import AltaProgramadaPopup from "../components/AltaProgramadaPopup";

interface Situacion {
  idSituacion: number;
  fechaFinalizacion: string;
}

interface SituacionDisponible {
  idSituacion: number;
  nombre: string;
}

interface Familiar {
  tipoDocumento: string;
  nroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  parentesco: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  direccion2?: string;
  usaDireccionTitular?: boolean;
  usaContactoTitular?: boolean;
  situaciones?: Array<{ idSituacion: number; fechaFinalizacion: string }>;
}

export function AddAffiliate() {
  const navigate = useNavigate();
  const [showAltaPopup, setShowAltaPopup] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    nroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    planMedico: "1",
    credencial: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    direccion2: "",
  });

  const [showPhone2, setShowPhone2] = useState(false);
  const [showEmail2, setShowEmail2] = useState(false);
  const [showAddress2, setShowAddress2] = useState(false);
  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [situacionesDisponibles, setSituacionesDisponibles] = useState<SituacionDisponible[]>([]);
  const [loadingSituaciones, setLoadingSituaciones] = useState(true);
  const [planesDisponibles, setPlanesDisponibles] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar situaciones terapéuticas y planes desde la BD al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar situaciones terapéuticas
        setLoadingSituaciones(true);
        const responseSit = await fetch(`${API_BASE_URL}/therapeutic`);

        if (!responseSit.ok) throw new Error("Error al cargar situaciones terapéuticas");
        const dataSit = await responseSit.json();
        
        // Backend now securely returns Array of {idSituacion, nombre}
        setSituacionesDisponibles(Array.isArray(dataSit) ? dataSit : []);
        setErrors(prev => ({ ...prev, situaciones: "" }));
      } catch (error) {
        setErrors(prev => ({ ...prev, situaciones: "No se pudieron cargar las situaciones terapéuticas" }));
      } finally {
        setLoadingSituaciones(false);
      }

      try {
        // Cargar planes
        setLoadingPlanes(true);
        const planes = await fetchPlans();
        setPlanesDisponibles(planes);
      } catch (error) {
        setErrors(prev => ({ ...prev, planes: "No se pudieron cargar los planes médicos" }));
      } finally {
        setLoadingPlanes(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSituacion = () => {
    if (situacionesDisponibles.length === 0) {
      console.warn("No hay situaciones terapéuticas disponibles");
      setErrors(prev => ({ ...prev, situaciones: "No hay situaciones terapéuticas disponibles. Verifique la conexión con el servidor." }));
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

  const agregarFamiliar = () => {
    const nuevoFamiliar: Familiar = {
      tipoDocumento: "DNI",
      nroDocumento: "",
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      parentesco: "Hijo",
      telefono: "",
      email: "",
      usaDireccionTitular: true,
      usaContactoTitular: false,
      situaciones: [],
    };
    setFamiliares((prev) => [...prev, nuevoFamiliar]);
  };

  const eliminarFamiliar = (posicion: number) => {
    setFamiliares((prev) => prev.filter((_, i) => i !== posicion));
  };

  const cambiarDatoFamiliar = (posicion: number, campo: keyof Familiar, valor: any) => {
    setFamiliares((prev) => {
      const next = [...prev];
      next[posicion] = { ...next[posicion], [campo]: valor };
      return next;
    });
  };

  const addSituacionFamiliar = (i: number) => {
    if (situacionesDisponibles.length === 0) return;
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = next[i].situaciones || [];
      next[i] = { ...next[i], situaciones: [...sit, { idSituacion: situacionesDisponibles[0].idSituacion, fechaFinalizacion: "" }] };
      return next;
    });
  };

  const updateSituacionFamiliar = (
    i: number,
    idx: number,
    field: "idSituacion" | "fechaFinalizacion",
    value: string | number
  ) => {
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = [...(next[i].situaciones || [])];
      sit[idx] = { ...sit[idx], [field]: field === "idSituacion" ? parseInt(value as string) : value };
      next[i] = { ...next[i], situaciones: sit };
      return next;
    });
  };

  const removeSituacionFamiliar = (i: number, idx: number) => {
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = (next[i].situaciones || []).filter((_, k) => k !== idx);
      next[i] = { ...next[i], situaciones: sit };
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // DNI del titular
    if (!formData.nroDocumento?.trim()) {
      newErrors.nroDocumento = "Requerido";
    } else if (!/^[0-9]{7,8}$/.test(formData.nroDocumento)) {
      newErrors.nroDocumento = "El DNI debe tener 7 u 8 dígitos numéricos";
    }

    // Nombre del titular
    if (!formData.nombre?.trim()) {
      newErrors.nombre = "Requerido";
    } else if (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 50) {
      newErrors.nombre = "El nombre debe tener entre 2 y 50 caracteres";
    }

    // Apellido del titular
    if (!formData.apellido?.trim()) {
      newErrors.apellido = "Requerido";
    } else if (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 50) {
      newErrors.apellido = "El apellido debe tener entre 2 y 50 caracteres";
    }

    // Fecha de nacimiento del titular
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "Requerido";
    } else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();

      if (fechaNac > hoy) {
        newErrors.fechaNacimiento = "La fecha no puede ser futura";
      }

      const edad = (hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (edad > 150) {
        newErrors.fechaNacimiento = "La fecha de nacimiento no es válida";
      }
    }

    // Emails del titular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }
    if (formData.email2 && !emailRegex.test(formData.email2)) {
      newErrors.email2 = "Formato de email inválido";
    }

    // Teléfonos del titular
    if (!formData.telefono?.trim()) {
      newErrors.telefono = "Requerido";
    } else if (!/^[0-9]{7,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos";
    }
    if (formData.telefono2 && !/^[0-9]{7,15}$/.test(formData.telefono2.replace(/\s/g, ''))) {
      newErrors.telefono2 = "El teléfono debe tener entre 7 y 15 dígitos";
    }

    // Plan del titular
    if (!formData.planMedico) {
      newErrors.planMedico = "Requerido";
    }

    // Dirección del titular (opcional pero con límite)
    if (formData.direccion && formData.direccion.length > 100) {
      newErrors.direccion = "La dirección no puede superar los 100 caracteres";
    }

    // Validaciones de familiares
    familiares.forEach((f, index) => {
      const prefix = `familiares[${index}]`;

      // DNI del familiar
      if (!f.nroDocumento?.trim()) {
        newErrors[`${prefix}.nroDocumento`] = "Requerido";
      } else if (!/^[0-9]{7,8}$/.test(f.nroDocumento)) {
        newErrors[`${prefix}.nroDocumento`] = "El DNI debe tener 7 u 8 dígitos numéricos";
      }

      // Nombre del familiar
      if (!f.nombre?.trim()) {
        newErrors[`${prefix}.nombre`] = "Requerido";
      } else if (f.nombre.trim().length < 2 || f.nombre.trim().length > 50) {
        newErrors[`${prefix}.nombre`] = "El nombre debe tener entre 2 y 50 caracteres";
      }

      // Apellido del familiar
      if (!f.apellido?.trim()) {
        newErrors[`${prefix}.apellido`] = "Requerido";
      } else if (f.apellido.trim().length < 2 || f.apellido.trim().length > 50) {
        newErrors[`${prefix}.apellido`] = "El apellido debe tener entre 2 y 50 caracteres";
      }

      // Fecha de nacimiento del familiar
      if (!f.fechaNacimiento) {
        newErrors[`${prefix}.fechaNacimiento`] = "Requerido";
      } else {
        const fechaNac = new Date(f.fechaNacimiento);
        const hoy = new Date();

        if (fechaNac > hoy) {
          newErrors[`${prefix}.fechaNacimiento`] = "La fecha no puede ser futura";
        }

        const edad = (hoy.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (edad > 150) {
          newErrors[`${prefix}.fechaNacimiento`] = "La fecha de nacimiento no es válida";
        }
      }

      // Email del familiar
      if (!f.usaContactoTitular) {
        // Si no usa contacto del titular, debe proveer su propio email
        if (!f.email?.trim()) {
          newErrors[`${prefix}.email`] = "Requerido";
        } else if (!emailRegex.test(f.email)) {
          newErrors[`${prefix}.email`] = "Formato de email inválido";
        }
      }

      // Teléfono del familiar
      if (!f.usaContactoTitular) {
        // Si no usa contacto del titular, debe proveer su propio teléfono
        if (!f.telefono?.trim()) {
          newErrors[`${prefix}.telefono`] = "Requerido";
        } else if (!/^[0-9]{7,15}$/.test(f.telefono.replace(/\s/g, ''))) {
          newErrors[`${prefix}.telefono`] = "El teléfono debe tener entre 7 y 15 dígitos";
        }
      }

      // Validar que el DNI del familiar no sea igual al del titular
      if (f.nroDocumento === formData.nroDocumento) {
        newErrors[`${prefix}.nroDocumento`] = "El DNI del familiar no puede ser igual al del titular";
      }

      // Validar que no haya DNIs duplicados entre familiares
      const duplicados = familiares.filter((fam, idx) =>
        idx !== index && fam.nroDocumento === f.nroDocumento
      );
      if (duplicados.length > 0 && f.nroDocumento) {
        newErrors[`${prefix}.nroDocumento`] = "Este DNI ya está en uso por otro familiar";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const buildFormData = () => {
    const familyGroup = familiares.map(f => ({
      full_name: `${f.nombre.trim()} ${f.apellido.trim()}`,
      relationship: f.parentesco,
      document_number: f.nroDocumento,
    }));

    const fd = new FormData();
    fd.append('document_number', formData.nroDocumento);
    fd.append('first_name', formData.nombre);
    fd.append('last_name', formData.apellido);
    fd.append('document_type', formData.tipoDocumento);
    fd.append('birth_date', formData.fechaNacimiento);
    fd.append('plan_id', formData.planMedico);
    fd.append('email', formData.email.trim());
    fd.append('phone', formData.telefono.trim());
    if (formData.direccion?.trim()) fd.append('address', formData.direccion.trim());
    if (familyGroup.length > 0) fd.append('family_group', JSON.stringify(familyGroup));
    return fd;
  };

  const handleProgramarAlta = async (fechaAltaISO: string) => {
    if (!validate()) {
      setShowAltaPopup(false);
      return;
    }

    setLoading(true);
    setSuccess(null);
    setShowAltaPopup(false);

    try {
      const response = await fetch(`${API_BASE_URL}/affiliates`, {
        method: "POST",
        credentials: "include",
        body: buildFormData(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setLoading(false);
      setSuccess("Afiliado programado exitosamente para alta futura");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Error al programar. Verifica la conexión con el servidor."
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/affiliates`, {
        method: "POST",
        credentials: "include",
        body: buildFormData(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setLoading(false);
      setSuccess("Afiliado y familiares creados con éxito");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Error al guardar. Verifica la conexión con el servidor."
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto mt-4 sm:mt-6 shadow">
      <div className="flex flex-col items-center sm:items-start mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Crear nuevo afiliado
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
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

      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* DATOS DE AFILIADO (Titular) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado (Titular)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo Documento (*)</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nro Documento (*)</label>
              <input
                type="text"
                name="nroDocumento"
                value={formData.nroDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.nroDocumento && (
                <p className="text-red-500 text-sm mt-1">{errors.nroDocumento}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombres (*)</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Apellidos (*)</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Fecha nacimiento (*)</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.fechaNacimiento && (
                <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Plan Médico (*)</label>
              <select
                name="planMedico"
                value={formData.planMedico}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                disabled={loadingPlanes}
              >
                <option value="">-- Seleccionar --</option>
                {planesDisponibles.map(plan => (
                  <option key={plan.idPlan} value={plan.idPlan}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
              {errors.planMedico && (
                <p className="text-red-500 text-sm mt-1">{errors.planMedico}</p>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold mb-1">Teléfono (*)</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Teléfono"
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}

              {showPhone2 && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      name="telefono2"
                      value={formData.telefono2}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      placeholder="Teléfono adicional"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, telefono2: "" }));
                        setShowPhone2(false);
                      }}
                      className="px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      Quitar
                    </button>
                  </div>
                  {errors.telefono2 && <p className="text-red-500 text-xs mt-1">{errors.telefono2}</p>}
                </div>
              )}

              {!showPhone2 && (
                <button
                  type="button"
                  onClick={() => setShowPhone2(true)}
                  className="mt-2 text-sm px-3 py-1 border rounded hover:bg-gray-50 w-fit"
                >
                  + Agregar otro
                </button>
              )}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold mb-1">Email (*)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

              {showEmail2 && (
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    name="email2"
                    value={formData.email2}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    placeholder="Email adicional"
                  />
                  {errors.email2 && <p className="text-red-500 text-xs mt-1">{errors.email2}</p>}

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, email2: "" }));
                      setShowEmail2(false);
                    }}
                    className="px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Quitar
                  </button>
                </div>
              )}

              {!showEmail2 && (
                <button
                  type="button"
                  onClick={() => setShowEmail2(true)}
                  className="mt-2 text-sm px-3 py-1 border rounded hover:bg-gray-50 w-fit"
                >
                  + Agregar otro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SITUACIONES TERAPÉUTICAS (Titular) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Situaciones Terapéuticas
          </h2>

          <div className="space-y-2">
            {situaciones.length === 0 && (
              <p className="text-sm text-gray-500">No hay situaciones cargadas.</p>
            )}

            {situaciones.map((s, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end w-full"
              >
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Situación terapéutica</label>
                  <select
                    value={s.idSituacion}
                    onChange={(e) => updateSituacion(idx, "idSituacion", parseInt(e.target.value))}
                    className="p-2 border border-gray-300 rounded"
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
                  <label className="text-sm font-semibold mb-1">Fecha de finalización (opcional)</label>
                  <input
                    type="date"
                    value={s.fechaFinalizacion || ""}
                    onChange={(e) => updateSituacion(idx, "fechaFinalizacion", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="justify-self-start md:justify-self-end">
                  <button
                    type="button"
                    onClick={() => removeSituacion(idx)}
                    className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSituacion}
              className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
              disabled={loadingSituaciones || situacionesDisponibles.length === 0}
            >
              + Agregar
            </button>
          </div>
        </div>

        {/* FAMILIARES A CARGO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Familiares a Cargo
          </h2>

          {familiares.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">No hay familiares agregados.</p>
          )}

          {familiares.map((familiar, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center mb-3">
                <h3 className="font-semibold text-gray-700">Familiar {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => eliminarFamiliar(i)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Tipo Documento</label>
                  <select
                    value={familiar.tipoDocumento}
                    onChange={(e) => cambiarDatoFamiliar(i, "tipoDocumento", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Nro Documento</label>
                  <input
                    type="text"
                    value={familiar.nroDocumento}
                    onChange={(e) => cambiarDatoFamiliar(i, "nroDocumento", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  />
                  {errors[`familiares[${i}].nroDocumento`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].nroDocumento`]}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Nombres</label>
                  <input
                    type="text"
                    value={familiar.nombre}
                    onChange={(e) => cambiarDatoFamiliar(i, "nombre", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  />
                  {errors[`familiares[${i}].nombre`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].nombre`]}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Apellidos</label>
                  <input
                    type="text"
                    value={familiar.apellido}
                    onChange={(e) => cambiarDatoFamiliar(i, "apellido", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  />
                  {errors[`familiares[${i}].apellido`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].apellido`]}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={familiar.fechaNacimiento}
                    onChange={(e) => cambiarDatoFamiliar(i, "fechaNacimiento", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  />
                  {errors[`familiares[${i}].fechaNacimiento`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].fechaNacimiento`]}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Parentesco</label>
                  <select
                    value={familiar.parentesco}
                    onChange={(e) => cambiarDatoFamiliar(i, "parentesco", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Hijo">Hijo</option>
                    <option value="Hija">Hija</option>
                    <option value="Familiar a cargo">Familiar a cargo</option>
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="font-semibold mb-1 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={familiar.usaDireccionTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaDireccionTitular", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Usar dirección del titular
                  </label>
                  {!familiar.usaDireccionTitular && (
                    <input
                      type="text"
                      value={familiar.direccion || ""}
                      onChange={(e) => cambiarDatoFamiliar(i, "direccion", e.target.value)}
                      className="p-2 border border-gray-300 rounded mt-2"
                      placeholder="Dirección del familiar"
                    />
                  )}
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="font-semibold mb-1 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={familiar.usaContactoTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaContactoTitular", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Usar contacto del titular
                  </label>
                  {!familiar.usaContactoTitular && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col">
                        <label className="text-sm mb-1">Teléfono (*)</label>
                        <input
                          type="text"
                          value={familiar.telefono || ""}
                          onChange={(e) => cambiarDatoFamiliar(i, "telefono", e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                        {errors[`familiares[${i}].telefono`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].telefono`]}</p>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm mb-1">Email (*)</label>
                        <input
                          type="email"
                          value={familiar.email || ""}
                          onChange={(e) => cambiarDatoFamiliar(i, "email", e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                        {errors[`familiares[${i}].email`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].email`]}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Situaciones del familiar */}
              <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-300 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Situaciones del familiar</h4>
                </div>

                <div className="space-y-2">
                  {(familiar.situaciones?.length || 0) === 0 && (
                    <p className="text-sm text-gray-500">No hay situaciones cargadas.</p>
                  )}

                  {familiar.situaciones?.map((s, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end w-full"
                    >
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold mb-1">Situación terapéutica</label>
                        <select
                          value={s.idSituacion}
                          onChange={(e) => updateSituacionFamiliar(i, idx, "idSituacion", e.target.value)}
                          className="p-2 border border-gray-300 rounded"
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
                        <label className="text-sm font-semibold mb-1">Fecha de finalización (opcional)</label>
                        <input
                          type="date"
                          value={s.fechaFinalizacion || ""}
                          onChange={(e) => updateSituacionFamiliar(i, idx, "fechaFinalizacion", e.target.value)}
                          className="p-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div className="justify-self-start md:justify-self-end">
                        <button
                          type="button"
                          onClick={() => removeSituacionFamiliar(i, idx)}
                          className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSituacionFamiliar(i)}
                    className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                    disabled={loadingSituaciones || situacionesDisponibles.length === 0}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarFamiliar}
            className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
          >
            + Agregar Familiar
          </button>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Crear Afiliado"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => setShowAltaPopup(true)}
          className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition w-full sm:w-auto"
          disabled={loading}
        >
          Programar Alta
        </button>
      </div>

      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-center">
          <p className="text-red-600 font-semibold">{errors.submit}</p>
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-center">
          <p className="text-green-600 font-semibold">{success}</p>
        </div>
      )}

      {showAltaPopup && (
        <AltaProgramadaPopup
          onClose={() => setShowAltaPopup(false)}
          onConfirm={handleProgramarAlta}
        />
      )}
    </div>
  );
}
