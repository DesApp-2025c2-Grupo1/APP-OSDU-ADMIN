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
    // aseguro al menos 1 item
    especialidades: (provider.especialidades && provider.especialidades.length > 0) ? provider.especialidades : [""],
    integraCentroMedico: provider.integraCentroMedico || null,
    telefonos: (provider.telefonos && provider.telefonos.length > 0) ? provider.telefonos : [""],
    emails: (provider.emails && provider.emails.length > 0) ? provider.emails : [""],
    direcciones: (provider.direcciones && provider.direcciones.length > 0)
      ? provider.direcciones
      : [{ etiqueta: "", calle: "", numero: "", localidad: "", provincia: "", cp: "", horarios: [] as any[] }],
  });

  // --------- handlers básicos ----------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // telefonos / emails (array simple)
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

  const handleRemoveFromArray = (field: "telefonos" | "emails", index: number) => {
    setFormData(prev => {
      if (prev[field].length <= 1) return prev; // dejar al menos 1
      const newArray = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: newArray };
    });
  };

  // especialidades (array simple)
  const handleEspecialidadChange = (index: number, value: string) => {
    const newEspecialidades = [...formData.especialidades];
    newEspecialidades[index] = value;
    setFormData(prev => ({ ...prev, especialidades: newEspecialidades }));
  };

  const handleAddEspecialidad = () => {
    setFormData(prev => ({ ...prev, especialidades: [...prev.especialidades, ""] }));
  };

  const handleRemoveEspecialidad = (index: number) => {
    setFormData(prev => {
      if (prev.especialidades.length <= 1) return prev;
      const arr = prev.especialidades.filter((_, i) => i !== index);
      return { ...prev, especialidades: arr };
    });
  };

  // direcciones (array de objetos)
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
      horarios: [] as any[],
    };
    setFormData(prev => ({ ...prev, direcciones: [...prev.direcciones, nuevaDireccion] }));
  };

  const handleRemoveDireccion = (index: number) => {
    setFormData(prev => {
      if (prev.direcciones.length <= 1) return prev;
      const arr = prev.direcciones.filter((_, i) => i !== index);
      return { ...prev, direcciones: arr };
    });
  };

  // guardar
  const handleSave = () => {
    const updatedProvider: Prestador = {
      ...provider,
      cuilCuit: formData.cuilCuit,
      nombreCompleto: formData.nombreCompleto,
      tipo: formData.tipo as Prestador["tipo"],
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

          {/* En mobile: 1 columna / En desktop: 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CUIL / CUIT */}
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

            {/* Nombre Completo */}
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

            {/* Tipo de Prestador */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo de Prestador</label>
              <div className="relative">
                <select
                  name="tipo"
                  value={formData.tipo}
                  disabled
                  className="p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-default appearance-none w-full"
                >
                  <option value="profesional">Profesional</option>
                  <option value="centro">Centro Médico</option>
                </select>
              </div>
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
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={esp}
                  onChange={(e) => handleEspecialidadChange(idx, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder={`Especialidad ${idx + 1}`}
                />
                {formData.especialidades.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEspecialidad(idx)}
                    className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                    title="Eliminar especialidad"
                    aria-label="Eliminar especialidad"
                  >
                    X
                  </button>
                )}
              </div>
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

          {/* En mobile se vuelve una sola columna */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teléfonos */}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Teléfonos</label>
              {formData.telefonos.map((tel, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tel}
                    onChange={(e) => handleArrayChange(e, "telefonos", idx)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  {formData.telefonos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray("telefonos", idx)}
                      className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                      title="Eliminar teléfono"
                      aria-label="Eliminar teléfono"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => handleAddToArray("telefonos")}
                className="text-sm text-[#5FA92C] font-semibold hover:underline"
              >
                + Agregar teléfono
              </button>
            </div>

            {/* Emails */}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Emails</label>
              {formData.emails.map((mail, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={mail}
                    onChange={(e) => handleArrayChange(e, "emails", idx)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  {formData.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray("emails", idx)}
                      className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                      title="Eliminar email"
                      aria-label="Eliminar email"
                    >
                      X
                    </button>
                  )}
                </div>
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
            <div key={idx} className="relative grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 border p-3 rounded-lg">
              {/* Botón eliminar dirección */}
              {formData.direcciones.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDireccion(idx)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full border text-red-500 bg-white hover:bg-gray-50"
                  title="Eliminar dirección"
                  aria-label="Eliminar dirección"
                >
                  X
                </button>
              )}

              {/* Fila 1 (mobile): ETIQUETA | CALLE */}
              <input
                type="text"
                value={dir.etiqueta || ""}
                onChange={(e) => handleDireccionChange(idx, "etiqueta", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Etiqueta"
              />
              <input
                type="text"
                value={dir.calle || ""}
                onChange={(e) => handleDireccionChange(idx, "calle", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Calle"
              />

              {/* Fila 2 (mobile): NÚMERO | LOCALIDAD */}
              <input
                type="text"
                value={dir.numero || ""}
                onChange={(e) => handleDireccionChange(idx, "numero", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Número"
              />
              <input
                type="text"
                value={dir.localidad || ""}
                onChange={(e) => handleDireccionChange(idx, "localidad", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Localidad"
              />

              {/* Fila 3 (mobile): PROVINCIA | CÓDIGO POSTAL */}
              <input
                type="text"
                value={dir.provincia || ""}
                onChange={(e) => handleDireccionChange(idx, "provincia", e.target.value)}
                className="p-2 border border-gray-300 rounded"
                placeholder="Provincia"
              />
              <input
                type="text"
                value={dir.cp || ""}
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
