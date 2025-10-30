import React, { useState } from "react";
import { ButtonVolver } from "../util/ButtonVolver";
import { ButtonProgramateAffiliate } from "../util/ButtonProgramateAffiliate";
import AltaProgramadaPopup from "../components/AltaProgramadaPopup";
import { useNavigate } from "react-router-dom";
import {
  PLAN_MAP,
  dateToISO,
  mapEmails,
  mapTelefonos,
  mapSituaciones
} from "../helpers/AffiliateApiHelpers";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
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
  situaciones?: Situacion[];
}

export function AgregarAfiliado() {
  const navigate = useNavigate();
  const [showAltaPopup, setShowAltaPopup] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    nroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    planMedico: "210",
    credencial: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    direccion2: "",
    parentesco: "Titular",
  });

  const [showPhone2, setShowPhone2] = useState(false);
  const [showEmail2, setShowEmail2] = useState(false);
  const [showAddress2, setShowAddress2] = useState(false);

  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSituacion = () =>
    setSituaciones((prev) => [...prev, { situacion: "", fechaFinalizacion: "" }]);

  const removeSituacion = (idx: number) =>
    setSituaciones((prev) => prev.filter((_, i) => i !== idx));

  const updateSituacion = (idx: number, field: keyof Situacion, value: string) => {
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
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = next[i].situaciones || [];
      next[i] = { ...next[i], situaciones: [...sit, { situacion: "", fechaFinalizacion: "" }] };
      return next;
    });
  };

  const updateSituacionFamiliar = (
    i: number,
    idx: number,
    field: "situacion" | "fechaFinalizacion",
    value: string
  ) => {
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = [...(next[i].situaciones || [])];
      sit[idx] = { ...sit[idx], [field]: value };
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

    // Validación Titular
    if (!formData.nroDocumento?.trim()) newErrors.nroDocumento = "Requerido";
    if (!formData.nombre?.trim()) newErrors.nombre = "Requerido";
    if (!formData.apellido?.trim()) newErrors.apellido = "Requerido";

    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Requerido";
    else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) newErrors.fechaNacimiento = "La fecha no puede ser futura";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email))
      newErrors.email = "Formato de email inválido";
    if (formData.email2 && !emailRegex.test(formData.email2))
      newErrors.email2 = "Formato de email inválido";

    if (!formData.planMedico) newErrors.planMedico = "Requerido";

    // Validación Familiares
    familiares.forEach((f, index) => {
      const prefix = `familiares[${index}]`;
      if (!f.nroDocumento?.trim()) newErrors[`${prefix}.nroDocumento`] = "Requerido";
      if (!f.nombre?.trim()) newErrors[`${prefix}.nombre`] = "Requerido";
      if (!f.apellido?.trim()) newErrors[`${prefix}.apellido`] = "Requerido";

      if (!f.fechaNacimiento) {
        newErrors[`${prefix}.fechaNacimiento`] = "Requerido";
      } else {
        const fechaNac = new Date(f.fechaNacimiento);
        const hoy = new Date();
        if (fechaNac > hoy) newErrors[`${prefix}.fechaNacimiento`] = "La fecha no puede ser futura";
      }

      if (f.email && !emailRegex.test(f.email))
        newErrors[`${prefix}.email`] = "Formato de email inválido";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);
    setErrors({});

    try {
      // Construir payload para la API
      const payload = {
        dni: formData.nroDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        direccion: formData.direccion || "",
        fecha_nacimiento: dateToISO(formData.fechaNacimiento),
        plan: PLAN_MAP[formData.planMedico] || 1,
        emails: mapEmails(formData.email, formData.email2),
        telefonos: mapTelefonos(formData.telefono, formData.telefono2),
        situaciones: mapSituaciones(situaciones),
        familiares: familiares.map(f => ({
          dni: f.nroDocumento,
          nombre: f.nombre,
          apellido: f.apellido,
          parentesco: f.parentesco,
          fecha_nacimiento: dateToISO(f.fechaNacimiento),
          direccion: f.usaDireccionTitular ? formData.direccion : (f.direccion || ""),
          emails: f.usaContactoTitular
            ? mapEmails(formData.email, formData.email2)
            : mapEmails(f.email),
          telefonos: f.usaContactoTitular
            ? mapTelefonos(formData.telefono, formData.telefono2)
            : mapTelefonos(f.telefono),
          situaciones: mapSituaciones(f.situaciones || []),
        })),
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      const response = await fetch(import.meta.env.BASE_URL + "/affiliates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      setLoading(false);
      setSuccess("Afiliado y familiares creados con éxito");

      // Redirigir después de 1 segundo
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el afiliado";
      setErrors({ submit: errorMessage });
      console.error("Error al crear afiliado:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 mx-auto mt-6 shadow">
      {/* Header */}
      <div className="flex flex-col items-center sm:items-start mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Crear nuevo afiliado
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
          <ButtonProgramateAffiliate
            text="Programar Alta"
            onClick={() => setShowAltaPopup(true)}
          />
        </div>
      </div>

      {showAltaPopup && (
        <AltaProgramadaPopup
          onClose={() => setShowAltaPopup(false)}
          onConfirm={(fechaISO) => {
            console.log("Alta programada para:", fechaISO);
            alert(`Alta programada para ${new Date(fechaISO).toLocaleString()}`);
            setShowAltaPopup(false);
          }}
        />
      )}

      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* DATOS DE AFILIADO (Titular) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado (Titular)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo Documento (*)</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="DNI">DNI</option>
                <option value="LE">CUIL</option>
                <option value="CUIT">CUIT</option>
                <option value="LC">DOCUMENTO EXTRANJERO</option>
                <option value="CDI">CDI</option>
                <option value="PASAPORTE">Pasaporte</option>
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
              >
                <option value="210">210</option>
                <option value="310">310</option>
                <option value="410">410</option>
                <option value="510">510</option>
                <option value="Bronce">Bronce</option>
                <option value="Plata">Plata</option>
                <option value="Oro">Oro</option>
                <option value="Platino">Platino</option>
              </select>
              {errors.planMedico && (
                <p className="text-red-500 text-sm mt-1">{errors.planMedico}</p>
              )}
            </div>

            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Parentesco</label>
              <input
                type="text"
                value="Titular"
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                disabled
                readOnly
              />
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Teléfono"
              />

              {showPhone2 && (
                <div className="mt-2 flex gap-2">
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

            {/* Email */}
            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1">Email</label>
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
                <div className="mt-2 flex gap-2">
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

            {/* Dirección */}
            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Dirección"
              />

              {showAddress2 && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    name="direccion2"
                    value={formData.direccion2}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    placeholder="Dirección adicional"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, direccion2: "" }));
                      setShowAddress2(false);
                    }}
                    className="px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Quitar
                  </button>
                </div>
              )}

              {!showAddress2 && (
                <button
                  type="button"
                  onClick={() => setShowAddress2(true)}
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

            {situaciones.map((s, idx) => {
              const tieneFecha = ["embarazo", "rehab_motriz", "kinesiologia", "psicoterapia", "fonoaudiologia"].includes(s.situacion);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end w-full"
                >
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">Situación terapéutica</label>
                    <select
                      value={s.situacion}
                      onChange={(e) => updateSituacion(idx, "situacion", e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="embarazo">Embarazo</option>
                      <option value="diabetes">Diabetes</option>
                      <option value="miopia">Miopía</option>
                      <option value="hipertension">Hipertensión</option>
                      <option value="rehab_motriz">Rehabilitación motriz</option>
                      <option value="kinesiologia">Kinesiología</option>
                      <option value="psicoterapia">Psicoterapia</option>
                      <option value="fonoaudiologia">Fonoaudiología</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>

                  {tieneFecha ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold mb-1">Fecha de finalización</label>
                      <input
                        type="date"
                        value={s.fechaFinalizacion || ""}
                        onChange={(e) => updateSituacion(idx, "fechaFinalizacion", e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="justify-self-end">
                    <button
                      type="button"
                      onClick={() => removeSituacion(idx)}
                      className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addSituacion}
              className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
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
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Familiar {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => eliminarFamiliar(i)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Tipo Documento</label>
                  <select
                    value={familiar.tipoDocumento}
                    onChange={(e) => cambiarDatoFamiliar(i, "tipoDocumento", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="DNI">DNI</option>
                    <option value="LE">CUIL</option>
                    <option value="CUIT">CUIT</option>
                    <option value="LC">DOCUMENTO EXTRANJERO</option>
                    <option value="CDI">CDI</option>
                    <option value="PASAPORTE">Pasaporte</option>
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

                {/* Checkboxes para usar datos del titular */}
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={familiar.usaDireccionTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaDireccionTitular", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Usar dirección del titular
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={familiar.usaContactoTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaContactoTitular", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Usar teléfono y email del titular
                  </label>
                </div>

                {/* Mostrar campos de contacto solo si NO usa los del titular */}
                {!familiar.usaContactoTitular && (
                  <>
                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-sm">Teléfono</label>
                      <input
                        type="text"
                        value={familiar.telefono || ""}
                        onChange={(e) => cambiarDatoFamiliar(i, "telefono", e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-semibold mb-1 text-sm">Email</label>
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
                  </>
                )}

                {/* Mostrar campo de dirección solo si NO usa la del titular */}
                {!familiar.usaDireccionTitular && (
                  <div className="flex flex-col col-span-2">
                    <label className="font-semibold mb-1 text-sm">Dirección</label>
                    <input
                      type="text"
                      value={familiar.direccion || ""}
                      onChange={(e) => cambiarDatoFamiliar(i, "direccion", e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>

              {/* Situaciones del familiar */}
              <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-300 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Situaciones del familiar</h4>
                </div>

                <div className="space-y-2">
                  {(!familiar.situaciones || familiar.situaciones.length === 0) && (
                    <p className="text-sm text-gray-500">No hay situaciones cargadas.</p>
                  )}

                  {(familiar.situaciones || []).map((s, idx) => {
                    const tieneFecha = ["embarazo", "rehab_motriz", "kinesiologia", "psicoterapia", "fonoaudiologia"].includes(s.situacion);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end w-full"
                      >
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold mb-1">Situación terapéutica</label>
                          <select
                            value={s.situacion}
                            onChange={(e) => updateSituacionFamiliar(i, idx, "situacion", e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                          >
                            <option value="">-- Seleccionar --</option>
                            <option value="embarazo">Embarazo</option>
                            <option value="diabetes">Diabetes</option>
                            <option value="miopia">Miopía</option>
                            <option value="hipertension">Hipertensión</option>
                            <option value="rehab_motriz">Rehabilitación motriz</option>
                            <option value="kinesiologia">Kinesiología</option>
                            <option value="psicoterapia">Psicoterapia</option>
                            <option value="fonoaudiologia">Fonoaudiología</option>
                            <option value="otra">Otra</option>
                          </select>
                        </div>

                        {tieneFecha ? (
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-1">Fecha de finalización</label>
                            <input
                              type="date"
                              value={s.fechaFinalizacion || ""}
                              onChange={(e) => updateSituacionFamiliar(i, idx, "fechaFinalizacion", e.target.value)}
                              className="p-2 border border-gray-300 rounded"
                            />
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="justify-self-end">
                          <button
                            type="button"
                            onClick={() => removeSituacionFamiliar(i, idx)}
                            className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => addSituacionFamiliar(i)}
                    className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
                  >
                    + Agregar Situación
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
      <div className="flex justify-center gap-4 mt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Crear Afiliado"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
          disabled={loading}
        >
          Cancelar
        </button>
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-center font-semibold">{errors.submit}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600 text-center font-semibold">{success}</p>
        </div>
      )}
    </div>
  );
}