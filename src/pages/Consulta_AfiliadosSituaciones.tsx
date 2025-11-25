import { useState } from "react";
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

type AfiliadoInfo = {
  dni: string;
  nombre: string;
  apellido: string;
};

type ResultData = {
  afiliado: AfiliadoInfo;
  situaciones: SituacionRow[];
};

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-AR");
}

export function SituacionesPorAfiliado() {
  const navigate = useNavigate();

  const [dni, setDni] = useState<string>("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = result ? Math.max(1, Math.ceil(result.situaciones.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = result ? result.situaciones.slice(startIndex, endIndex) : [];

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
      setResult(null);
      setPage(1);

      const res = await fetch(
        `${API_BASE_URL}/reports/situaciones-por-afiliado?dni=${dni}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Afiliado no encontrado");
        }
        throw new Error("Error al obtener situaciones del afiliado");
      }

      const data: ResultData = await res.json();
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error al consultar el reporte");
    } finally {
      setLoading(false);
    }
  };

  // 📌 CONFIGURACIÓN PDF
  const pdfColumns = [
    { key: "situacion", label: "Situación" },
    { key: "fechaInicio", label: "Fecha Inicio", format: (val: string) => formatFecha(val) },
    { key: "fechaFin", label: "Fecha Fin", format: (val: string | null) => (val ? formatFecha(val) : "—") },
    { key: "estado", label: "Estado" },
  ];

  // Datos para PDF: combinar info del afiliado con situaciones
  const dataPDF = result?.situaciones.map((s) => ({
    ...s,
    afiliadoNombre: `${result.afiliado.nombre} ${result.afiliado.apellido}`,
    afiliadoDNI: result.afiliado.dni,
  })) || [];

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-[#5FA92C]">
          Situaciones terapéuticas por afiliado
        </h1>

        <div className="mb-4">
          <ButtonVolver text="Volver" onClick={() => navigate("/consultas")} />
        </div>

        {/* INPUT DNI */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            DNI del Afiliado
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <input
              type="text"
              inputMode="numeric"
              value={dni}
              onChange={(e) => handleDniChange(e.target.value)}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
              placeholder="Ej: 12345678"
              maxLength={8}
            />

            <button
              type="button"
              onClick={handleBuscar}
              disabled={!dniValido || loading}
              className={`
                px-5 py-2 rounded-md text-white font-semibold
                ${
                  dniValido && !loading
                    ? "bg-[#5FA92C] hover:bg-[#4c8c23]"
                    : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Ingrese el DNI del afiliado (7-8 dígitos).
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {/* RESULTADOS */}
        <div className="mt-2">
          {!loading && !result && !error && (
            <p className="text-sm text-gray-600">
              Ingrese un DNI válido y presione{" "}
              <span className="font-semibold">Buscar</span> para ver las
              situaciones terapéuticas del afiliado.
            </p>
          )}

          {result && (
            <>
              {/* INFO DEL AFILIADO */}
              <div className="mb-4 p-4 bg-[#F2FAEC] rounded-lg border border-[#5FA92C]">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Información del Afiliado
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">DNI:</span>{" "}
                    <span className="font-medium">{result.afiliado.dni}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nombre:</span>{" "}
                    <span className="font-medium">{result.afiliado.nombre}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Apellido:</span>{" "}
                    <span className="font-medium">{result.afiliado.apellido}</span>
                  </div>
                </div>
              </div>

              {/* Resumen cantidad */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
                <p className="text-sm text-gray-700">
                  Situaciones encontradas:{" "}
                  <span className="font-semibold">{result.situaciones.length}</span>
                </p>

                {/* 📌 BOTÓN PDF */}
                {result.situaciones.length > 0 && (
                  <PDFDownloadButton
                    title="Situaciones terapéuticas por afiliado"
                    subtitle={`${result.afiliado.nombre} ${result.afiliado.apellido} (DNI: ${result.afiliado.dni})`}
                    data={dataPDF}
                    columns={pdfColumns}
                    filename="situaciones-afiliado"
                  />
                )}
              </div>

              {result.situaciones.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Este afiliado no tiene situaciones terapéuticas registradas.
                </p>
              ) : (
                <>
                  {/* DESKTOP: tabla */}
                  <div className="hidden md:block rounded-md shadow-sm border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#5FA92C] text-white">
                        <tr>
                          {["Situación", "Fecha Inicio", "Fecha Fin", "Estado"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentRows.map((s) => (
                          <tr key={s.idSituacionAfiliado}>
                            <td className="px-4 py-2 text-sm">{s.situacion}</td>
                            <td className="px-4 py-2 text-sm">
                              {formatFecha(s.fechaInicio)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {s.fechaFin ? formatFecha(s.fechaFin) : "—"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  s.estado === "Activa"
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
                  <div className="md:hidden space-y-3">
                    {currentRows.map((s) => (
                      <div
                        key={s.idSituacionAfiliado}
                        className="border border-gray-200 rounded-lg shadow-sm p-3 bg-white"
                      >
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 uppercase">
                            Situación
                          </div>
                          <div className="font-semibold text-sm">{s.situacion}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Fecha Inicio
                            </div>
                            <div>{formatFecha(s.fechaInicio)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">
                              Fecha Fin
                            </div>
                            <div>{s.fechaFin ? formatFecha(s.fechaFin) : "—"}</div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              s.estado === "Activa"
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

                  {/* PAGINACIÓN */}
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                    <span>
                      {result.situaciones.length === 0 ? 0 : startIndex + 1}–
                      {Math.min(endIndex, result.situaciones.length)} de{" "}
                      {result.situaciones.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        {safePage}/{totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}