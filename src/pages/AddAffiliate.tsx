import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  situaciones?: Array<{ situacion: string; fechaFinalizacion: string }>;
}

const API_URL = import.meta.env.VITE_API_URL;

const isoToDDMMYYYY = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const SITUACIONES_TERAPEUTICAS = [
  { id: "embarazo", nombre: "Embarazo", requiereFin: true },
  { id: "diabetes", nombre: "Diabetes", requiereFin: false },
  { id: "miopia", nombre: "Miopía", requiereFin: false },
  { id: "hipertension", nombre: "Hipertensión", requiereFin: false },
  { id: "rehab_motriz", nombre: "Rehabilitación motriz", requiereFin: true },
  { id: "kinesiologia", nombre: "Kinesiología", requiereFin: true },
  { id: "psicoterapia", nombre: "Psicoterapia", requiereFin: true },
  { id: "fonoaudiologia", nombre: "Fonoaudiología", requiereFin: true },
  { id: "otra", nombre: "Otra", requiereFin: false },
];

export function AgregarAfiliado() {
  const navigate = useNavigate();
  const [showAltaPopup, setShowAltaPopup] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    dni: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    plan: "",
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
      direccion: "",
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

    if (!formData.dni?.trim()) newErrors.dni = "Requerido";
    if (!formData.nombre?.trim()) newErrors.nombre = "Requerido";
    if (!formData.apellido?.trim()) newErrors.apellido = "Requerido";

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "Requerido";
    } else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) newErrors.fechaNacimiento = "La fecha no puede ser futura";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email))
      newErrors.email = "Formato de email inválido";
    if (formData.email2 && !emailRegex.test(formData.email2))
      newErrors.email2 = "Formato de email inválido";

    if (!formData.plan) newErrors.plan = "Requerido";

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

    try {
      // Construir el payload según el formato esperado
      const payload = {
        dni: formData.dni,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        plan: parseInt(formData.plan) || undefined,
        familiares: familiares.map(f => ({
          dni: f.nroDocumento,
          nombre: f.nombre,
          apellido: f.apellido,
          parentesco: f.parentesco,
          email: f.usaContactoTitular ? formData.email : (f.email || undefined),
          telefono: f.usaContactoTitular ? formData.telefono : (f.telefono || undefined),
          direccion: f.usaDireccionTitular ? formData.direccion : (f.direccion || undefined),
        }))
      };

      const response = await fetch(`${API_URL}/affiliates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al crear el afiliado");
      }

      setLoading(false);
      setSuccess("Afiliado y familiares creados con éxito");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, submit: "Error al guardar: " + (err as Error).message }));
    }
  };

  return (
    <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 mx-auto mt-6 shadow">
      <div className="flex flex-col items-center sm:items-start mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center sm:text-left">
          Crear nuevo afiliado
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver
          </button>
          <button
            onClick={() => setShowAltaPopup(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Programar Alta
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* DATOS DE AFILIADO (Titular) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-green-600 text-lg font-semibold mb-4 border-b-2 border-green-600 pb-1">
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
                <option value="CUIL">CUIL</option>
                <option value="CUIT">CUIT</option>
                <option value="DOCUMENTO EXTRANJERO">DOCUMENTO EXTRANJERO</option>
                <option value="CDI">CDI</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nro Documento (*)</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.dni && (
                <p className="text-red-500 text-sm mt-1">{errors.dni}</p>
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
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="">Seleccionar...</option>
                <option value="1">Plan 1</option>
                <option value="2">Plan 2</option>
                <option value="3">Plan 3</option>
              </select>
              {errors.plan && (
                <p className="text-red-500 text-sm mt-1">{errors.plan}</p>
              )}
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-green-600 text-lg font-semibold mb-4 border-b-2 border-green-600 pb-1">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Teléfono"
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
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Dirección"
              />
            </div>
          </div>
        </div>

        {/* FAMILIARES A CARGO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-green-600 text-lg font-semibold mb-4 border-b-2 border-green-600 pb-1">
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
                    <option value="CUIL">CUIL</option>
                    <option value="CUIT">CUIT</option>
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

                <div className="flex flex-col col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={familiar.usaContactoTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaContactoTitular", e.target.checked)}
                    />
                    <span className="text-sm">Usar contacto del titular</span>
                  </label>
                </div>

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

                <div className="flex flex-col col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={familiar.usaDireccionTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaDireccionTitular", e.target.checked)}
                    />
                    <span className="text-sm">Usar dirección del titular</span>
                  </label>
                </div>

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
            </div>
          ))}

          <button
            type="button"
            onClick={agregarFamiliar}
            className="text-sm px-4 py-2 border-2 border-green-600 text-green-600 rounded font-semibold hover:bg-green-600 hover:text-white transition"
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
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Crear Afiliado"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
      </div>

      {errors.submit && <p className="text-red-500 text-center mt-2">{errors.submit}</p>}
      {success && <p className="text-green-600 text-center mt-2">{success}</p>}
    </div>
  );
}