import React, { useState } from "react";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
}

interface AddFamiliarMemberProps {
  grupoId: string | undefined;
  planFijo: string;
  onClose: () => void;
  onSave: (familiar: any) => void;
}

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

export function AddFamiliarMember({ grupoId, planFijo, onClose, onSave }: AddFamiliarMemberProps) {
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

  const [situaciones, setSituaciones] = useState<Situacion[]>([]);

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

              {situaciones.map((situacion, index) => {
                const tieneFecha = ["embarazo", "rehab_motriz", "kinesiologia", "psicoterapia", "fonoaudiologia"].includes(situacion.situacion);
                return (
                  <div key={index} className="grid grid-cols-3 gap-3 items-end">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">Situación</label>
                      <select
                        value={situacion.situacion}
                        onChange={(e) => actualizarSituacion(index, "situacion", e.target.value)}
                        className="p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="">-- Seleccionar --</option>
                        {SITUACIONES_TERAPEUTICAS.map(sit => (
                          <option key={sit.id} value={sit.id}>{sit.nombre}</option>
                        ))}
                      </select>
                    </div>
                    {tieneFecha && (
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Fecha Finalización</label>
                        <input
                          type="date"
                          value={situacion.fechaFinalizacion}
                          onChange={(e) => actualizarSituacion(index, "fechaFinalizacion", e.target.value)}
                          className="p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
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
                );
              })}
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
