import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonVolver } from "../util/ButtonVolver";
import { SPECIALTIES, loadSpecialties } from "../data/specialties";
import { API_BASE_URL } from "../config/api";

// 🔹 Fila de resultado (ajustarla a lo que devuelva tu API real)
type PrestadorEspecialidadRow = {
  cuitCuil: string;
  nombreCompleto: string;
  tipoPrestador: string;
  // CAMBIAR SI O SI si el back devuelve otro nombre/campo
  especialidadNombre?: string;
};

export function PrestadoresPorEspecialidad() {
  const navigate = useNavigate();

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
  const [results, setResults] = useState<PrestadorEspecialidadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Paginación
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = results.slice(startIndex, endIndex);

  const selectedSpecialty = SPECIALTIES.find(
    (s) => String(s.id) === selectedSpecialtyId
  );

  const handleBuscar = async () => {
    if (!selectedSpecialtyId) return;

    try {
      setLoading(true);
      setError(null);
      setResults([]);
      setPage(1);

      // CAMBIAR SI O SI POR LA RUTA DEL BACK-END PARA ESTE REPORTE
      const res = await fetch(
        `${API_BASE_URL}/reports/prestadores-por-especialidad?specialtyId=${selectedSpecialtyId}`
      );

      if (!res.ok) {
        throw new Error("Error al obtener prestadores por especialidad");
      }

      const data = await res.json();

      // CAMBIAR SI O SI DEPENDIENDO DE CÓMO RESPONDA EL BACK
      const rows: PrestadorEspecialidadRow[] = Array.isArray(data)
        ? data
        : data.results || data.providers || [];

      setResults(rows);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error al consultar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-[#5FA92C]">
          Cantidad de prestadores por especialidad
        </h1>

        <div className="mb-4">
          <ButtonVolver text="Volver" onClick={() => navigate("/consultas")} />
        </div>

        {/* SELECT ESPECIALIDAD */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Especialidad
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FA92C]"
            >
              <option value="">Seleccionar especialidad</option>
              {SPECIALTIES.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBuscar}
              disabled={!selectedSpecialtyId || loading}
              className={`
                px-5 py-2 rounded-md text-white font-semibold
                ${
                  selectedSpecialtyId && !loading
                    ? "bg-[#5FA92C] hover:bg-[#4c8c23]"
                    : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <p className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* RESULTADOS */}
        <div className="mt-2">
          {!loading && results.length === 0 && !error && (
            <p className="text-sm text-gray-600">
              Seleccione una especialidad y presione{" "}
              <span className="font-semibold">Buscar</span> para ver los
              prestadores que la poseen.
            </p>
          )}

          {results.length > 0 && (
            <>
              {/* Resumen cantidad */}
              <p className="mb-2 text-sm text-gray-700">
                Prestadores encontrados:{" "}
                <span className="font-semibold">{results.length}</span>
              </p>

              {/* DESKTOP: tabla */}
              <div className="hidden md:block rounded-md shadow-sm border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#5FA92C] text-white">
                    <tr>
                      {["CUIL/CUIT", "Nombre", "Tipo de prestador", "Especialidad"].map(
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
                    {currentRows.map((p) => (
                      <tr key={p.cuitCuil}>
                        <td className="px-4 py-2 text-sm break-all">
                          {p.cuitCuil}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.nombreCompleto}
                        </td>
                        <td className="px-4 py-2 text-sm capitalize">
                          {p.tipoPrestador}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {/* CAMBIAR SI O SI: si el back devuelve otro nombre de campo */}
                          {p.especialidadNombre || selectedSpecialty?.nombre || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: cards */}
              <div className="md:hidden space-y-3">
                {currentRows.map((p) => (
                  <div
                    key={p.cuitCuil}
                    className="border border-gray-200 rounded-lg shadow-sm p-3 bg-white"
                  >
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 uppercase">
                        Nombre
                      </div>
                      <div className="font-semibold text-sm">
                        {p.nombreCompleto}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          CUIL/CUIT
                        </div>
                        <div className="break-all">{p.cuitCuil}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Tipo de prestador
                        </div>
                        <div className="capitalize">{p.tipoPrestador}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Especialidad
                        </div>
                        <div>
                          {p.especialidadNombre || selectedSpecialty?.nombre || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINACIÓN */}
              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <span>
                  {results.length === 0 ? 0 : startIndex + 1}
                  –{Math.min(endIndex, results.length)} de {results.length}
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
        </div>
      </div>
    </div>
  );
}
