import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProviders } from "../api/providerService";
import { createAgenda } from "../api/agendaService";

type DiaSemana = "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes" | "Sabado" | "Domingo";
type BloqueHorario = {
  dias: DiaSemana[];
  desde: string;
  hasta: string;
};

interface AddAgendaPageProps { }

export function AddAgendaPage({ }: AddAgendaPageProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prestadores, setPrestadores] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    prestadorId: "",
    especialidadId: "",
    lugarAtencionId: "",
    duracionTurno: "60",
  });

  const [bloquesHorarios, setBloquesHorarios] = useState<BloqueHorario[]>([
    { dias: [], desde: "", hasta: "" }
  ]);

  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<
    { id: number; nombre: string }[]
  >([]);

  const [lugaresDisponibles, setLugaresDisponibles] = useState<
    { id: number; nombre: string }[]
  >([]);

  // Estado para la búsqueda de prestadores
  const [busquedaPrestador, setBusquedaPrestador] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Cargar prestadores y especialidades al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const prestadoresData = await fetchProviders();
        setPrestadores(prestadoresData);
      } catch (err) {
        setError("No se pudieron cargar los datos iniciales");
      }
    };
    cargarDatos();
  }, []);

  // Filtrar prestadores basado en la búsqueda
  const prestadoresFiltrados = useMemo(() => {
    if (!busquedaPrestador.trim()) {
      return prestadores;
    }

    const busqueda = busquedaPrestador.toLowerCase();
    return prestadores.filter(prestador =>
      prestador.nombreCompleto.toLowerCase().includes(busqueda) ||
      prestador.tipoPrestador.toLowerCase().includes(busqueda)
    );
  }, [busquedaPrestador, prestadores]);

  // Actualizar especialidades y lugares cuando se selecciona un prestador
  useEffect(() => {
    if (formData.prestadorId) {
      const prestador = prestadores.find((p) => p.cuitCuil === formData.prestadorId);
      if (prestador) {
        // Mapear especialidades del prestador
        const especialidadesPrestador = prestador.especialidades.map((esp: any) => ({
          id: esp.id,
          nombre: esp.nombre
        }));
        setEspecialidadesDisponibles(especialidadesPrestador);

        // Mapear lugares de atención del prestador
        const lugaresPrestador = (prestador.lugaresAtencion || []).map((lugar: any) => ({
          id: lugar.idLugar,
          nombre: `${lugar.calle}, ${lugar.localidad}`
        }));
        setLugaresDisponibles(lugaresPrestador);

        // Si solo hay una especialidad, seleccionarla automáticamente
        if (especialidadesPrestador.length === 1) {
          setFormData(prev => ({ ...prev, especialidadId: especialidadesPrestador[0].id.toString() }));
        }

        // Si solo hay un lugar, seleccionarlo automáticamente
        if (lugaresPrestador.length === 1) {
          setFormData(prev => ({ ...prev, lugarAtencionId: lugaresPrestador[0].id.toString() }));
        }

        // Actualizar la búsqueda con el nombre del prestador seleccionado
        setBusquedaPrestador(prestador.nombreCompleto);
      }
    } else {
      setEspecialidadesDisponibles([]);
      setLugaresDisponibles([]);
      setFormData(prev => ({ ...prev, especialidadId: "", lugarAtencionId: "" }));
    }
  }, [formData.prestadorId, prestadores]);

  const diasSemana: { id: DiaSemana; label: string }[] = [
    { id: "Lunes", label: "Lun" },
    { id: "Martes", label: "Mar" },
    { id: "Miercoles", label: "Mié" },
    { id: "Jueves", label: "Jue" },
    { id: "Viernes", label: "Vie" },
    { id: "Sabado", label: "Sáb" },
  ];

  // Manejar cambios en los campos del formulario
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Funciones para manejar la búsqueda de prestadores
  const handleBusquedaPrestadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaPrestador(valor);
    setMostrarDropdown(true);

    if (!valor.trim()) {
      setFormData(prev => ({ ...prev, prestadorId: "" }));
    }
  };

  const seleccionarPrestador = (prestadorId: string, nombreCompleto: string) => {
    setFormData(prev => ({ ...prev, prestadorId }));
    setBusquedaPrestador(nombreCompleto);
    setMostrarDropdown(false);
  };

  const handleFocusPrestador = () => {
    setMostrarDropdown(true);
  };

  const handleBlurPrestador = () => {
    setTimeout(() => setMostrarDropdown(false), 200);
  };

  // Funciones para manejar bloques horarios
  const agregarBloqueHorario = () => {
    setBloquesHorarios(prev => [...prev, { dias: [], desde: "", hasta: "" }]);
  };

  const eliminarBloqueHorario = (index: number) => {
    if (bloquesHorarios.length > 1) {
      setBloquesHorarios(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleDia = (bloqueIndex: number, dia: DiaSemana) => {
    setBloquesHorarios(prev =>
      prev.map((bloque, index) => {
        if (index === bloqueIndex) {
          const estaSeleccionado = bloque.dias.includes(dia);
          return {
            ...bloque,
            dias: estaSeleccionado
              ? bloque.dias.filter(d => d !== dia)
              : [...bloque.dias, dia]
          };
        }
        return bloque;
      })
    );
  };

  const cambiarHorarioDesde = (bloqueIndex: number, valor: string) => {
    setBloquesHorarios(prev =>
      prev.map((bloque, index) =>
        index === bloqueIndex ? { ...bloque, desde: valor } : bloque
      )
    );
  };

  const cambiarHorarioHasta = (bloqueIndex: number, valor: string) => {
    setBloquesHorarios(prev =>
      prev.map((bloque, index) =>
        index === bloqueIndex ? { ...bloque, hasta: valor } : bloque
      )
    );
  };

  // Función para validar que no haya días y horarios duplicados
  const validarBloquesDuplicados = (bloques: BloqueHorario[]): string | null => {
    for (let i = 0; i < bloques.length; i++) {
      for (let j = i + 1; j < bloques.length; j++) {
        const bloque1 = bloques[i];
        const bloque2 = bloques[j];

        // Verificar si hay días en común
        const diasEnComun = bloque1.dias.filter(dia => bloque2.dias.includes(dia));

        if (diasEnComun.length > 0) {
          // Convertir horarios a minutos para comparar
          const [h1Desde, m1Desde] = bloque1.desde.split(':').map(Number);
          const [h1Hasta, m1Hasta] = bloque1.hasta.split(':').map(Number);
          const [h2Desde, m2Desde] = bloque2.desde.split(':').map(Number);
          const [h2Hasta, m2Hasta] = bloque2.hasta.split(':').map(Number);

          const minutos1Desde = h1Desde * 60 + m1Desde;
          const minutos1Hasta = h1Hasta * 60 + m1Hasta;
          const minutos2Desde = h2Desde * 60 + m2Desde;
          const minutos2Hasta = h2Hasta * 60 + m2Hasta;

          // Verificar si los horarios se solapan
          const haySolapamiento =
            (minutos1Desde < minutos2Hasta && minutos1Hasta > minutos2Desde);

          if (haySolapamiento) {
            const diasTexto = diasEnComun.join(', ');
            return `Los bloques ${i + 1} y ${j + 1} tienen días y horarios que se solapan (${diasTexto}). Por favor, corrija los horarios.`;
          }
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.prestadorId) {
      setError("Debe seleccionar un prestador.");
      return;
    }

    if (!formData.especialidadId) {
      setError("Debe seleccionar una especialidad.");
      return;
    }

    if (!formData.lugarAtencionId) {
      setError("Debe seleccionar un lugar de atención.");
      return;
    }

    const bloquesValidos = bloquesHorarios.filter(bloque =>
      bloque.dias.length > 0 && bloque.desde && bloque.hasta
    );

    if (bloquesValidos.length === 0) {
      setError("Debe configurar al menos un bloque horario con días y horarios válidos.");
      return;
    }

    // Validar que no haya bloques duplicados o con solapamiento
    const errorDuplicados = validarBloquesDuplicados(bloquesValidos);
    if (errorDuplicados) {
      setError(errorDuplicados);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        cuitCuil: formData.prestadorId,
        idEspecialidad: parseInt(formData.especialidadId),
        idLugar: parseInt(formData.lugarAtencionId),
        duracionTurno: parseInt(formData.duracionTurno),
        bloques: bloquesValidos.map(bloque => ({
          dias: bloque.dias,
          desde: bloque.desde,
          hasta: bloque.hasta
        }))
      };

      await createAgenda(payload);

      // Redirigir a la página de agenda
      navigate("/agenda");
    } catch (err: any) {
      setError(err.message || "Error al guardar la agenda");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/agenda");
  };

  return (
    <div className="p-4 sm:p-8">
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Agregar Agenda</h1>
        <p className="text-sm text-slate-400">Define horarios de atención para el prestador</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del prestador */}
        <div>
          <h3 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Datos del prestador
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">
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
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  placeholder="Buscar prestador..."
                  required
                />

                {/* Dropdown de resultados */}
                {mostrarDropdown && prestadoresFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                    {prestadoresFiltrados.map((prestador) => (
                      <div
                        key={prestador.cuitCuil}
                        onClick={() => seleccionarPrestador(prestador.cuitCuil, prestador.nombreCompleto)}
                        className={`p-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${formData.prestadorId === prestador.cuitCuil ? 'bg-teal-50' : ''
                          }`}
                      >
                        <div className="font-medium">{prestador.nombreCompleto}</div>
                        <div className="text-sm text-slate-600 capitalize">({prestador.tipoPrestador})</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {mostrarDropdown && busquedaPrestador && prestadoresFiltrados.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="p-3 text-slate-500 text-center text-sm">
                      No se encontraron prestadores
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Especialidad */}
        <div>
          <h3 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Especialidad
          </h3>
          <select
            value={formData.especialidadId}
            onChange={(e) => handleChange("especialidadId", e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
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

        {/* Lugar de atención */}
        <div>
          <h3 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Lugar de atención
          </h3>
          <select
            value={formData.lugarAtencionId}
            onChange={(e) => handleChange("lugarAtencionId", e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
            required
            disabled={!formData.prestadorId}
          >
            <option value="">
              {formData.prestadorId
                ? "Seleccionar lugar de atención"
                : "Seleccione un prestador primero"}
            </option>
            {lugaresDisponibles.map((lugar) => (
              <option key={lugar.id} value={lugar.id}>
                {lugar.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-6">
          <h3 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Definición de turnos
          </h3>

          {/* Duración del turno */}
          <div className="mb-6">
            <label className="block text-xs font-600 text-slate-600 mb-2">
              Duración del turno (min)
            </label>
            <select
              value={formData.duracionTurno}
              onChange={(e) => handleChange("duracionTurno", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
              required
            >
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>

          {/* Bloques horarios */}
          <div className="mb-6">
            <label className="block text-xs font-600 text-slate-600 mb-3">
              Días y horarios de atención
            </label>

            {bloquesHorarios.map((bloque, bloqueIndex) => (
              <div key={bloqueIndex} className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50">
                {/* Días de la semana */}
                <div className="mb-4">
                  <p className="text-xs font-600 text-slate-600 mb-2">Días:</p>
                  <div className="flex gap-4 flex-wrap">
                    {diasSemana.map((dia) => (
                      <label key={dia.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={bloque.dias.includes(dia.id)}
                          onChange={() => toggleDia(bloqueIndex, dia.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>{dia.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-600 text-slate-600 mb-2">Desde:</label>
                    <input
                      type="time"
                      value={bloque.desde}
                      onChange={(e) => cambiarHorarioDesde(bloqueIndex, e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-600 text-slate-600 mb-2">Hasta:</label>
                    <input
                      type="time"
                      value={bloque.hasta}
                      onChange={(e) => cambiarHorarioHasta(bloqueIndex, e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* Botón para eliminar bloque */}
                {bloquesHorarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarBloqueHorario(bloqueIndex)}
                    className="mt-3 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
                  >
                    Eliminar franja
                  </button>
                )}
              </div>
            ))}

            {/* Botón para agregar nuevo bloque horario */}
            <button
              type="button"
              onClick={agregarBloqueHorario}
              className="flex items-center gap-1.5 text-teal-600 text-sm font-600 hover:text-teal-700 transition-colors"
            >
              + Agregar franja
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
