

import { ButtonVolver } from "../util/ButtonVolver"
import { useNavigate } from "react-router-dom"

import React, { useState } from "react";
import { ButtonVolver } from "../util/ButtonVolver";
import { useNavigate } from "react-router-dom";
import type { Affiliate as AffiliateType } from "../components/AffiliatesTable";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string; // dd/mm/yyyy o string libre
}


export function AgregarAfiliado() {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    nroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "", // yyyy-mm-dd para input type="date"
    planMedico: "210",
    credencial: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    direccion2: "",
    parentesco: "",
  });
  const [showPhone2, setShowPhone2] = React.useState(false);
  const [showEmail2, setShowEmail2] = React.useState(false);
  const [showAddress2, setShowAddress2] = React.useState(false);
  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Situaciones helpers
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

  // Validación simple
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nroDocumento?.trim()) newErrors.nroDocumento = "Requerido";
    if (!formData.nombre?.trim()) newErrors.nombre = "Requerido";
    if (!formData.apellido?.trim()) newErrors.apellido = "Requerido";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Requerido";
    if (!formData.planMedico) newErrors.planMedico = "Requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatear fecha a dd/mm/yyyy
  const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  // Submit (mock)
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);

    const payload: AffiliateType = {
      credencial: formData.credencial,
      dni: formData.nroDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: formatDateToDDMMYYYY(formData.fechaNacimiento),
      plan: formData.planMedico,
      planMedico: formData.planMedico,
      direccion: formData.direccion,
      direccion2: formData.direccion2,
      telefono: formData.telefono,
      telefono2: formData.telefono2,
      email: formData.email,
      email2: formData.email2,
      parentesco: formData.parentesco,
      tipoDocumento: formData.tipoDocumento,
      nroDocumento: formData.nroDocumento,
      situaciones,
    } as AffiliateType;

    try {
      await new Promise((res) => setTimeout(res, 700));
      setLoading(false);
      setSuccess("Afiliado creado con éxito");
      setTimeout(() => navigate("/home"), 700);
    } catch (err) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, submit: "Error al guardar" }));
    }
  };

  return (
    <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 mx-auto mt-6 shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Crear nuevo afiliado</h1>
        <ButtonVolver text="Volver" onClick={() => navigate("/home")} />

        <h1>Crear nuevo afiliado</h1>
        </>
    )

import React, { useState } from "react";
import { ButtonVolver } from "../util/ButtonVolver";
import { useNavigate } from "react-router-dom";
import type { Affiliate as AffiliateType } from "../components/AffiliatesTable";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
}

// FAMILIAR: Estructura simple de cada familiar
interface Familiar {
  tipoDocumento: string;
  nroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  parentesco: string;
  telefono?: string;
  email?: string;
}

