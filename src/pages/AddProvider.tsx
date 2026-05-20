import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { PrestadorTipo, LugarAtencion, DiaSemana } from "../model/Provider.model";
import Toast from "../components/Toast";
import { API_BASE_URL, apiFetch } from "../config/api";
import { firstProviderValidationMessage, validateProviderPayload } from "../utils/providerValidation";
import { fetchGeorefLocalities, fetchGeorefProvinces, type GeorefLocality, type GeorefProvince } from "../api/georefService";

type BloqueHorario = { dias: DiaSemana[]; desde: string; hasta: string };

export function AddProvider() {
  const navigate = useNavigate();

  // --- Estados generales ---
  const [tipo, setTipo] = useState<PrestadorTipo | "">("");
  const [cuilCuit, setCuilCuit] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [especialidades, setEspecialidades] = useState<number[]>([]);
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<{ id: number, nombre: string }[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [provincias, setProvincias] = useState<GeorefProvince[]>([]);
  const [localidadesPorProvincia, setLocalidadesPorProvincia] = useState<Record<string, GeorefLocality[]>>({});
  const [loadingGeoref, setLoadingGeoref] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState<Record<string, boolean>>({});
  const [telefonos, setTelefonos] = useState<string[]>([""]);
  const [mails, setMails] = useState<string[]>([""]);
  const [lugaresAtencion, setLugaresAtencion] = useState<LugarAtencion[]>([
    { calle: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] as unknown as BloqueHorario[] },
  ]);

  const [centros, setCentros] = useState<any[]>([]);
  const [integraCentro, setIntegraCentro] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [telefonoErrors, setTelefonoErrors] = useState<string[]>([""]);
  const [emailErrors, setEmailErrors] = useState<string[]>([""]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Formatea CUIT/CUIL: inserta guiones en el patrón 2-8-1 cuando sea posible
  const formatCuil = (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) {
      return digits.slice(0, 2) + "-" + digits.slice(2);
    }
    // 11+ -> take first 11 digits and format 2-8-1
    const d = digits.slice(0, 11);
    return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
  };


  const handleAgregarTelefono = () => {
    setTelefonos([...telefonos, ""]);
    setTelefonoErrors([...telefonoErrors, ""]);
  };
  const handleEliminarTelefono = (index: number) => {
    setTelefonos(telefonos.filter((_, i) => i !== index));
    setTelefonoErrors(telefonoErrors.filter((_, i) => i !== index));
  };

  const handleAgregarEmail = () => {
    setMails([...mails, ""]);
    setEmailErrors([...emailErrors, ""]);
  };
  const handleEliminarEmail = (index: number) => {
    setMails(mails.filter((_, i) => i !== index));
    setEmailErrors(emailErrors.filter((_, i) => i !== index));
  };

  const handleAgregarEspecialidad = () => {
    // Verificar si hay especialidades disponibles no seleccionadas
    const especialidadesDisponiblesNoSeleccionadas = especialidadesDisponibles.filter(
      esp => !especialidades.includes(esp.id)
    );

    if (especialidadesDisponiblesNoSeleccionadas.length === 0) {
      alert('Ya has seleccionado todas las especialidades disponibles.');
      return;
    }

    const primerIdDisponible = especialidadesDisponiblesNoSeleccionadas[0].id;
    setEspecialidades([...especialidades, primerIdDisponible]);
  };


  const handleEspecialidadChange = (index: number, valor: number) => {
    // Verificar si la especialidad ya está seleccionada en otro índice
    const yaSeleccionada = especialidades.some((esp, idx) => idx !== index && esp === valor);
    if (yaSeleccionada && valor !== 0) {
      alert('Esta especialidad ya ha sido seleccionada. Por favor, elija una diferente.');
      return;
    }

    const nuevas = [...especialidades];
    nuevas[index] = valor;
    setEspecialidades(nuevas);
  };

  const handleEliminarEspecialidad = (index: number) => {
    setEspecialidades(especialidades.filter((_, i) => i !== index));
  };

  const handleLugarChange = (index: number, campo: string, valor: string) => {
    const nuevas = [...lugaresAtencion];
    (nuevas[index] as any)[campo] = valor;
    setLugaresAtencion(nuevas);
  };

  const normalizeGeorefName = (value?: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase("es-AR");

  const getProvinciaId = (provinciaNombre?: string) =>
    provincias.find((provincia) => {
      const provinceName = normalizeGeorefName(provincia.nombre);
      const selectedName = normalizeGeorefName(provinciaNombre);

      return provinceName === selectedName
        || (provincia.id === "02" && ["caba", "ciudad de buenos aires", "capital federal"].includes(selectedName));
    })?.id || "";

  const cargarLocalidades = async (provinciaId: string) => {
    if (!provinciaId || localidadesPorProvincia[provinciaId] || loadingLocalidades[provinciaId]) return;

    setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: true }));
    try {
      const localidades = await fetchGeorefLocalities(provinciaId);
      setLocalidadesPorProvincia((prev) => ({ ...prev, [provinciaId]: localidades }));
    } catch {
      setError("No se pudieron cargar las localidades de Georef");
    } finally {
      setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: false }));
    }
  };

  const handleProvinciaChange = (index: number, provinciaId: string) => {
    const provincia = provincias.find((item) => item.id === provinciaId);
    const nuevas = [...lugaresAtencion];
    nuevas[index] = {
      ...nuevas[index],
      provincia: provincia?.nombre || "",
      localidad: "",
    };
    setLugaresAtencion(nuevas);
    void cargarLocalidades(provinciaId);
  };
  const handleAgregarLugar = () =>
    setLugaresAtencion([
      ...lugaresAtencion,
      { calle: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] as unknown as BloqueHorario[] },
    ]);
  const handleEliminarLugar = (index: number) =>
    setLugaresAtencion(lugaresAtencion.filter((_, i) => i !== index));



  // Cargar centros médicos, especialidades y provincias al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar centros médicos
        const resCentros = await apiFetch(`${API_BASE_URL}/prestadores/`);
        const dataCentros = await resCentros.json();
        const centrosMedicos = dataCentros.filter((p: any) => p.tipoPrestador === "centro_medico");
        setCentros(centrosMedicos);

        // Cargar especialidades desde API
        setLoadingEspecialidades(true);
        const resEsp = await apiFetch(`${API_BASE_URL}/specialties`);
        const dataEsp = await resEsp.json();

        // El backend puede devolver { especialidades: [...] } o array directo
        const especialidadesArray = dataEsp.especialidades || dataEsp || [];
        setEspecialidadesDisponibles(especialidadesArray.map((e: any) => ({
          id: e.idEspecialidad || e.id,
          nombre: e.nombre
        })));

        setLoadingGeoref(true);
        const provinciasData = await fetchGeorefProvinces();
        setProvincias(provinciasData);
      } catch (err) {
        setError("No se pudieron cargar los datos iniciales");
      } finally {
        setLoadingEspecialidades(false);
        setLoadingGeoref(false);
      }
    };
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    const especialidadesValidas = especialidades.filter(id => id > 0);
    const telefonosValidos = telefonos.filter(t => t.trim() !== "");
    const emailsValidos = mails.filter(e => e.trim() !== "");
    const validationErrors = validateProviderPayload({
      cuitCuil: cuilCuit,
      nombreCompleto,
      tipoPrestador: tipo,
      especialidades: especialidadesValidas,
      telefonos: telefonosValidos,
      mails: emailsValidos,
      lugaresAtencion,
    });

    const newTelefonoErrors: string[] = [];
    const newEmailErrors: string[] = [];
    telefonos.forEach((_, idx) => {
      newTelefonoErrors[idx] = validationErrors.some((err) => err.field === `telefonos.${idx}`)
        ? "El teléfono debe tener entre 7 y 15 dígitos"
        : "";
    });

    mails.forEach((_, idx) => {
      newEmailErrors[idx] = validationErrors.some((err) => err.field === `mails.${idx}`)
        ? "Formato de email inválido"
        : "";
    });

    setTelefonoErrors(newTelefonoErrors);
    setEmailErrors(newEmailErrors);

    if (validationErrors.length > 0) {
      setError(firstProviderValidationMessage(validationErrors));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        cuitCuil: cuilCuit,
        nombreCompleto,
        tipoPrestador: tipo,
        especialidades: especialidadesValidas,
        telefonos: telefonos.filter(t => t.trim() !== ""),
        mails: mails.filter(m => m.trim() !== ""),
        lugaresAtencion: lugaresAtencion.map(lugar => ({
          calle: lugar.calle,
          localidad: lugar.localidad,
          provincia: lugar.provincia,
          cp: lugar.cp,
          horarios: (lugar.horarios as unknown as BloqueHorario[])
            .filter(h => h.dias && h.dias.length > 0 && h.desde && h.hasta)
            .map(h => ({
              dias: h.dias,
              desde: h.desde,
              hasta: h.hasta
            }))
        })),
        ...(tipo === "profesional" && integraCentro && { centroMedicoId: integraCentro })
      };

      const res = await apiFetch(`${API_BASE_URL}/prestadores/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Error al crear prestador");
      }

      // Mostrar diálogo de éxito en lugar de alert
      setSuccessMessage("Prestador creado correctamente");
      setOpenSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  }; return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Agregar Prestador</h1>
        <p className="text-sm text-slate-400">Completa los datos del nuevo prestador</p>
      </div>
      {/* Selección tipo */}
      <div className="mb-6">
        <label className="block text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Tipo de Prestador</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="profesional"
              checked={tipo === "profesional"}
              onChange={() => setTipo("profesional")}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700">Profesional</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="centro_medico"
              checked={tipo === "centro_medico"}
              onChange={() => setTipo("centro_medico")}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-700">Centro Médico</span>
          </label>
        </div>
      </div>

      {tipo && (
        <>
          {/* Campos generales */}
          <div className="mb-6">
            <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos principales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-600 text-slate-600 mb-2">CUIL / CUIT</label>
                <input
                  type="text"
                  value={cuilCuit}
                  onChange={(e) => setCuilCuit(formatCuil(e.target.value))}
                  placeholder="20-12345678-3"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-slate-600 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className="mb-6">
            <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Especialidades</h2>
            {especialidades.map((esp, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <select
                  value={String(esp)}
                  onChange={(e) => handleEspecialidadChange(i, parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                  disabled={loadingEspecialidades}
                >
                  <option value="">-- Seleccionar --</option>
                  {especialidadesDisponibles.map((s) => {
                    const yaSeleccionada = especialidades.some((e, idx) => idx !== i && e === s.id);
                    return (
                      <option
                        key={s.id}
                        value={String(s.id)}
                        disabled={yaSeleccionada}
                      >
                        {s.nombre} {yaSeleccionada ? '(ya seleccionada)' : ''}
                      </option>
                    );
                  })}
                </select>

                {especialidades.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleEliminarEspecialidad(i)}
                    className="px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-600"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarEspecialidad}
              className="flex items-center gap-1.5 text-teal-600 text-sm font-600 hover:text-teal-700 transition-colors"
              disabled={especialidades.length >= especialidadesDisponibles.length}
            >
              + Agregar especialidad
            </button>
          </div>
          {/* Centro médico (solo profesionales) */}
          {tipo === "profesional" && (
            <div className="mb-6">
              <label className="block text-xs font-600 text-slate-600 mb-2">
                ¿Pertenece a un centro médico?
              </label>
              <select
                value={integraCentro}
                onChange={(e) => setIntegraCentro(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
              >
                <option value="">No pertenece</option>
                {centros.map((c) => (
                  <option key={c.cuitCuil} value={c.cuitCuil}>{c.nombreCompleto}</option>
                ))}
              </select>
            </div>
          )}

          {/* Teléfonos y Emails */}
          <div className="mb-6">
            <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-600 text-slate-600 mb-2">Teléfonos</label>
                {telefonos.map((t, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={t}
                        onChange={(e) => {
                          const arr = [...telefonos];
                          arr[i] = e.target.value;
                          setTelefonos(arr);
                          // Limpiar error al cambiar
                          const errors = [...telefonoErrors];
                          errors[i] = "";
                          setTelefonoErrors(errors);
                        }}
                        placeholder="Ej: 011 4444-5555 o 1234567890"
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 ${telefonoErrors[i] ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {telefonos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarTelefono(i)}
                          className="px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-600"
                        >
                          X
                        </button>
                      )}
                    </div>
                    {telefonoErrors[i] && (
                      <p className="text-red-500 text-xs">{telefonoErrors[i]}</p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAgregarTelefono}
                  className="flex items-center gap-1.5 text-teal-600 text-sm font-600 hover:text-teal-700 transition-colors"
                >
                  + Agregar teléfono
                </button>
              </div>

              <div>
                <label className="block text-xs font-600 text-slate-600 mb-2">Emails</label>
                {mails.map((em, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={em}
                        onChange={(e) => {
                          const arr = [...mails];
                          arr[i] = e.target.value;
                          setMails(arr);
                          // Limpiar error al cambiar
                          const errors = [...emailErrors];
                          errors[i] = "";
                          setEmailErrors(errors);
                        }}
                        placeholder="ejemplo@correo.com"
                        className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 ${emailErrors[i] ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {mails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarEmail(i)}
                          className="px-3 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-600"
                        >
                          X
                        </button>
                      )}
                    </div>
                    {emailErrors[i] && (
                      <p className="text-red-500 text-xs">{emailErrors[i]}</p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAgregarEmail}
                  className="flex items-center gap-1.5 text-teal-600 text-sm font-600 hover:text-teal-700 transition-colors"
                >
                  + Agregar email
                </button>
              </div>
            </div>
          </div>

          {/* Lugares de Atención */}
          <div className="mb-6">
            <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Lugares de Atención</h2>
            {lugaresAtencion.map((lugar, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <input
                    placeholder="Calle"
                    value={lugar.calle}
                    onChange={(e) => handleLugarChange(idx, "calle", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  <select
                    value={getProvinciaId(lugar.provincia)}
                    onChange={(e) => handleProvinciaChange(idx, e.target.value)}
                    disabled={loadingGeoref}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">{loadingGeoref ? "Cargando provincias..." : "Seleccionar provincia"}</option>
                    {provincias.map((provincia) => (
                      <option key={provincia.id} value={provincia.id}>
                        {provincia.nombre}
                      </option>
                    ))}
                  </select>
                  <select
                    value={lugar.localidad || ""}
                    onChange={(e) => handleLugarChange(idx, "localidad", e.target.value)}
                    disabled={!getProvinciaId(lugar.provincia) || Boolean(loadingLocalidades[getProvinciaId(lugar.provincia)])}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {(() => {
                      const provinciaId = getProvinciaId(lugar.provincia);
                      const localidades = localidadesPorProvincia[provinciaId] || [];
                      const cargando = Boolean(loadingLocalidades[provinciaId]);
                      return (
                        <>
                          <option value="">
                            {!provinciaId
                              ? "Seleccione una provincia primero"
                              : cargando
                                ? "Cargando localidades..."
                                : "Seleccionar localidad"}
                          </option>
                          {localidades.map((localidad) => (
                            <option key={localidad.id} value={localidad.nombre}>
                              {localidad.nombre}
                            </option>
                          ))}
                        </>
                      );
                    })()}
                  </select>
                  <input
                    placeholder="Código Postal"
                    value={lugar.cp}
                    onChange={(e) => handleLugarChange(idx, "cp", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                </div>

                {lugaresAtencion.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleEliminarLugar(idx)}
                    className="text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
                  >
                    Eliminar lugar
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarLugar}
              className="flex items-center gap-1.5 text-teal-600 text-sm font-600 hover:text-teal-700 transition-colors"
            >
              + Agregar lugar
            </button>
          </div>

          {/* Error */}
          {error && <div className="text-red-600 font-medium mb-4">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/prestadores")}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </>
      )}
      <Toast
        open={openSuccess}
        message={successMessage}
        variant="success"
        duration={3000}
        onClose={() => {
          setOpenSuccess(false);
          navigate("/prestadores");
        }}
      />
    </div>
  );
}
