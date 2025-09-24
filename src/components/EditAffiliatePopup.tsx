import React, { useState } from "react";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
}

interface Affiliate {
  tipoDocumento?: string;
  nroDocumento?: string;
  dni?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
  planMedico?: string;
  plan?: string;
  credencial?: string;
  telefono?: string;
  telefono2?: string;
  email?: string;
  email2?: string;
  direccion?: string;
  direccion2?: string;
  situaciones?: Situacion[];
}

interface EditAffiliatePopupProps {
  affiliate: Affiliate;
  onClose: () => void;
  onSave: (data: Affiliate) => void;
}

export function EditAffiliatePopup({ affiliate, onClose, onSave }: EditAffiliatePopupProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: affiliate.tipoDocumento || "DNI",
    nroDocumento: affiliate.nroDocumento || affiliate.dni || "",
    nombres: affiliate.nombre || "",
    apellidos: affiliate.apellido || "",
    fechaNacimiento: affiliate.fechaNacimiento || "",
    planMedico: affiliate.planMedico || affiliate.plan || "",
    credencial: affiliate.credencial || "",
    telefono: affiliate.telefono || "",
    telefono2: affiliate.telefono2 || "",
    email: affiliate.email || "",
    email2: affiliate.email2 || "",
    direccion: affiliate.direccion || "",
    direccion2: affiliate.direccion2 || ""
  });

  const [situaciones, setSituaciones] = useState(
    affiliate.situaciones || [
      { situacion: "Operación Meniscal", fechaFinalizacion: "13/06/2024" },
      { situacion: "acompañamiento terapéutico", fechaFinalizacion: "-" }
    ]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, situaciones });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        {/* Título */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Afiliado</h1>

        {/* Datos de Afiliado */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado
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
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombres (*)</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Apellidos (*)</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
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
                <option value="Integral 210">Integral 210</option>
                <option value="Básico 110">Básico 110</option>
                <option value="Premium 310">Premium 310</option>
              </select>
            </div>
          </div>
        </div>

        {/* Situaciones Terapéuticas */}
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
                  className="p-2 border border-gray-300 rounded"
                  placeholder="Situación"
                />
                <input
                  type="text"
                  value={sit.fechaFinalizacion}
                  onChange={(e) => {
                    const newSituaciones = [...situaciones];
                    newSituaciones[idx].fechaFinalizacion = e.target.value;
                    setSituaciones(newSituaciones);
                  }}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="Fecha estimada de finalización"
                />
              </div>
            ))}
          </div>

          {/* <button
            onClick={() => setSituaciones([...situaciones, { situacion: "", fechaFinalizacion: "" }])}
            className="mt-4 px-4 py-2 bg-[#5FA92C] text-white rounded flex items-center gap-2"
          >
            <AddIcon className="w-4 h-4" />
            Agregar Situación
          </button> */}
        </div>

        {/* Botones */}
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
