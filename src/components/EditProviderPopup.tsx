import React, { useState } from "react";
import type { Prestador } from "../model/Provider.model";

interface EditProviderPopupProps {
  provider: Prestador;
  onClose: () => void;
  onSave: (data: Prestador) => void;
}

export function EditProviderPopup({ provider, onClose, onSave }: EditProviderPopupProps) {
  const [formData, setFormData] = useState({
    cuilCuit: provider.cuilCuit || "",
    nombreCompleto: provider.nombreCompleto || "",
    tipo: provider.tipo || "profesional",
    especialidades: provider.especialidades || [],
    integraCentroMedico: provider.integraCentroMedico || null,
    telefonos: provider.telefonos || [""],
    emails: provider.emails || [""],
    direcciones: provider.direcciones || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "telefonos" | "emails",
    index: number
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleAddToArray = (field: "telefonos" | "emails") => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleEspecialidadChange = (index: number, value: string) => {
    const newEspecialidades = [...formData.especialidades];
    newEspecialidades[index] = value;
    setFormData(prev => ({ ...prev, especialidades: newEspecialidades }));
  };

  const handleAddEspecialidad = () => {
    setFormData(prev => ({ ...prev, especialidades: [...prev.especialidades, ""] }));
  };

  const handleDireccionChange = (index: number, field: string, value: string) => {
    const newDirecciones = [...formData.direcciones];
    newDirecciones[index] = { ...newDirecciones[index], [field]: value };
    setFormData(prev => ({ ...prev, direcciones: newDirecciones }));
  };

  const handleAddDireccion = () => {
    const nuevaDireccion = {
      etiqueta: "",
      calle: "",
      numero: "",
      localidad: "",
      provincia: "",
      cp: "",
      horarios: [],
    };
    setFormData(prev => ({ ...prev, direcciones: [...prev.direcciones, nuevaDireccion] }));
  };

  const handleSave = () => {
    const updatedProvider: Prestador = {
      ...provider,
      cuilCuit: formData.cuilCuit,
      nombreCompleto: formData.nombreCompleto,
      tipo: formData.tipo,
      especialidades: formData.especialidades,
      integraCentroMedico: formData.integraCentroMedico,
      telefonos: formData.telefonos,
      emails: formData.emails,
      direcciones: formData.direcciones,
    };

    onSave(updatedProvider);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Editar Prestador
        </h1>

        {/* DATOS PRINCIPALES */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos del Prestador
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">CUIL / CUIT (*)</label>
              <input
                type="text"
                name="cuilCuit"
                value={formData.cuilCuit}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombre Completo (*)</label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo de Prestador</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="profesional">Profesional</option>
                <option value="centro">Centro Médico</option>
              </select>
            </div>
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Especialidades
          </h2>
          <div className="space-y-2">
            {formData.especialidades.map((esp, idx) => (
              <input
                key={idx}
                type="text"
                value={esp}
                onChange={(e) => handleEspecialidadChange(idx, e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder={`Especialidad ${idx + 1}`}
              />
            ))}
            <button
              onClick={handleAddEspecialidad}
              className="text-sm text-[#5FA92C] font-semibold hover:underline"
            >
              + Agregar especialidad
            </button>
          </div>
        </div>

        {/* CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Contacto
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Teléfonos</label>
              {formData.telefonos.map((tel, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={tel}
                  onChange={(e) => handleArrayChange(e, "telefonos", idx)}
                  className="p-2 border border-gray-300 rounded w-full mb-2"
                />
              ))}
              <button
                onClick={() => handleAddToArray("telefonos")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar teléfono
              </button>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Emails</label>
              {formData.emails.map((mail, idx) => (
                <input
                  key={idx}
                  type="email"
                  value={mail}
                  onChange={(e) => handleArrayChange(e, "emails", idx)}
                  className="p-2 border border-gray-300 rounded w-full mb-2"
                />
              ))}
              <button
                onClick={() => handleAddToArray("emails")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar email
              </button>
            </div>
          </div>
        </div>

        {/* DIRECCIONES */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Direcciones
          </h2>
          {formData.direcciones.map((dir, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 mb-4 border p-3 rounded-lg">
              <input
                type="text"
                value={dir.etiqueta}
                onChange={(e) => handleDireccionChange(idx, "etiqueta", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Etiqueta"
              />
              <input
                type="text"
                value={dir.calle}
                onChange={(e) => handleDireccionChange(idx, "calle", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Calle"
              />
              <input
                type="text"
                value={dir.numero}
                onChange={(e) => handleDireccionChange(idx, "numero", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Número"
              />
              <input
                type="text"
                value={dir.localidad}
                onChange={(e) => handleDireccionChange(idx, "localidad", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Localidad"
              />
              <input
                type="text"
                value={dir.provincia}
                onChange={(e) => handleDireccionChange(idx, "provincia", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Provincia"
              />
              <input
                type="text"
                value={dir.cp}
                onChange={(e) => handleDireccionChange(idx, "cp", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Código Postal"
              />
            </div>
          ))}
          <button
            onClick={handleAddDireccion}
            className="text-sm text-[#5FA92C] font-semibold hover:underline"
          >
            + Agregar dirección
          </button>
        </div>

        {/* BOTONES */}
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
