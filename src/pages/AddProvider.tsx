import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Prestador, PrestadorTipo, DireccionAtencion, DiaSemana } from "../model/Provider.model";
import { SPECIALTIES } from "../data/specialties";
import { providersMock } from "../data/providers";

export function AddProvider() {
  const navigate = useNavigate();

  // --- Estados generales ---
  const [tipo, setTipo] = useState<PrestadorTipo | "">("");
  const [cuilCuit, setCuilCuit] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([""]);
  const [telefonos, setTelefonos] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [direcciones, setDirecciones] = useState<DireccionAtencion[]>([
    { calle: "", numero: "", localidad: "", provincia: "", cp: "", horarios: [] },
  ]);

  // --- Solo para profesionales ---
  const [centros] = useState(providersMock.filter((p) => p.tipo === "centro"));
  const [integraCentro, setIntegraCentro] = useState<string>("");

  // --- Validaciones simples ---
  const [error, setError] = useState("");

  // --- Manejo de telefonos ---
  const handleAgregarTelefono = () => setTelefonos([...telefonos, ""]);
  const handleEliminarTelefono = (index: number) =>
    setTelefonos(telefonos.filter((_, i) => i !== index));

  // --- Manejo de emails ---
  const handleAgregarEmail = () => setEmails([...emails, ""]);
  const handleEliminarEmail = (index: number) =>
    setEmails(emails.filter((_, i) => i !== index));

  // --- Manejo de especialidades ---
  const handleAgregarEspecialidad = () => setEspecialidades([...especialidades, ""]);
  const handleEspecialidadChange = (index: number, valor: string) => {
    const nuevas = [...especialidades];
    nuevas[index] = valor;
    setEspecialidades(nuevas);
  };
  const handleEliminarEspecialidad = (index: number) => {
    setEspecialidades(especialidades.filter((_, i) => i !== index));
  };

  // --- Manejo de direcciones ---
  const handleDireccionChange = (index: number, campo: string, valor: string) => {
    const nuevas = [...direcciones];
    (nuevas[index] as any)[campo] = valor;
    setDirecciones(nuevas);
  };
  const handleAgregarDireccion = () =>
    setDirecciones([...direcciones, { calle: "", numero: "", localidad: "", provincia: "", cp: "", horarios: [] }]);
  const handleEliminarDireccion = (index: number) =>
    setDirecciones(direcciones.filter((_, i) => i !== index));

  // --- Manejo de días de atención ---
  const diasSemana: { id: DiaSemana; label: string }[] = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mié" },
    { id: 4, label: "Jue" },
    { id: 5, label: "Vie" },
    { id: 6, label: "Sáb" },
  ];

  const toggleDia = (direccionIndex: number, dia: DiaSemana) => {
    const nuevas = [...direcciones];
    const horarios = nuevas[direccionIndex].horarios;
    if (!horarios[0]) horarios[0] = { dias: [], desde: "", hasta: "" };
    const dias = horarios[0].dias.includes(dia)
      ? horarios[0].dias.filter((d) => d !== dia)
      : [...horarios[0].dias, dia];
    horarios[0].dias = dias;
    setDirecciones(nuevas);
  };

  // --- Guardar ---
  const handleGuardar = () => {
    if (!tipo) return setError("Debe seleccionar si es profesional o centro médico.");
    if (!cuilCuit.trim() || !nombreCompleto.trim())
      return setError("Complete el CUIL/CUIT y el nombre completo.");

    if (especialidades.filter((e) => e.trim() !== "").length === 0)
      return setError("Debe seleccionar al menos una especialidad.");

    const nuevoPrestador: Prestador = {
      id: crypto.randomUUID(),
      cuilCuit,
      nombreCompleto,
      tipo,
      especialidades: especialidades.filter((e) => e.trim() !== ""),
      telefonos: telefonos.filter((t) => t.trim() !== ""),
      emails: emails.filter((e) => e.trim() !== ""),
      direcciones,
      integraCentroMedico:
        tipo === "profesional" && integraCentro
          ? { id: integraCentro, nombre: centros.find((c) => c.id === integraCentro)?.nombreCompleto || "" }
          : null,
    };

    console.log("Nuevo prestador creado:", nuevoPrestador);
    alert("Prestador agregado correctamente.");
    navigate("/prestadores");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-[#5FA92C] mb-4">Agregar Prestador</h1>

      {/* Selección tipo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Prestador</label>
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
              value="centro"
              checked={tipo === "centro"}
              onChange={() => setTipo("centro")}
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
                  onChange={(e) => handleEspecialidadChange(i, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                >
                  <option value="">-- Seleccionar --</option>
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
                  <option key={c.id} value={c.id}>{c.nombreCompleto}</option>
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
              {emails.map((em, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={em}
                    onChange={(e) => {
                      const arr = [...emails];
                      arr[i] = e.target.value;
                      setEmails(arr);
                    }}
                    placeholder="ejemplo@correo.com"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                  {emails.length > 1 && (
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

          {/* Direcciones */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Direcciones</h2>
            {direcciones.map((dir, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
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

                {/* Horario */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Días y horarios:</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {diasSemana.map((d) => (
                      <label key={d.id} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={dir.horarios[0]?.dias.includes(d.id) || false}
                          onChange={() => toggleDia(idx, d.id)}
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="time"
                      value={dir.horarios[0]?.desde || ""}
                      onChange={(e) => {
                        const nuevas = [...direcciones];
                        if (!nuevas[idx].horarios[0]) nuevas[idx].horarios[0] = { dias: [], desde: "", hasta: "" };
                        nuevas[idx].horarios[0].desde = e.target.value;
                        setDirecciones(nuevas);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <input
                      type="time"
                      value={dir.horarios[0]?.hasta || ""}
                      onChange={(e) => {
                        const nuevas = [...direcciones];
                        if (!nuevas[idx].horarios[0]) nuevas[idx].horarios[0] = { dias: [], desde: "", hasta: "" };
                        nuevas[idx].horarios[0].hasta = e.target.value;
                        setDirecciones(nuevas);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {direcciones.length > 1 && (
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

          {/* Error */}
          {error && <div className="text-red-600 font-medium mb-4">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate("/prestadores")}
              className="bg-gray-300 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="bg-[#5FA92C] text-white px-4 py-2 rounded-md font-medium hover:bg-[#4a8926] transition"
            >
              Guardar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
