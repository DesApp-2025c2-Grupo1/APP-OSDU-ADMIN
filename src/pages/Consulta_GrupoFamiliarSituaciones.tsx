import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonVolver } from "../util/ButtonVolver";
import { PDFDownloadButton } from "../util/ReportPDFExporter";
import { API_BASE_URL } from "../config/api";

type SituacionRow = {
  idSituacionAfiliado: number;
  situacion: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
};

type MiembroGrupo = {
  dni: string;
  nombre: string;
  apellido: string;
  parentesco: string;
  situaciones: SituacionRow[];
};

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-AR");
}

export function SituacionesPorGrupo() {
  const navigate = useNavigate();

  const [dni, setDni] = useState<string>("");
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dniValido = dni.length >= 7 && dni.length <= 8;

  const handleDniChange = (value: string) => {
    const soloNumeros = value.replace(/\D/g, "").slice(0, 8);
    setDni(soloNumeros);
  };

  const handleBuscar = async () => {
    if (!dniValido) return;

    try {
      setLoading(true);
      setError(null);
      setMiembros([]);

      const res = await fetch(
        `${API_BASE_URL}/reports/situaciones-por-grupo?dni=${dni}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Afiliado o grupo familiar no encontrado");
        }
        throw new Error("Error al obtener situaciones del grupo familiar");
      }

      const data: MiembroGrupo[] = await res.json();
      setMiembros(data);
    } catch (e: any) {
      setError(e.message || "Error al consultar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const totalSituaciones = miembros.reduce(
    (acc, m) => acc + m.situaciones.length,
    0
  );

  // 📌 CONFIGURACIÓN PDF
  // Aplanar datos para el PDF (una fila por situación)
  const dataPDF = useMemo(() => {
    return miembros.flatMap((m) =>
      m.situaciones.map((s) => ({
        afiliadoNombre: `${m.nombre} ${m.apellido}`,
        parentesco: m.parentesco,
        situacion: s.situacion,
        fechaInicio: s.fechaInicio,
        fechaFin: s.fechaFin,
        estado: s.estado,
      }))
    );
  }, [miembros]);

  const pdfColumns = [
    { key: "afiliadoNombre", label: "Nombre Completo" },
    { key: "parentesco", label: "Parentesco" },
    { key: "situacion", label: "Situación" },
    { key: "fechaInicio", label: "Fecha Inicio", format: (val: string) => formatFecha(val) },
    { key: "fechaFin", label: "Fecha Fin", format: (val: string | null) => (val ? formatFecha(val) : "—") },
    { key: "estado", label: "Estado" },
  ];

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-[#14B8A6]">
          Situaciones terapéuticas por grupo familiar
        </h1>

        <div className="mb-4">
          <ButtonVolver text="Volver" onClick={() => navigate("/consultas")} />
        </div>

        {/* INPUT DNI */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            DNI de cualquier miembro del grupo familiar
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <input
              type="text"
              inputMode="numeric"
              value={dni}
              onChange={(e) => handleDniChange(e.target.value)}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              placeholder="Ej: 12345678"
              maxLength={8}
            />

            <button
              type="button"
              onClick={handleBuscar}
              disabled={!dniValido || loading}
              className={`
                px-5 py-2 rounded-md text-white font-semibold
                ${dniValido && !loading
                  ? "bg-[#14B8A6] hover:bg-[#4c8c23]"
                  : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Ingrese el DNI de cualquier integrante del grupo familiar (7-8
            dígitos).
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {/* RESULTADOS */}
        <div className="mt-2">
          {!loading && miembros.length === 0 && !error && (
            <p className="text-sm text-gray-600">
              Ingrese un DNI válido y presione{" "}
              <span className="font-semibold">Buscar</span> para ver las
              situaciones terapéuticas de todo el grupo familiar.
            </p>
          )}

          {miembros.length > 0 && (
            <>
              {/* Resumen */}
              <div className="mb-4 p-4 bg-[#F2FAEC] rounded-lg border border-[#14B8A6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Resumen del Grupo Familiar
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Miembros:</span>{" "}
                      <span className="font-medium">{miembros.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total situaciones:</span>{" "}
                      <span className="font-medium">{totalSituaciones}</span>
                    </div>
                  </div>
                </div>

                {/* 📌 BOTÓN PDF */}
                {dataPDF.length > 0 && (
                  <PDFDownloadButton
                    title="Situaciones terapéuticas por grupo familiar"
                    subtitle={`${miembros.length} miembro(s) - ${totalSituaciones} situación(es)`}
                    data={dataPDF}
                    columns={pdfColumns}
                    filename="situaciones-grupo-familiar"
                  />
                )}
              </div>

              {/* MIEMBROS Y SUS SITUACIONES */}
              <div className="space-y-6">
                {miembros.map((miembro) => (
                  <div
                    key={miembro.dni}
                    className="border border-gray-300 rounded-lg p-4 bg-white"
                  >
                    {/* INFO DEL MIEMBRO */}
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {miembro.nombre} {miembro.apellido}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">DNI:</span> {miembro.dni}
                        </span>
                        <span>
                          <span className="font-medium">Parentesco:</span>{" "}
                          {miembro.parentesco}
                        </span>
                        <span>
                          <span className="font-medium">Situaciones:</span>{" "}
                          {miembro.situaciones.length}
                        </span>
                      </div>
                    </div>

                    {/* SITUACIONES DEL MIEMBRO */}
                    {miembro.situaciones.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Sin situaciones terapéuticas registradas
                      </p>
                    ) : (
                      <>
                        {/* DESKTOP: tabla */}
                        <div className="hidden md:block">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded">
                            <thead className="bg-gray-50">
                              <tr>
                                {["Situación", "Fecha Inicio", "Fecha Fin", "Estado"].map(
                                  (h) => (
                                    <th
                                      key={h}
                                      className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                      {h}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {miembro.situaciones.map((s) => (
                                <tr key={s.idSituacionAfiliado}>
                                  <td className="px-3 py-2 text-sm">
                                    {s.situacion}
                                  </td>
                                  <td className="px-3 py-2 text-sm">
                                    {formatFecha(s.fechaInicio)}
                                  </td>
                                  <td className="px-3 py-2 text-sm">
                                    {s.fechaFin ? formatFecha(s.fechaFin) : "—"}
                                  </td>
                                  <td className="px-3 py-2 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-semibold ${s.estado === "Activa"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                      {s.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* MOBILE: cards */}
                        <div className="md:hidden space-y-2">
                          {miembro.situaciones.map((s) => (
                            <div
                              key={s.idSituacionAfiliado}
                              className="border border-gray-200 rounded p-2 bg-gray-50"
                            >
                              <div className="font-medium text-sm mb-1">
                                {s.situacion}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Inicio:</span>{" "}
                                  {formatFecha(s.fechaInicio)}
                                </div>
                                <div>
                                  <span className="font-medium">Fin:</span>{" "}
                                  {s.fechaFin ? formatFecha(s.fechaFin) : "—"}
                                </div>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${s.estado === "Activa"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {s.estado}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
