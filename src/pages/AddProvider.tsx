import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Prestador, PrestadorTipo, LugarAtencion, DiaSemana } from "../model/Provider.model";
import { SPECIALTIES } from "../data/specialties";
import { ButtonVolver } from "../util/ButtonVolver";
import { API_BASE_URL } from "../config/api";

type BloqueHorario = { dias: DiaSemana[]; desde: string; hasta: string };

export function AddProvider() {
  const navigate = useNavigate();

  // --- Estados generales ---
  const [tipo, setTipo] = useState<PrestadorTipo | "">("");
  const [cuilCuit, setCuilCuit] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [especialidades, setEspecialidades] = useState<number[]>([]);
  const [telefonos, setTelefonos] = useState<string[]>([""]);
  const [mails, setMails] = useState<string[]>([""]);
  const [lugaresAtencion, setLugaresAtencion] = useState<LugarAtencion[]>([
    { calle: "", localidad: "", provincia: "", cp: "", horarios: [{ dias: [], desde: "", hasta: "" }] as unknown as BloqueHorario[] },
  ]);

  const [centros, setCentros] = useState<any[]>([]);
  const [integraCentro, setIntegraCentro] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleAgregarTelefono = () => setTelefonos([...telefonos, ""]);
  const handleEliminarTelefono = (index: number) =>
    setTelefonos(telefonos.filter((_, i) => i !== index));

  const handleAgregarEmail = () => setMails([...mails, ""]);
  const handleEliminarEmail = (index: number) =>
    setMails(mails.filter((_, i) => i !== index));

  const handleAgregarEspecialidad = () => setEspecialidades([...especialidades, 0]);
  const handleEspecialidadChange = (index: number, valor: number) => {
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


  
  // Cargar centros médicos al montar
  useEffect(() => {
    const cargarCentros = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/providers/`);
        const data = await res.json();
        const centrosMedicos = data.filter((p: any) => p.tipoPrestador === "centro_medico");
        setCentros(centrosMedicos);
      } catch (err) {
        console.error("Error cargando centros:", err);
      }
    };
    cargarCentros();
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
      return setError("Complete el CUIL/CUIT y el nombre completo.");

    // Validar formato CUIT/CUIL (XX-XXXXXXXX-X o similar)
    const cuitRegex = /^[0-9]{1,2}-?[0-9]{6,8}-?[0-9]{1}$/;
    if (!cuitRegex.test(cuilCuit)) {
      return setError("Formato de CUIT/CUIL inválido. Ej: 20-31216123-0");
    }

    if (especialidades.length === 0 || especialidades.every(e => e === 0))
      return setError("Debe seleccionar al menos una especialidad.");

    if (lugaresAtencion.length === 0 || lugaresAtencion.some(l => !l.calle.trim() || !l.localidad?.trim() || !l.provincia?.trim() || !l.cp.trim()))
      return setError("Complete todos los datos de los lugares de atención.");

    setLoading(true);
    setError("");

    try {
      const payload = {
        cuitCuil: cuilCuit,
        nombreCompleto,
        tipoPrestador: tipo,
        especialidades: especialidades.filter(id => id !== 0),
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

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_BASE_URL}/providers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || errorData.message || "Error al crear prestador");
      }

      alert("Prestador creado correctamente");
      navigate("/prestadores");
    } catch (err: any) {
      setError(err.message || "Error al guardar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  return (
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
                onChange={(e) => setCuilCuit(e.target.value)}
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
                >
                  <option value={0}>-- Seleccionar --</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
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
              className="text-[#5FA92C] text-sm font-semibold"
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
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => {
                      const arr = [...telefonos];
                      arr[i] = e.target.value;
                      setTelefonos(arr);
                    }}
                    placeholder="Ej: 011 4444-5555"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
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
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={em}
                    onChange={(e) => {
                      const arr = [...mails];
                      arr[i] = e.target.value;
                      setMails(arr);
                    }}
                    placeholder="ejemplo@correo.com"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
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
    </div>
  );
}
