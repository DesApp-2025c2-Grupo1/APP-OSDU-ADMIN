import { useState, useEffect } from "react";
import type { Prestador, LugarAtencion, Especialidad } from "../model/Provider.model";
import { SPECIALTIES } from "../data/specialties";
import { updateProvider } from "../api/providerService";
import { API_BASE_URL } from "../config/api";

interface EditProviderPopupProps {
  provider: Prestador;
  onClose: () => void;
  onSave: (data: Prestador) => void;
}

export function EditProviderPopup({ provider, onClose, onSave }: EditProviderPopupProps) {
  const [formData, setFormData] = useState({
    cuitCuil: provider.cuitCuil || "",
    nombreCompleto: provider.nombreCompleto || "",
    tipoPrestador: provider.tipoPrestador || "profesional",
    especialidades: provider.especialidades || [],
    telefonos: provider.telefonos || [""],
    mails: provider.mails || [""],
    lugaresAtencion: provider.lugaresAtencion || [],
    centroMedicoId: (provider as any).centroMedicoId || null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLugarIndex, setSelectedLugarIndex] = useState<number>(0);
  const [centrosMedicos, setCentrosMedicos] = useState<any[]>([]);

  // Cargar centros médicos al montar
  useEffect(() => {
    const cargarCentros = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/providers/`);
        const data = await res.json();
        const centros = data.filter((p: any) => p.tipoPrestador === "centro_medico");
        setCentrosMedicos(centros);
      } catch (err) {
        console.error("Error cargando centros:", err);
      }
    };
    cargarCentros();

    // Debug: imprimir datos del provider
    console.log('📋 Provider en EditProviderPopup:', {
      cuitCuil: provider.cuitCuil,
      tipoPrestador: provider.tipoPrestador,
      centroMedicoId: (provider as any).centroMedicoId,
      formDataCentroMedicoId: (formData as any).centroMedicoId
    });
  }, []);

  // ---------- helpers campos simples ----------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ---------- lugaresAtencion (múltiples) ----------
  const handleLugarChange = (index: number, campo: keyof LugarAtencion, valor: any) => {
    setFormData(prev => {
      const nuevosLugares = [...prev.lugaresAtencion];
      nuevosLugares[index] = { ...nuevosLugares[index], [campo]: valor };
      return { ...prev, lugaresAtencion: nuevosLugares };
    });
  };

  const addLugar = () => {
    const nuevoLugar: LugarAtencion = {
      calle: "",
      numero: "",
      localidad: "",
      provincia: "",
      cp: "",
      horarios: []
    };
    setFormData(prev => ({
      ...prev,
      lugaresAtencion: [...prev.lugaresAtencion, nuevoLugar]
    }));
    setSelectedLugarIndex(formData.lugaresAtencion.length);
  };

  const delLugar = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lugaresAtencion: prev.lugaresAtencion.filter((_, idx) => idx !== index)
    }));
    if (selectedLugarIndex >= formData.lugaresAtencion.length - 1) {
      setSelectedLugarIndex(Math.max(0, formData.lugaresAtencion.length - 2));
    }
  };

  // ---------- telefonos / mails ----------
  const setArr = (field: "telefonos" | "mails", i: number, val: string) => {
    const arr = [...formData[field]];
    arr[i] = val;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };
  const addArr = (field: "telefonos" | "mails") =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  const delArr = (field: "telefonos" | "mails", i: number) =>
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i)
    }));

  // ---------- especialidades ----------
  const delEsp = (i: number) =>
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, idx) => idx !== i)
    }));

  const addEsp = (especialidad: Especialidad) => {
    // Verificar que no exista ya
    if (formData.especialidades.some(e => e.id === especialidad.id)) return;
    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, especialidad]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Enviar solo los IDs de especialidades, no los objetos completos
      const updated = {
        cuitCuil: formData.cuitCuil,
        nombreCompleto: formData.nombreCompleto,
        tipoPrestador: formData.tipoPrestador,
        especialidades: formData.especialidades.map(e => (e as any).id), // Extraer solo IDs
        telefonos: formData.telefonos.filter(t => t.trim()),
        mails: formData.mails.filter(m => m.trim()),
        lugaresAtencion: formData.lugaresAtencion
      };

      // Agregar centroMedicoId si es profesional
      if (formData.tipoPrestador === "profesional") {
        (updated as any).centroMedicoId = (formData as any).centroMedicoId || null;
      }
      
      console.log('📤 Enviando actualización:', JSON.stringify(updated, null, 2));
      console.log('🏥 Centro Médico ID:', (formData as any).centroMedicoId);
      
      // Llamar al API para guardar cambios
      const result = await updateProvider(formData.cuitCuil, updated);
      
      console.log('✅ Respuesta del servidor:', result);
      
      // Notificar que se guardó correctamente
      onSave(result);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error al guardar:', {
        error: err,
        errorMessage: errorMsg,
        cuitCuil: formData.cuitCuil
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const lugarActual = formData.lugaresAtencion[selectedLugarIndex];

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
              <label className="font-semibold mb-1 bg-gray-100 px-2">CUIT / CUIL (*)</label>
              <input
                type="text"
                name="cuitCuil"
                value={formData.cuitCuil}
                disabled
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
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

            {/* Tipo: mostrar sin permitir editar */}
            <div className="flex flex-col sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo de Prestador</label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-700 select-none pointer-events-none">
                <span className="capitalize">
                  {formData.tipoPrestador === "profesional" ? "Profesional" : "Centro Médico"}
                </span>
              </div>
            </div>

            {/* Centro Médico (solo si es profesional) */}
            {formData.tipoPrestador === "profesional" && (
              <div className="flex flex-col sm:col-span-2">
                <label className="font-semibold mb-1 bg-gray-100 px-2">¿Pertenece a un Centro Médico?</label>
                <select
                  name="centroMedico"
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      centroMedicoId: e.target.value || null
                    }));
                  }}
                  value={(formData as any).centroMedicoId || ""}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="">No pertenece a ninguno</option>
                  {centrosMedicos.map((centro) => (
                    <option key={centro.cuitCuil} value={centro.cuitCuil}>
                      {centro.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ESPECIALIDADES (editable) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Especialidades</h2>
          
          {formData.especialidades.length > 0 ? (
            <div className="space-y-2 mb-4">
              {formData.especialidades.map((esp, i) => (
                <div key={i} className="p-2 border border-gray-200 rounded bg-gray-50 flex justify-between items-center">
                  <span>{esp.nombre}</span>
                  <button
                    type="button"
                    onClick={() => delEsp(i)}
                    className="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4">Sin especialidades</p>
          )}

          {/* Dropdown para agregar especialidades */}
          <div className="flex gap-2">
            <select 
              onChange={(e) => {
                const selected = SPECIALTIES.find(s => s.id === parseInt(e.target.value));
                if (selected) addEsp(selected);
                e.target.value = "";
              }}
              className="p-2 border border-gray-300 rounded flex-1"
              defaultValue=""
            >
              <option value="">Seleccionar especialidad...</option>
              {SPECIALTIES.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Contacto</h2>

          {/* Teléfonos */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">Teléfonos</label>
            {formData.telefonos.map((tel, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tel}
                  onChange={(e) => setArr("telefonos", i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="Ej: 011-1234-5678"
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
            <button type="button" onClick={() => addArr("telefonos")} className="text-sm text-[#5FA92C] font-semibold hover:underline">
              + Agregar teléfono
            </button>
          </div>

          {/* Mails */}
          <div>
            <label className="font-semibold mb-2 block">Emails</label>
            {formData.mails.map((mail, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setArr("mails", i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="Ej: email@example.com"
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
            <button type="button" onClick={() => addArr("mails")} className="text-sm text-[#5FA92C] font-semibold hover:underline">
              + Agregar email
            </button>
          </div>
        </div>

        {/* LUGARES DE ATENCIÓN (MÚLTIPLES) */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Lugares de Atención</h2>

          {/* Selector de lugar */}
          {formData.lugaresAtencion.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                {formData.lugaresAtencion.map((lugar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedLugarIndex(idx)}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      selectedLugarIndex === idx
                        ? 'bg-[#5FA92C] text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Lugar {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulario del lugar seleccionado */}
          {lugarActual && (
            <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col sm:col-span-2">
                  <label className="font-semibold mb-1 text-sm">Dirección (*)</label>
                  <input
                    type="text"
                    value={lugarActual.calle || ""}
                    onChange={(e) => handleLugarChange(selectedLugarIndex, "calle", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Ej: Calle 9 No. 1234"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Localidad</label>
                  <input
                    type="text"
                    value={lugarActual.localidad || ""}
                    onChange={(e) => handleLugarChange(selectedLugarIndex, "localidad", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Localidad"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Provincia</label>
                  <input
                    type="text"
                    value={lugarActual.provincia || ""}
                    onChange={(e) => handleLugarChange(selectedLugarIndex, "provincia", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Provincia"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold mb-1 text-sm">Código Postal (*)</label>
                  <input
                    type="text"
                    value={lugarActual.cp || ""}
                    onChange={(e) => handleLugarChange(selectedLugarIndex, "cp", e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Código Postal"
                  />
                </div>
              </div>

              {/* Botón para eliminar este lugar */}
              {formData.lugaresAtencion.length > 1 && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => delLugar(selectedLugarIndex)}
                    className="px-4 py-2 border rounded text-red-500 font-semibold hover:bg-red-50"
                  >
                    Eliminar este lugar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botón para agregar nuevo lugar */}
          <button
            type="button"
            onClick={addLugar}
            className="px-4 py-2 bg-[#5FA92C] text-white rounded font-semibold hover:bg-green-700"
          >
            + Agregar lugar de atención
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* BOTONES */}
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-[#5FA92C] text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