export function AgregarAfiliado() {
  const navigate = useNavigate();

  // Datos del titular
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

  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  
  // FAMILIAR: Lista de familiares (empieza vacía)
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Cambiar datos del titular
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Situaciones: agregar, eliminar y actualizar
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

  // FAMILIAR: Agregar un familiar nuevo vacío
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
    };
    setFamiliares([...familiares, nuevoFamiliar]);
  };

  // FAMILIAR: Eliminar un familiar por su posición
  const eliminarFamiliar = (posicion: number) => {
    setFamiliares(familiares.filter((_, i) => i !== posicion));
  };

  // FAMILIAR: Cambiar un dato de un familiar específico
  const cambiarDatoFamiliar = (posicion: number, campo: keyof Familiar, valor: string) => {
    const familiaresActualizados = [...familiares];
    familiaresActualizados[posicion] = {
      ...familiaresActualizados[posicion],
      [campo]: valor,
    };
    setFamiliares(familiaresActualizados);
  };

  // Validar campos obligatorios
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nroDocumento?.trim()) newErrors.nroDocumento = "Requerido";
    if (!formData.nombre?.trim()) newErrors.nombre = "Requerido";
    if (!formData.apellido?.trim()) newErrors.apellido = "Requerido";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Requerido";
    if (!formData.planMedico) newErrors.planMedico = "Requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convertir fecha de yyyy-mm-dd a dd/mm/yyyy
  const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  // Guardar todo
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);

    const payload: AffiliateType = {
      credencial: formData.credencial,
      dni: formData.nroDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: formatDateToDDMMYYYY(formData.fechaNacimiento),
      plan: formData.planMedico,
      planMedico: formData.planMedico,
      direccion: formData.direccion,
      direccion2: formData.direccion2,
      telefono: formData.telefono,
      telefono2: formData.telefono2,
      email: formData.email,
      email2: formData.email2,
      parentesco: formData.parentesco,
      tipoDocumento: formData.tipoDocumento,
      nroDocumento: formData.nroDocumento,
      situaciones,
    } as AffiliateType;

    try {
      // Simular guardado
      await new Promise((res) => setTimeout(res, 700));
      
      console.log("Titular guardado:", payload);
      console.log("Familiares guardados:", familiares);

      setLoading(false);
      setSuccess("Afiliado y familiares creados con éxito");
      setTimeout(() => navigate("/home"), 700);
    } catch (err) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, submit: "Error al guardar" }));
    }
  };

  return (
    <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 mx-auto mt-6 shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Crear nuevo afiliado</h1>
        <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
      </div>

      {/* TITULAR: Datos del afiliado principal */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
          Datos de Afiliado (Titular)

      </div>

      {/*Div central para poder copiar ese formulario y reutilizarlo en agregar familiar con el boton agregar familiar*/}
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* DATOS DE AFILIADO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo Documento */}
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

            {/* Nro Documento */}
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

            {/* Nombres */}
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

            {/* Apellidos */}
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

            {/* Fecha nacimiento */}
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

            {/* Plan Médico */}
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

            {/* Credencial( Revisar si esto se setea aca o en la logica del backend) */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Credencial</label>
              <input
                type="text"
                name="credencial"
                value={formData.credencial}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Parentesco */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Parentesco</label>
              <select
                name="parentesco"
                value={formData.parentesco}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="Titular">Titular</option>
                <option value="Cónyuge">Cónyuge</option>
                <option value="Hijo">Hijo</option>
                <option value="Familiar a cargo">Familiar a cargo</option>
              </select>
            </div>
          </div>
        </div>

        {/*DATOS DE CONTACTO*/}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="flex flex-col col-span-2">
              <label className="font-semibold mb-1">Teléfono</label>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 bg-gray-100 px-2">Dirección 2</label>
            <input
              type="text"
              name="direccion2"
              value={formData.direccion2}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* FAMILIAR: Sección de familiares */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
          Familiares a Cargo
        </h2>
        
        {/* Mostrar mensaje si no hay familiares */}
        {familiares.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">No hay familiares agregados.</p>
        )}
        
        {/* Mostrar cada familiar */}
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
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1 text-sm">Nombres</label>
                <input
                  type="text"
                  value={familiar.nombre}
                  onChange={(e) => cambiarDatoFamiliar(i, "nombre", e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1 text-sm">Apellidos</label>
                <input
                  type="text"
                  value={familiar.apellido}
                  onChange={(e) => cambiarDatoFamiliar(i, "apellido", e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1 text-sm">Fecha Nacimiento</label>
                <input
                  type="date"
                  value={familiar.fechaNacimiento}
                  onChange={(e) => cambiarDatoFamiliar(i, "fechaNacimiento", e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
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
                  <option value="Familiar a cargo">Familiar a cargo</option>
                </select>
              </div>

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
              </div>
            </div>
          </div>
        ))}

        {/* Botón para agregar familiar */}
        <button
          type="button"
          onClick={agregarFamiliar}
          className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"
        >
          + Agregar Familiar
        </button>


              {/* Teléfono principal */}
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="Teléfono"
              />

              {/* Segundo teléfono */}
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
                      setFormData((prev: typeof formData) => ({ ...prev, telefono2: "" }));
                      setShowPhone2(false);
                    }}
                    className="px-3 py-2 border rounded hover:bg-gray-50"
                  >
                    Quitar
                  </button>
                </div>
              )}


        </div>

      </div>

              {/* Botón agregar segundo teléfono */}
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
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev: typeof formData) => ({ ...prev, email2: "" }));
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

              <button
                type="button"
                onClick={() => removeSituacion(idx)}

                 className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"

                className="px-3 py-1 border rounded"

              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSituacion}

             className="text-sm px-4 py-2 border-2 border-[#5FA92C] text-[#5FA92C] rounded font-semibold hover:bg-[#5FA92C] hover:text-white transition"

            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"

          >
            + Agregar
          </button>


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
                      setFormData((prev: typeof formData) => ({ ...prev, direccion2: "" }));
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

        {/*SITUACIONES TERAPÉUTICAS (Falta que sea una lista de situaciones terapeuticas como la consigna lo pide*/}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Situaciones Terapéuticas
          </h2>
          <div className="space-y-2">
            {situaciones.length === 0 && (
              <p className="text-sm text-gray-500">No hay situaciones cargadas.</p>
            )}
            {situaciones.map((s, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Situación"
                  value={s.situacion}
                  onChange={(e) => updateSituacion(idx, "situacion", e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Fecha estimada de finalización"
                  value={s.fechaFinalizacion}
                  onChange={(e) => updateSituacion(idx, "fechaFinalizacion", e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeSituacion(idx)}
                  className="px-3 py-1 border rounded"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSituacion}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
            >
              + Agregar
            </button>
          </div>

        </div>
      </div>



      {/* Botones finales */}

      {/* Botones */}


      {/*BOTONES*/}

      <div className="flex justify-center gap-4 mt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition"
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

}

