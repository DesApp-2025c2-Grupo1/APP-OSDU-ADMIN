import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonVolver } from "../util/ButtonVolver";
import { PDFDownloadButton } from "../util/ReportPDFExporter";
import { API_BASE_URL, apiFetch } from "../config/api";

type PrestadorSinAgendaRow = {
  cuitCuil: string;
  nombreCompleto: string;
  tipoPrestador: string;
};

export function PrestadoresSinAgendas() {
  const navigate = useNavigate();

  const [results, setResults] = useState<PrestadorSinAgendaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // 🔹 Paginación
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRows = results.slice(startIndex, endIndex);

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults([]);
      setPage(1);

      const res = await apiFetch(
        `${API_BASE_URL}/reports/prestadores-sin-agendas`
      );

      if (!res.ok) {
        throw new Error("Error al obtener prestadores sin agendas");
      }

      const data = await res.json();
      const rows: PrestadorSinAgendaRow[] = Array.isArray(data)
        ? data
        : data.results || data.providers || [];

      setResults(rows);
      setSearched(true);
    } catch (e: any) {
      setError(e.message || "Error al consultar el reporte");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // 📌 CONFIGURACIÓN DEL PDF
  const pdfColumns = [
    { key: "nombreCompleto", label: "Nombre Completo" },
    { key: "cuitCuil", label: "CUIL/CUIT" },
    { key: "tipoPrestador", label: "Tipo de Prestador" },
  ];

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-[#5FA92C]">
          Prestadores sin agendas cargadas
        </h1>

        <div className="mb-4">
          <ButtonVolver text="Volver" onClick={() => navigate("/consultas")} />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Aquí se listan los prestadores que no tienen agendas de turnos cargadas en el sistema.
          </p>
        </div>

        {/* BOTONES BUSCAR Y DESCARGAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={loading}
            className={`
              px-5 py-2 rounded-md text-white font-semibold
              ${!loading
                ? "bg-[#5FA92C] hover:bg-[#4c8c23]"
                : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Cargando..." : "Cargar Prestadores"}
          </button>

          {/* 📌 BOTÓN PDF - Solo visible si hay resultados */}
          {results.length > 0 && (
            <PDFDownloadButton
              title="Prestadores sin agendas cargadas"
              subtitle={`Total de prestadores: ${results.length}`}
              data={results}
              columns={pdfColumns}
              filename="prestadores-sin-agendas"
            />
          )}
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <p className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* RESULTADOS */}
        <div className="mt-2">
          {!loading && !searched && (
            <p className="text-sm text-gray-600">
              Presione el botón{" "}
              <span className="font-semibold">Cargar Prestadores</span> para ver la lista.
            </p>
          )}

          {searched && results.length === 0 && !error && (
            <p className="text-sm text-gray-600">
              No hay prestadores sin agendas cargadas.
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
                      {[
                        "CUIL/CUIT",
                        "Nombre Completo",
                        "Tipo de Prestador",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRows.map((p) => (
                      <tr key={p.cuitCuil} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm break-all">
                          {p.cuitCuil}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {p.nombreCompleto}
                        </td>
                        <td className="px-4 py-2 text-sm capitalize">
                          {p.tipoPrestador}
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
                        Nombre Completo
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
                          Tipo de Prestador
                        </div>
                        <div className="capitalize">{p.tipoPrestador}</div>
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