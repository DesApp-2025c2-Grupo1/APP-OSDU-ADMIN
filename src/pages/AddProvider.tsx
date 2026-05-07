import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Prestador, PrestadorTipo, LugarAtencion, DiaSemana } from "../model/Provider.model";
import { ButtonVolver } from "../util/ButtonVolver";
import Toast from "../components/Toast";
import { API_BASE_URL } from "../config/api";

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
  const handleAgregarLugar = () =>
    setLugaresAtencion([
      ...lugaresAtencion,
      { calle: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] as unknown as BloqueHorario[] },
    ]);
  const handleEliminarLugar = (index: number) =>
    setLugaresAtencion(lugaresAtencion.filter((_, i) => i !== index));



  // Cargar centros médicos y especialidades al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar centros médicos
        const resCentros = await fetch(`${API_BASE_URL}/providers/`);
        const dataCentros = await resCentros.json();
        const centrosMedicos = dataCentros.filter((p: any) => p.tipoPrestador === "centro_medico");
        setCentros(centrosMedicos);

        // Cargar especialidades desde API
        setLoadingEspecialidades(true);
        const resEsp = await fetch(`${API_BASE_URL}/specialties`);
        const dataEsp = await resEsp.json();

        // El backend puede devolver { especialidades: [...] } o array directo
        const especialidadesArray = dataEsp.especialidades || dataEsp || [];
        setEspecialidadesDisponibles(especialidadesArray.map((e: any) => ({
          id: e.idEspecialidad || e.id,
          nombre: e.nombre
        })));
      } catch (err) {
        setError("No se pudieron cargar las especialidades");
      } finally {
        setLoadingEspecialidades(false);
      }
    };
    cargarDatos();
  }, []);

  const diasSemana: { label: string; id: DiaSemana }[] = [
    { id: "Lunes", label: "Lun" },
    { id: "Martes", label: "Mar" },
    { id: "Miércoles", label: "Mié" },
    { id: "Jueves", label: "Jue" },
    { id: "Viernes", label: "Vie" },
    { id: "Sábado", label: "Sáb" },
    { id: "Domingo", label: "Dom" },
  ];

  const addBloque = (lugarIdx: number) => {
    const nuevas = [...lugaresAtencion];
    (nuevas[lugarIdx].horarios as unknown as BloqueHorario[]).push({ dias: [], desde: "", hasta: "" });
    setLugaresAtencion(nuevas);
  };

  const removeBloque = (lugarIdx: number, bloqueIdx: number) => {
    const nuevas = [...lugaresAtencion];
    const hs = nuevas[lugarIdx].horarios as unknown as BloqueHorario[];
    hs.splice(bloqueIdx, 1);
    if (hs.length === 0) hs.push({ dias: [], desde: "", hasta: "" });
    setLugaresAtencion(nuevas);
  };

  const toggleDia = (lugarIdx: number, bloqueIdx: number, dia: DiaSemana) => {
    const nuevas = [...lugaresAtencion];
    const hs = nuevas[lugarIdx].horarios as unknown as BloqueHorario[];
    const bloque = hs[bloqueIdx] || { dias: [], desde: "", hasta: "" };
    const esta = bloque.dias.includes(dia);
    bloque.dias = esta ? bloque.dias.filter((d) => d !== dia) : [...bloque.dias, dia];
    hs[bloqueIdx] = bloque;
    setLugaresAtencion(nuevas);
  };

  const setDesde = (lugarIdx: number, bloqueIdx: number, value: string) => {
    const nuevas = [...lugaresAtencion];
    const hs = nuevas[lugarIdx].horarios as unknown as BloqueHorario[];
    hs[bloqueIdx] = hs[bloqueIdx] || { dias: [], desde: "", hasta: "" };
    hs[bloqueIdx].desde = value;
    setLugaresAtencion(nuevas);
  };

  const setHasta = (lugarIdx: number, bloqueIdx: number, value: string) => {
    const nuevas = [...lugaresAtencion];
    const hs = nuevas[lugarIdx].horarios as unknown as BloqueHorario[];
    hs[bloqueIdx] = hs[bloqueIdx] || { dias: [], desde: "", hasta: "" };
    hs[bloqueIdx].hasta = value;
    setLugaresAtencion(nuevas);
  };

  const handleGuardar = async () => {
    if (!tipo) return setError("Debe seleccionar si es profesional o centro médico.");
    if (!cuilCuit.trim() || !nombreCompleto.trim())
      return setError("Complete el CUIL/CUIL y el nombre completo.");

    // Validar formato CUIT/CUIL (XX-XXXXXXXX-X o similar)
    const cuitRegex = /^[0-9]{1,2}-?[0-9]{6,8}-?[0-9]{1}$/;
    if (!cuitRegex.test(cuilCuit)) {
      return setError("Formato de CUIT/CUIL inválido. Ej: 20-31216123-0");
    }

    const especialidadesValidas = especialidades.filter(id => id > 0);
    if (especialidadesValidas.length === 0)
      return setError("Debe seleccionar al menos una especialidad.");

    if (lugaresAtencion.length === 0 || lugaresAtencion.some(l => !l.calle.trim() || !l.localidad?.trim() || !l.provincia?.trim() || !l.cp.trim()))
      return setError("Complete todos los datos de los lugares de atención.");

    // Validar teléfonos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newTelefonoErrors: string[] = [];
    const newEmailErrors: string[] = [];
    let hasErrors = false;

    telefonos.forEach((tel, idx) => {
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

    mails.forEach((email, idx) => {
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
    const telefonosValidos = telefonos.filter(t => t.trim() !== "");
    if (telefonosValidos.length === 0) {
      setError("Debe ingresar al menos un teléfono.");
      return;
    }

    // Validar que haya al menos un email válido
    const emailsValidos = mails.filter(e => e.trim() !== "");
    if (emailsValidos.length === 0) {
      setError("Debe ingresar al menos un email.");
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

      const res = await fetch(`${API_BASE_URL}/providers/`, {
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#5FA92C] mb-4">Agregar Prestador</h1>
      <div className="flex items-center gap-2 ">
        <ButtonVolver text="Volver" onClick={() => navigate("/prestadores")} />
      </div>
      {/* Selección tipo */}
      <div className="mb-6">
        <label className="block mt-2 text-lg  text-gray-700 mb-2">Tipo de Prestador</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="profesional"
              checked={tipo === "profesional"}
              onChange={() => setTipo("profesional")}
            />
            Profesional
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="centro_medico"
              checked={tipo === "centro_medico"}
              onChange={() => setTipo("centro_medico")}
            />
            Centro Médico
          </label>
        </div>
      </div>

      {tipo && (
        <>
          {/* Campos generales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUIL / CUIT</label>
              <input
                type="text"
                value={cuilCuit}
                onChange={(e) => setCuilCuit(formatCuil(e.target.value))}
                placeholder="20-12345678-3"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidades</label>
            {especialidades.map((esp, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={esp}
                  onChange={(e) => handleEspecialidadChange(i, parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  disabled={loadingEspecialidades}
                >
                  <option value={0}>-- Seleccionar --</option>
                  {especialidadesDisponibles.map((s) => {
                    const yaSeleccionada = especialidades.some((e, idx) => idx !== i && e === s.id);
                    return (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={yaSeleccionada}
                        style={{ color: yaSeleccionada ? '#ccc' : 'inherit' }}
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
                    className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarEspecialidad}
              className="text-[#5FA92C] text-sm font-semibold hover:underline"
              disabled={especialidades.length >= especialidadesDisponibles.length}
            >
              + Agregar otra especialidad
            </button>
          </div>
          {/* Centro médico (solo profesionales) */}
          {tipo === "profesional" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Pertenece a un centro médico?
              </label>
              <select
                value={integraCentro}
                onChange={(e) => setIntegraCentro(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              >
                <option value="">No pertenece</option>
                {centros.map((c) => (
                  <option key={c.cuitCuil} value={c.cuitCuil}>{c.nombreCompleto}</option>
                ))}
              </select>
            </div>
          )}

          {/* Teléfonos y Emails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfonos</label>
              {telefonos.map((t, i) => (
                <div key={i} className="flex flex-col gap-1 mb-2">
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
                      className={`border rounded-lg px-3 py-2 w-full ${telefonoErrors[i] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {telefonos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarTelefono(i)}
                        className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
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
                className="text-[#5FA92C] text-sm font-semibold"
              >
                + Agregar otro teléfono
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emails</label>
              {mails.map((em, i) => (
                <div key={i} className="flex flex-col gap-1 mb-2">
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
                      className={`border rounded-lg px-3 py-2 w-full ${emailErrors[i] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {mails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarEmail(i)}
                        className="px-3 py-2 border rounded hover:bg-gray-50 text-red-500"
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
                className="text-[#5FA92C] text-sm font-semibold"
              >
                + Agregar otro email
              </button>
            </div>
          </div>

          {/* Lugares de Atención */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Lugares de Atención</h2>
            {lugaresAtencion.map((lugar, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Calle"
                    value={lugar.calle}
                    onChange={(e) => handleLugarChange(idx, "calle", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    placeholder="Localidad"
                    value={lugar.localidad || ""}
                    onChange={(e) => handleLugarChange(idx, "localidad", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    placeholder="Provincia"
                    value={lugar.provincia || ""}
                    onChange={(e) => handleLugarChange(idx, "provincia", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    placeholder="Código Postal"
                    value={lugar.cp}
                    onChange={(e) => handleLugarChange(idx, "cp", e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>

                {lugaresAtencion.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleEliminarLugar(idx)}
                    className="mt-2 text-red-500 font-semibold text-sm"
                  >
                    Eliminar lugar
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAgregarLugar}
              className="text-[#5FA92C] text-sm font-semibold"
            >
              + Agregar otro lugar
            </button>
          </div>

          {/* Error */}
          {error && <div className="text-red-600 font-medium mb-4">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate("/prestadores")}
              disabled={loading}
              className="bg-gray-300 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="bg-[#5FA92C] text-white px-4 py-2 rounded-md font-medium hover:bg-[#4a8926] transition disabled:opacity-50"
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
