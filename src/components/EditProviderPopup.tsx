import React, { useState } from "react";
import type { Prestador } from "../model/Provider.model";

type DiaSemana = 1|2|3|4|5|6|0; 
type BloqueHorario = { dias: DiaSemana[]; desde: string; hasta: string };

interface DireccionForm {
  etiqueta?: string;
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  cp: string;
  horarios: BloqueHorario[];
}

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
    especialidades: provider.especialidades?.length ? provider.especialidades : [""],
    telefonos: provider.telefonos?.length ? provider.telefonos : [""],
    emails: provider.emails?.length ? provider.emails : [""],
    direcciones: (provider.direcciones?.length
      ? provider.direcciones
      : [{ calle: "", numero: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] }]
    ) as unknown as DireccionForm[],
    integraCentroMedico: provider.integraCentroMedico || null,
  });

  // ---------- helpers campos simples ----------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ---------- especialidades ----------
  const setEsp = (i: number, val: string) => {
    const arr = [...formData.especialidades];
    arr[i] = val;
    setFormData(prev => ({ ...prev, especialidades: arr }));
  };
  const addEsp = () => setFormData(prev => ({ ...prev, especialidades: [...prev.especialidades, ""] }));
  const delEsp = (i: number) =>
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.length > 1 ? prev.especialidades.filter((_, idx) => idx !== i) : prev.especialidades
    }));

  // ---------- telefonos / emails ----------
  const setArr = (field: "telefonos" | "emails", i: number, val: string) => {
    const arr = [...formData[field]];
    arr[i] = val;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };
  const addArr = (field: "telefonos" | "emails") =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  const delArr = (field: "telefonos" | "emails", i: number) =>
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].length > 1 ? prev[field].filter((_, idx) => idx !== i) : prev[field]
    }));

  // ---------- direcciones ----------
  const handleDireccionChange = (i: number, campo: keyof DireccionForm, valor: string) => {
    const arr = [...formData.direcciones];
    (arr[i] as any)[campo] = valor;
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };
  const handleAgregarDireccion = () => {
    setFormData(prev => ({
      ...prev,
      direcciones: [
        ...prev.direcciones,
        { etiqueta: "", calle: "", numero: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] }
      ]
    }));
  };
  const handleEliminarDireccion = (i: number) => {
    setFormData(prev => ({
      ...prev,
      direcciones: prev.direcciones.length > 1 ? prev.direcciones.filter((_, idx) => idx !== i) : prev.direcciones
    }));
  };

  // ---------- horarios (bloques) ----------
  const addBloque = (dirIdx: number) => {
    const arr = [...formData.direcciones];
    arr[dirIdx].horarios.push({ dias: [], desde: "", hasta: "" });
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };
  const removeBloque = (dirIdx: number, bloqueIdx: number) => {
    const arr = [...formData.direcciones];
    arr[dirIdx].horarios.splice(bloqueIdx, 1);
    if (arr[dirIdx].horarios.length === 0) arr[dirIdx].horarios.push({ dias: [], desde: "", hasta: "" });
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };
  const toggleDia = (dirIdx: number, bloqueIdx: number, dia: DiaSemana) => {
    const arr = [...formData.direcciones];
    const bloque = arr[dirIdx].horarios[bloqueIdx];
    const esta = bloque.dias.includes(dia);
    bloque.dias = esta ? bloque.dias.filter(d => d !== dia) : [...bloque.dias, dia];
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };
  const setDesde = (dirIdx: number, bloqueIdx: number, value: string) => {
    const arr = [...formData.direcciones];
    arr[dirIdx].horarios[bloqueIdx].desde = value;
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };
  const setHasta = (dirIdx: number, bloqueIdx: number, value: string) => {
    const arr = [...formData.direcciones];
    arr[dirIdx].horarios[bloqueIdx].hasta = value;
    setFormData(prev => ({ ...prev, direcciones: arr }));
  };

  const diasSemana: { id: DiaSemana; label: string }[] = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mié" },
    { id: 4, label: "Jue" },
    { id: 5, label: "Vie" },
    { id: 6, label: "Sáb" },
  ];

  const handleSave = () => {
    const updated: Prestador = {
      ...provider,
      cuilCuit: formData.cuilCuit,
      nombreCompleto: formData.nombreCompleto,
      tipo: formData.tipo,
      especialidades: formData.especialidades,
      telefonos: formData.telefonos,
      emails: formData.emails,
      direcciones: formData.direcciones as any,
      integraCentroMedico: formData.integraCentroMedico,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800">✕</button>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Prestador</h1>

        {/* DATOS DEL PRESTADOR */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Datos del Prestador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Tipo: mostrar sin permitir editar (sin flechita) */}
            <div className="flex flex-col sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo de Prestador</label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-700 select-none pointer-events-none">
                <span className="capitalize">{formData.tipo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Especialidades</h2>
          {formData.especialidades.map((esp, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={esp}
                onChange={(e) => setEsp(i, e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder={`Especialidad ${i + 1}`}
              />
              {formData.especialidades.length > 1 && (
                <button
                  type="button"
                  onClick={() => delEsp(i)}
                  className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addEsp} className="text-sm text-[#5FA92C] font-semibold hover:underline">
            + Agregar especialidad
          </button>
        </div>

        {/* CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Contacto</h2>

          {/* Teléfonos (stack en mobile) */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">Teléfonos</label>
            {formData.telefonos.map((tel, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tel}
                  onChange={(e) => setArr("telefonos", i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
                {formData.telefonos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => delArr("telefonos", i)}
                    className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArr("telefonos")} className="text-sm text-[#5FA92C] font-semibold hover:underline">
              + Agregar teléfono
            </button>
          </div>

          {/* Emails */}
          <div>
            <label className="font-semibold mb-2 block">Emails</label>
            {formData.emails.map((mail, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setArr("emails", i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
                {formData.emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => delArr("emails", i)}
                    className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArr("emails")} className="text-sm text-[#5FA92C] font-semibold hover:underline">
              + Agregar email
            </button>
          </div>
        </div>

        {/* DIRECCIONES (editable como pediste) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Direcciones</h2>

          {formData.direcciones.map((dir, idx) => (
            <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
              {/* Campos base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder="Calle"
                  value={dir.calle}
                  onChange={(e) => handleDireccionChange(idx, "calle", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder="Número"
                  value={dir.numero}
                  onChange={(e) => handleDireccionChange(idx, "numero", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder="Localidad"
                  value={dir.localidad}
                  onChange={(e) => handleDireccionChange(idx, "localidad", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder="Provincia"
                  value={dir.provincia}
                  onChange={(e) => handleDireccionChange(idx, "provincia", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder="Código Postal"
                  value={dir.cp}
                  onChange={(e) => handleDireccionChange(idx, "cp", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div>


              {formData.direcciones.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleEliminarDireccion(idx)}
                  className="mt-2 text-red-500 font-semibold text-sm"
                >
                  Eliminar dirección
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAgregarDireccion}
            className="text-[#5FA92C] text-sm font-semibold"
          >
            + Agregar otra dirección
          </button>
        </div>

        {/* BOTONES */}
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={handleSave} className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition">
            Guardar Cambios
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
