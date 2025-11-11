import React, { useState } from "react";
import type { Affiliate as AffiliateType } from "./AffiliatesTable";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
}

interface EditAffiliatePopupProps {
  affiliate: AffiliateType;
  onClose: () => void;
  onSave: (data: AffiliateType) => void;
}

export function EditAffiliatePopup({ affiliate, onClose, onSave }: EditAffiliatePopupProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: affiliate.tipoDocumento || "DNI",
    nroDocumento: affiliate.nroDocumento || affiliate.dni || "",
    nombre: affiliate.nombre || "",
    apellido: affiliate.apellido || "",
    fechaNacimiento: affiliate.fechaNacimiento || "",
    planMedico: affiliate.planMedico || affiliate.plan || "",
    plan: affiliate.plan || "",
    credencial: affiliate.credencial || "",

    telefono: affiliate.telefono || "",
    telefono2: affiliate.telefono2 || "",
    email: affiliate.email || "",
    email2: affiliate.email2 || "",
    direccion: affiliate.direccion || "",
    direccion2: affiliate.direccion2 || "",

    parentesco: affiliate.parentesco || "",
    dni: affiliate.dni || affiliate.nroDocumento || "",

    telefonos: [affiliate.telefono, affiliate.telefono2].filter(Boolean).length
      ? [affiliate.telefono || "", affiliate.telefono2 || ""].filter(Boolean)
      : [""],
    mails: [affiliate.email, affiliate.email2].filter(Boolean).length
      ? [affiliate.email || "", affiliate.email2 || ""].filter(Boolean)
      : [""],
    direcciones: [affiliate.direccion, affiliate.direccion2].filter(Boolean).length
      ? [affiliate.direccion || "", affiliate.direccion2 || ""].filter(Boolean)
      : [""],
  });

  const [situaciones, setSituaciones] = useState<Situacion[]>(
    affiliate.situaciones || [
      { situacion: "Operación Meniscal", fechaFinalizacion: "13/06/2024" },
      { situacion: "acompañamiento terapéutico", fechaFinalizacion: "-" }
    ]
  );

  // Handler blindado: ignora cambios en tipoDocumento y nroDocumento
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tipoDocumento" || name === "nroDocumento") return; // bloquea modificaciones
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedAffiliate: AffiliateType = {
      credencial: formData.credencial,
      dni: formData.nroDocumento || formData.dni || "",
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: formData.fechaNacimiento,
      plan: formData.plan || formData.planMedico,
      direccion: formData.direccion,
      parentesco: formData.parentesco,
      tipoDocumento: formData.tipoDocumento,
      nroDocumento: formData.nroDocumento,
      planMedico: formData.planMedico,
      telefono: formData.telefono,
      telefono2: formData.telefono2,
      email: formData.email,
      email2: formData.email2,
      direccion2: formData.direccion2,
      situaciones: situaciones,
    };

    onSave(updatedAffiliate);
    onClose();
  };

  const setArr = (field: "telefonos" | "mails" | "direcciones", i: number, val: string) => {
    const arr = [...(formData as any)[field]];
    arr[i] = val;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const addArr = (field: "telefonos" | "mails" | "direcciones") =>
    setFormData(prev => ({ ...prev, [field]: [...(prev as any)[field], ""] }));

  const delArr = (field: "telefonos" | "mails" | "direcciones", i: number) =>
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, idx: number) => idx !== i),
    }));

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Afiliado</h1>

        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de documento - DESHABILITADO */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo Documento (*)</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                disabled
                title="Campo no editable"
              >
                <option value="DNI">DNI</option>
                <option value="LE">CUIL</option>
                <option value="CUIT">CUIT</option>
                <option value="LC">DOCUMENTO EXTRANJERO</option>
                <option value="CDI">CDI</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            {/* Nro de documento - SOLO LECTURA */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nro Documento (*)</label>
              <input
                type="text"
                name="nroDocumento"
                value={formData.nroDocumento}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                readOnly
              />
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
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Fecha nacimiento (*)</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento.split('/').reverse().join('-')}
                onChange={(e) => {
                  const date = e.target.value.split('-').reverse().join('/');
                  setFormData(prev => ({ ...prev, fechaNacimiento: date }));
                }}
                className="p-2 border border-gray-300 rounded"
              />
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
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Contacto
          </h2>
          <div className="space-y-6">
            {/* Teléfonos */}
            <div>
              <label className="font-semibold mb-2 block">Teléfonos</label>
              {formData.telefonos.map((tel: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={tel}
                    onChange={(e) => setArr("telefonos", i, e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                    autoComplete="tel"
                  />
                  <button
                    type="button"
                    onClick={() => delArr("telefonos", i)}
                    className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArr("telefonos")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar teléfono
              </button>
            </div>

            {/* Emails */}
            <div>
              <label className="font-semibold mb-2 block">Emails</label>
              {formData.mails.map((mail: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={mail}
                    onChange={(e) => setArr("mails", i, e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                    autoComplete="email"
                  />
                  <button
                    type="button"
                    onClick={() => delArr("mails", i)}
                    className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArr("mails")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar email
              </button>
            </div>

            {/* Direcciones */}
            <div>
              <label className="font-semibold mb-2 block">Direcciones</label>
              {formData.direcciones.map((dir: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dir}
                    onChange={(e) => setArr("direcciones", i, e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                    placeholder={i === 0 ? "Calle 123, Piso/Depto, Localidad" : "Opcional"}
                    autoComplete="street-address"
                  />
                  <button
                    type="button"
                    onClick={() => delArr("direcciones", i)}
                    className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArr("direcciones")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar dirección
              </button>
            </div>
          </div>
        </div>

        {/* SITUACIONES TERAPÉUTICAS (solo lectura) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Situaciones Terapéuticas
          </h2>

          <div className="space-y-2">
            {situaciones.map((sit, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={sit.situacion}
                  onChange={(e) => {
                    const newSituaciones = [...situaciones];
                    newSituaciones[idx].situacion = e.target.value;
                    setSituaciones(newSituaciones);
                  }}
                  className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                  placeholder="Situación"
                  disabled
                />
                <input
                  type="text"
                  value={sit.fechaFinalizacion}
                  onChange={(e) => {
                    const newSituaciones = [...situaciones];
                    newSituaciones[idx].fechaFinalizacion = e.target.value;
                    setSituaciones(newSituaciones);
                  }}
                  className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                  placeholder="Fecha estimada de finalización"
                  disabled
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleSave}
            className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
