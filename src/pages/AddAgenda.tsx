import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { providersMock } from "../data/providers";
import { SPECIALTIES } from "../data/specialties";
import { ButtonVolver } from "../util/ButtonVolver";

type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6; 
type BloqueHorario = {
  dias: DiaSemana[];
  desde: string;
  hasta: string;
};

interface AddAgendaPageProps {}

export function AddAgendaPage({}: AddAgendaPageProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    prestadorId: "",
    especialidadId: "",
    lugarAtencion: "",
    duracionTurno: "30",
  });

  const [bloquesHorarios, setBloquesHorarios] = useState<BloqueHorario[]>([
    { dias: [], desde: "", hasta: "" },
  ]);

  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);

  const [lugaresDisponibles, setLugaresDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);

  const [busquedaPrestador, setBusquedaPrestador] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);


  const prestadoresFiltrados = useMemo(() => {
    if (!busquedaPrestador.trim()) {
      return providersMock;
    }

    const busqueda = busquedaPrestador.toLowerCase();
    return providersMock.filter(
      (prestador) =>
        prestador.nombreCompleto.toLowerCase().includes(busqueda) ||
        prestador.tipo.toLowerCase().includes(busqueda)
    );
  }, [busquedaPrestador]);


  useEffect(() => {
    if (formData.prestadorId) {
      const prestador = providersMock.find(
        (p) => p.id === formData.prestadorId
      );
      if (prestador) {
        const especialidades = prestador.especialidades.map((espId) => {
          const especialidad = SPECIALTIES.find((s) => s.id === espId);
          return { id: espId, nombre: especialidad?.nombre || espId };
        });
        setEspecialidadesDisponibles(especialidades);
        const lugares = (prestador.direcciones ?? []).map((dir, index) => {
          const etiqueta = dir.etiqueta ? `${dir.etiqueta} - ` : "";
          const texto = `${etiqueta}${dir.calle} ${dir.numero}, ${dir.localidad}`;
          return {
            id: `${prestador.id}-${index}`,
            nombre: texto,
          };
        });
        setLugaresDisponibles(lugares);
        setFormData((prev) => ({
          ...prev,
          especialidadId:
            especialidades.length === 1 ? especialidades[0].id : "",
          lugarAtencion: lugares.length === 1 ? lugares[0].nombre : "",
        }));
        setBusquedaPrestador(prestador.nombreCompleto);
      }
    } else {
      setEspecialidadesDisponibles([]);
      setLugaresDisponibles([]);
      setFormData((prev) => ({
        ...prev,
        especialidadId: "",
        lugarAtencion: "",
      }));
    }
  }, [formData.prestadorId]);

  const diasSemana: { id: DiaSemana; label: string }[] = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mié" },
    { id: 4, label: "Jue" },
    { id: 5, label: "Vie" },
    { id: 6, label: "Sáb" },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusquedaPrestadorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor = e.target.value;
    setBusquedaPrestador(valor);
    setMostrarDropdown(true);

    if (!valor.trim()) {
      setFormData((prev) => ({
        ...prev,
        prestadorId: "",
        especialidadId: "",
        lugarAtencion: "",
      }));
      setEspecialidadesDisponibles([]);
      setLugaresDisponibles([]);
    }
  };

  const seleccionarPrestador = (prestadorId: string, nombreCompleto: string) => {
    setFormData((prev) => ({ ...prev, prestadorId }));
    setBusquedaPrestador(nombreCompleto);
    setMostrarDropdown(false);
  };

  const handleFocusPrestador = () => {
    setMostrarDropdown(true);
  };

  const handleBlurPrestador = () => {
    setTimeout(() => setMostrarDropdown(false), 200);
  };

  const agregarBloqueHorario = () => {
    setBloquesHorarios((prev) => [...prev, { dias: [], desde: "", hasta: "" }]);
  };

  const eliminarBloqueHorario = (index: number) => {
    if (bloquesHorarios.length > 1) {
      setBloquesHorarios((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleDia = (bloqueIndex: number, dia: DiaSemana) => {
    setBloquesHorarios((prev) =>
      prev.map((bloque, index) => {
        if (index === bloqueIndex) {
          const estaSeleccionado = bloque.dias.includes(dia);
          return {
            ...bloque,
            dias: estaSeleccionado
              ? bloque.dias.filter((d) => d !== dia)
              : [...bloque.dias, dia],
          };
        }
        return bloque;
      })
    );
  };

  const cambiarHorarioDesde = (bloqueIndex: number, valor: string) => {
    setBloquesHorarios((prev) =>
      prev.map((bloque, index) =>
        index === bloqueIndex ? { ...bloque, desde: valor } : bloque
      )
    );
  };

  const cambiarHorarioHasta = (bloqueIndex: number, valor: string) => {
    setBloquesHorarios((prev) =>
      prev.map((bloque, index) =>
        index === bloqueIndex ? { ...bloque, hasta: valor } : bloque
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar prestador
    if (!formData.prestadorId) {
      alert("Debe seleccionar un prestador.");
      return;
    }

    // Validar lugar
    if (!formData.lugarAtencion) {
      alert("Debe seleccionar un lugar de atención.");
      return;
    }

    // Validar bloques
    const bloquesValidos = bloquesHorarios.filter(
      (bloque) => bloque.dias.length > 0 && bloque.desde && bloque.hasta
    );

    if (bloquesValidos.length === 0) {
      alert(
        "Debe configurar al menos un bloque horario con días y horarios válidos."
      );
      return;
    }

    const prestador = providersMock.find((p) => p.id === formData.prestadorId);
    const especialidad =
      SPECIALTIES.find((s) => s.id === formData.especialidadId)?.nombre || "";

    const diasLabels = bloquesValidos
      .flatMap((bloque) =>
        bloque.dias.map((diaId) => {
          const dia = diasSemana.find((d) => d.id === diaId);
          return dia ? dia.label : "";
        })
      )
      .filter(Boolean);

    const horarioCompleto = bloquesValidos
      .map((bloque) => `${bloque.desde} - ${bloque.hasta}`)
      .join(" / ");

    const nuevaAgenda = {
      id: crypto.randomUUID(),
      prestador: prestador ? prestador.nombreCompleto : "",
      especialidad,
      lugar: formData.lugarAtencion,
      dias: [...new Set(diasLabels)],
      horario: horarioCompleto,
      duracion: parseInt(formData.duracionTurno) || 0,
    };

    console.log("Agenda guardada:", nuevaAgenda);

    navigate("/agenda", {
      state: { nuevaAgenda },
    });
  };

  const handleCancel = () => {
    navigate("/agenda");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#5FA92C] mb-4">Agregar Agenda</h1>
      <div className="flex items-center gap-2">
        <ButtonVolver text="Volver" onClick={() => navigate("/agenda")} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Datos del prestador */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Datos del prestador
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>

              {/* Campo de búsqueda de prestador */}
              <div className="relative">
                <input
                  type="text"
                  value={busquedaPrestador}
                  onChange={handleBusquedaPrestadorChange}
                  onFocus={handleFocusPrestador}
                  onBlur={handleBlurPrestador}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
                  placeholder="Buscar prestador..."
                  required
                />

                {/* Dropdown de resultados */}
                {mostrarDropdown && prestadoresFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {prestadoresFiltrados.map((prestador) => (
                      <div
                        key={prestador.id}
                        onClick={() =>
                          seleccionarPrestador(
                            prestador.id,
                            prestador.nombreCompleto
                          )
                        }
                        className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0 ${
                          formData.prestadorId === prestador.id
                            ? "bg-green-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium">
                          {prestador.nombreCompleto}
                        </div>
                        <div className="text-sm text-gray-600">
                          ({prestador.tipo})
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {mostrarDropdown &&
                  busquedaPrestador &&
                  prestadoresFiltrados.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-3 text-gray-500 text-center">
                        No se encontraron prestadores
                      </div>
                    </div>
                  )}
              </div>

              {/* Campo oculto para el ID del prestador seleccionado */}
              <input type="hidden" value={formData.prestadorId} required />
            </div>
          </div>
        </div>

        {/* Especialidad */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Especialidad
          </h3>
          <select
            value={formData.especialidadId}
            onChange={(e) => handleChange("especialidadId", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            required
            disabled={!formData.prestadorId}
          >
            <option value="">
              {formData.prestadorId
                ? "Seleccionar especialidad"
                : "Seleccione un prestador primero"}
            </option>
            {especialidadesDisponibles.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lugar de atención - ahora desplegable */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lugar de atención
          </h3>
          <select
            value={formData.lugarAtencion}
            onChange={(e) => handleChange("lugarAtencion", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            required
            disabled={!formData.prestadorId || lugaresDisponibles.length === 0}
          >
            <option value="">
              {!formData.prestadorId
                ? "Seleccione un prestador primero"
                : lugaresDisponibles.length === 0
                ? "El prestador no tiene lugares cargados"
                : "Seleccionar lugar de atención"}
            </option>
            {lugaresDisponibles.map((lugar) => (
              <option key={lugar.id} value={lugar.nombre}>
                {lugar.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Definición de turnos
          </h3>

          {/* Duración del turno */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración del turno (min)
            </label>
            <input
              type="number"
              value={formData.duracionTurno}
              onChange={(e) => handleChange("duracionTurno", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              placeholder="Ej: 30"
              min="15"
              max="120"
              step="15"
              required
            />
          </div>

          {/* Bloques horarios */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Días y horarios de atención
            </label>

            {bloquesHorarios.map((bloque, bloqueIndex) => (
              <div
                key={bloqueIndex}
                className="border rounded-lg p-4 mb-4 bg-gray-50"
              >
                {/* Días de la semana */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Días:</p>
                  <div className="flex gap-4 flex-wrap">
                    {diasSemana.map((dia) => (
                      <label
                        key={dia.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={bloque.dias.includes(dia.id)}
                          onChange={() => toggleDia(bloqueIndex, dia.id)}
                          className="rounded border-gray-300 text-[#5FA92C] focus:ring-[#5FA92C]"
                        />
                        <span>{dia.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Desde:
                    </label>
                    <input
                      type="time"
                      value={bloque.desde}
                      onChange={(e) =>
                        cambiarHorarioDesde(bloqueIndex, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Hasta:
                    </label>
                    <input
                      type="time"
                      value={bloque.hasta}
                      onChange={(e) =>
                        cambiarHorarioHasta(bloqueIndex, e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                {/* Botón eliminar bloque */}
                {bloquesHorarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarBloqueHorario(bloqueIndex)}
                    className="mt-3 text-red-500 text-sm font-semibold hover:text-red-700"
                  >
                    Eliminar franja horaria
                  </button>
                )}
              </div>
            ))}

            {/* Botón agregar bloque */}
            <button
              type="button"
              onClick={agregarBloqueHorario}
              className="text-[#5FA92C] text-sm font-semibold hover:text-[#4c8c23]"
            >
              + Agregar otra franja horaria
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-black px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#5FA92C] text-white px-4 py-2 rounded-md font-medium hover:bg-[#4a8926] transition"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
