import { useState, useEffect } from "react";
import type { Prestador, LugarAtencion, Especialidad } from "../model/Provider.model";
import { updateProvider } from "../api/providerService";
import { API_BASE_URL, apiFetch } from "../config/api";
import { checkProviderSpecialtyAgendas, checkProviderPlaceAgendas } from "../api/providerService";
import { ConfirmSpecialtyChangeDialog } from "./ConfirmSpecialtyChangeDialog";
import { ConfirmPlaceChangeDialog } from "./ConfirmPlaceChangeDialog";

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
  const [telefonoErrors, setTelefonoErrors] = useState<string[]>([]);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [selectedLugarIndex, setSelectedLugarIndex] = useState<number>(0);
  const [centrosMedicos, setCentrosMedicos] = useState<any[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<{ id: number, nombre: string }[]>([]);

  const [showSpecialtyWarning, setShowSpecialtyWarning] = useState(false);
  const [pendingSpecialtyToRemove, setPendingSpecialtyToRemove] = useState<{
    specialty: Especialidad;
    agendas: any[];
  } | null>(null);
  const [checkingAgendas, setCheckingAgendas] = useState(false);

  const [showPlaceWarning, setShowPlaceWarning] = useState(false);
  const [placeAgendas, setPlaceAgendas] = useState<any[]>([]);
  const [pendingSave, setPendingSave] = useState(false);
  const [originalPlaces, setOriginalPlaces] = useState<LugarAtencion[]>([]);


  // Cargar centros médicos y especialidades al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar centros médicos
        const resCentros = await apiFetch(`${API_BASE_URL}/providers/`);
        const dataCentros = await resCentros.json();
        const centros = dataCentros.filter((p: any) => p.tipoPrestador === "centro_medico");
        setCentrosMedicos(centros);

        // Cargar especialidades desde API
        const resEsp = await apiFetch(`${API_BASE_URL}/specialties`);
        const dataEsp = await resEsp.json();
        const especialidadesArray = dataEsp.especialidades || dataEsp || [];
        setEspecialidadesDisponibles(especialidadesArray.map((e: any) => ({
          id: e.idEspecialidad,
          nombre: e.nombre
        })));
      } catch (err) {
      }
    };
    cargarDatos();

    // Guardar lugares originales para detectar cambios
    setOriginalPlaces(JSON.parse(JSON.stringify(provider.lugaresAtencion || [])));
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
  // Sin formateo automático - el usuario puede escribir libremente
  const setArr = (field: "telefonos" | "mails", i: number, val: string) => {
    const arr = [...formData[field]];
    arr[i] = val;
    setFormData(prev => ({ ...prev, [field]: arr }));
    // Limpiar error al cambiar
    if (field === "telefonos") {
      const errors = [...telefonoErrors];
      errors[i] = "";
      setTelefonoErrors(errors);
    } else if (field === "mails") {
      const errors = [...emailErrors];
      errors[i] = "";
      setEmailErrors(errors);
    }
  };
  const addArr = (field: "telefonos" | "mails") => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
    if (field === "telefonos") {
      setTelefonoErrors([...telefonoErrors, ""]);
    } else if (field === "mails") {
      setEmailErrors([...emailErrors, ""]);
    }
  };
  const delArr = (field: "telefonos" | "mails", i: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i)
    }));
    if (field === "telefonos") {
      setTelefonoErrors(telefonoErrors.filter((_, idx) => idx !== i));
    } else if (field === "mails") {
      setEmailErrors(emailErrors.filter((_, idx) => idx !== i));
    }
  };

  // ---------- especialidades ----------
  const delEsp = async (i: number) => {
    const specialtyToRemove = formData.especialidades[i];

    try {
      setCheckingAgendas(true);

      // Verificar agendas desde el backend
      const result = await checkProviderSpecialtyAgendas(
        formData.cuitCuil,
        specialtyToRemove.id
      );

      if (result.count > 0) {
        // Mostrar diálogo de confirmación
        setPendingSpecialtyToRemove({
          specialty: specialtyToRemove,
          agendas: result.agendas,
        });
        setShowSpecialtyWarning(true);
      } else {
        // Si no hay agendas, eliminar directamente
        setFormData((prev) => ({
          ...prev,
          especialidades: prev.especialidades.filter((_, idx) => idx !== i),
        }));
      }
    } catch (err) {
      // Si hay error, permitir eliminar (pero mostrar alerta)
      alert("No se pudo verificar las agendas asociadas. Por favor, intenta de nuevo.");
    } finally {
      setCheckingAgendas(false);
    }
  };

  const confirmRemoveSpecialty = () => {
    if (!pendingSpecialtyToRemove) return;

    setFormData((prev) => ({
      ...prev,
      especialidades: prev.especialidades.filter(
        (e) => e.id !== pendingSpecialtyToRemove.specialty.id
      ),
    }));

    setShowSpecialtyWarning(false);
    setPendingSpecialtyToRemove(null);
  };

  // Agregar función para cancelar
  const cancelRemoveSpecialty = () => {
    setShowSpecialtyWarning(false);
    setPendingSpecialtyToRemove(null);
  };



  const addEsp = (especialidad: Especialidad) => {
    // Verificar que no exista ya
    if (formData.especialidades.some(e => e.id === especialidad.id)) {
      alert('Esta especialidad ya ha sido agregada.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, especialidad]
    }));
  };


  const handleSaveClick = async () => {
    // Validar teléfonos y emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newTelefonoErrors: string[] = [];
    const newEmailErrors: string[] = [];
    let hasErrors = false;

    formData.telefonos.forEach((tel, idx) => {
      if (tel.trim()) {
        const digitsOnly = tel.replace(/\D/g, '');
        if (!/^[0-9]{7,15}$/.test(digitsOnly)) {
          newTelefonoErrors[idx] = "El teléfono debe tener entre 7 y 15 dígitos";
          hasErrors = true;
        } else {
          newTelefonoErrors[idx] = "";
        }
      } else {
        newTelefonoErrors[idx] = "";
      }
    });

    formData.mails.forEach((email, idx) => {
      if (email.trim()) {
        if (!emailRegex.test(email)) {
          newEmailErrors[idx] = "Formato de email inválido";
          hasErrors = true;
        } else {
          newEmailErrors[idx] = "";
        }
      } else {
        newEmailErrors[idx] = "";
      }
    });

    setTelefonoErrors(newTelefonoErrors);
    setEmailErrors(newEmailErrors);

    if (hasErrors) {
      setError("Corrija los errores en teléfonos y emails antes de continuar.");
      return;
    }

    // Validar que haya al menos un teléfono válido
    const telefonosValidos = formData.telefonos.filter(t => t.trim() !== "");
    if (telefonosValidos.length === 0) {
      setError("Debe ingresar al menos un teléfono.");
      return;
    }

    // Validar que haya al menos un email válido
    const emailsValidos = formData.mails.filter(e => e.trim() !== "");
    if (emailsValidos.length === 0) {
      setError("Debe ingresar al menos un email.");
      return;
    }

    await handleSave();
  };

  const handleSave = async () => {
    const placesChanged = JSON.stringify(originalPlaces) !== JSON.stringify(formData.lugaresAtencion);

    if (placesChanged && !pendingSave) {
      try {
        setCheckingAgendas(true);
        const result = await checkProviderPlaceAgendas(formData.cuitCuil);

        if (result.count > 0) {
          setPlaceAgendas(result.agendas);
          setShowPlaceWarning(true);
          setCheckingAgendas(false);
          return; // No continuar con el guardado
        } else {
        }
      } catch (err) {
      } finally {
        setCheckingAgendas(false);
      }
    } else {
    }
    await performSave();
  };

  const performSave = async () => {
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


      // Llamar al API para guardar cambios
      const result = await updateProvider(formData.cuitCuil, updated);

      onSave(result);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setPendingSave(false); // Reset pending save flag
    }
  };

  const confirmPlaceChange = () => {
    setShowPlaceWarning(false);
    setPendingSave(true);
    // Llamar performSave inmediatamente después de confirmar
    setTimeout(() => performSave(), 0);
  };

  const cancelPlaceChange = () => {
    setShowPlaceWarning(false);
    setPendingSave(false);
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
                const selected = especialidadesDisponibles.find(s => s.id === parseInt(e.target.value));
                if (selected) addEsp(selected);
                e.target.value = "";
              }}
              className="p-2 border border-gray-300 rounded flex-1"
              defaultValue=""
            >
              <option value="">Seleccionar especialidad...</option>
              {especialidadesDisponibles
                .filter(esp => !formData.especialidades.some(e => e.id === esp.id))
                .map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </option>
                ))
              }
            </select>
          </div>
          {formData.especialidades.length === especialidadesDisponibles.length && (
            <p className="text-sm text-gray-500 mt-2">
              ℹ️ Todas las especialidades disponibles ya han sido agregadas
            </p>
          )}
        </div>

        {/* CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Contacto</h2>

          {/* Teléfonos */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">Teléfonos</label>
            {formData.telefonos.map((tel, i) => (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tel}
                    onChange={(e) => setArr("telefonos", i, e.target.value)}
                    className={`p-2 border rounded w-full ${telefonoErrors[i] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Ej: 011 4444-5555 o 1234567890"
                  />
                  <button
                    type="button"
                    onClick={() => delArr("telefonos", i)}
                    className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
                {telefonoErrors[i] && (
                  <p className="text-red-500 text-xs">{telefonoErrors[i]}</p>
                )}
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
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={mail}
                    onChange={(e) => setArr("mails", i, e.target.value)}
                    className={`p-2 border rounded w-full ${emailErrors[i] ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                {emailErrors[i] && (
                  <p className="text-red-500 text-xs">{emailErrors[i]}</p>
                )}
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
                    className={`px-4 py-2 rounded font-semibold transition ${selectedLugarIndex === idx
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
            onClick={handleSaveClick}
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
      {showSpecialtyWarning && pendingSpecialtyToRemove && (
        <ConfirmSpecialtyChangeDialog
          open={showSpecialtyWarning}
          providerName={formData.nombreCompleto}
          specialty={pendingSpecialtyToRemove.specialty.nombre}
          agendaCount={pendingSpecialtyToRemove.agendas.length}
          onConfirm={confirmRemoveSpecialty}
          onCancel={cancelRemoveSpecialty}
          isLoading={loading || checkingAgendas}
        />
      )}
      {showPlaceWarning && (
        <ConfirmPlaceChangeDialog
          open={showPlaceWarning}
          providerName={formData.nombreCompleto}
          agendaCount={placeAgendas.length}
          onConfirm={confirmPlaceChange}
          onCancel={cancelPlaceChange}
          isLoading={loading || checkingAgendas}
        />
      )}
    </div>
  );
}
