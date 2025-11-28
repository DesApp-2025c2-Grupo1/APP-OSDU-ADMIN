import { useState } from "react";
import { ButtonVolver } from "../util/ButtonVolver";
import { useNavigate } from "react-router-dom";
import { PDFDownloadButton } from "../util/ReportPDFExporter";
import { API_BASE_URL } from "../config/api";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatEs(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("es-AR");
}

function formatFechaAlta(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha; // si ya viene formateada
  return d.toLocaleDateString("es-AR");
}

// 🔹 Tipo de fila de resultado (ajustalo a tu API real)
type AltaPrestadorRow = {
  cuitCuil: string;
  nombreCompleto: string;
  tipoPrestador: string;
  // CAMBIAR SI O SI DEPENDIENDO NOMBRE DEL DATO QUE MANEJE FECHA DE ALTA EN EL BACK
  fechaAlta: string;
};

export function AltasPrestadoresPeriodo() {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 🔹 Estado de resultados
  const [results, setResults] = useState<AltaPrestadorRow[]>([]);
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

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (!startDate && !endDate) {
      setStartDate(clicked);
      return;
    }

    if (startDate && !endDate) {
      if (clicked < startDate) {
        setStartDate(clicked);
        return;
      }
      if (isSameDay(clicked, startDate)) {
        setStartDate(null);
        return;
      }
      setEndDate(clicked);
      return;
    }

    setStartDate(clicked);
    setEndDate(null);
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstWeekday = currentMonth.getDay(); // 0 = domingo

  const blanks = Array(firstWeekday).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...blanks, ...days];

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  const hasValidRange =
    startDate &&
    endDate &&
    !isSameDay(startDate, endDate) &&
    startDate < endDate;

  const handleBuscar = async () => {
    if (!hasValidRange || !startDate || !endDate) return;

    // formateamos a YYYY-MM-DD para el backend
    const toISODate = (d: Date) =>
      d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const from = toISODate(startDate);
    const to = toISODate(endDate);

    try {
      setLoading(true);
      setError(null);
      setResults([]);
      setPage(1);

      // CAMBIAR SI O SI POR LA RUTA DEL BACK PARA PRESTADORES
      const res = await fetch(
        `${API_BASE_URL}/reports/altas-prestadores?from=${from}&to=${to}`
      );

      if (!res.ok) {
        throw new Error("Error al obtener altas de prestadores");
      }

      // CAMBIAR SI O SI DEPENDIENDO DE LA RESPUESTA DEL BACK
      const data = await res.json();
      const rows: AltaPrestadorRow[] = Array.isArray(data)
        ? data
        : data.results || data.providers || [];

      setResults(rows);
      setSearched(true);
    } catch (e: any) {
      setError(e.message || "Error al consultar el reporte de prestadores");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // 📌 CONFIGURACIÓN PDF
  const pdfColumns = [
    { key: "nombreCompleto", label: "Nombre" },
    { key: "cuitCuil", label: "CUIL/CUIT" },
    {
      key: "tipoPrestador",
      label: "Tipo de Prestador",
      format: (val: string) => val.charAt(0).toUpperCase() + val.slice(1),
    },
    {
      key: "fechaAlta",
      label: "Fecha de Alta",
      format: (val: string) => formatFechaAlta(val),
    },
  ];

  const subtitulo = startDate && endDate
    ? `Período: ${formatEs(startDate)} - ${formatEs(endDate)}`
    : "";

  return (
    <div className="w-full flex justify-center px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-2 text-[#5FA92C]">
          Alta de prestadores por periodo
        </h1>

        <div className="mb-6">
          <ButtonVolver
            text="Volver"
            onClick={() => navigate("/consultas")}
          />
        </div>

        {/* RANGO SELECCIONADO */}
        <div className="mb-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Desde:</span>{" "}
            {startDate ? formatEs(startDate) : "—"}
          </p>
          <p>
            <span className="font-semibold">Hasta:</span>{" "}
            {endDate ? formatEs(endDate) : "—"}
          </p>
          {!hasValidRange && (startDate || endDate) && (
            <p className="mt-1 text-xs text-red-600">
              Seleccioná un rango válido (mínimo dos días distintos).
            </p>
          )}
        </div>

        {/* CALENDARIO — CENTRADO */}
        <div className="flex justify-center">
          <div className="inline-block rounded-lg border border-gray-200 bg-white p-4">
            {/* Header mes / navegación */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
              >
                ‹
              </button>
              <div className="font-semibold capitalize">
                {currentMonth.toLocaleDateString("es-AR", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
              >
                ›
              </button>
            </div>

            {/* Nombres días */}
            <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-1">
              <div className="text-center">Dom</div>
              <div className="text-center">Lun</div>
              <div className="text-center">Mar</div>
              <div className="text-center">Mié</div>
              <div className="text-center">Jue</div>
              <div className="text-center">Vie</div>
              <div className="text-center">Sáb</div>
            </div>

            {/* Días */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((cell, ci) => {
                    if (cell === null) {
                      return <div key={ci} className="h-8" />;
                    }

                    const cellDate = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      cell
                    );

                    const isStart = !!startDate && isSameDay(cellDate, startDate);
                    const isEnd = !!endDate && isSameDay(cellDate, endDate);
                    const inRange =
                      startDate &&
                      endDate &&
                      cellDate > startDate &&
                      cellDate < endDate;

                    let classes =
                      "w-8 h-8 flex items-center justify-center text-sm rounded cursor-pointer ";

                    if (isStart || isEnd) {
                      classes += "bg-[#5FA92C] text-white font-semibold";
                    } else if (inRange) {
                      classes += "bg-[#E1F3D0] text-[#2f5e11]";
                    } else {
                      classes += "hover:bg-gray-100";
                    }

                    return (
                      <button
                        key={ci}
                        type="button"
                        onClick={() => handleDayClick(cell)}
                        className={classes}
                      >
                        {cell}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTÓN BUSCAR */}
        <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={!hasValidRange || loading}
            className={`
              px-5 py-2 rounded-md text-white font-semibold
              ${hasValidRange && !loading
                ? "bg-[#5FA92C] hover:bg-[#4c8c23]"
                : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          {/* 📌 BOTÓN PDF */}
          {results.length > 0 && (
            <PDFDownloadButton
              title="Alta de prestadores por período"
              subtitle={subtitulo}
              data={results}
              columns={pdfColumns}
              filename="altas-prestadores"
            />
          )}
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <p className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* RESULTADOS */}
        <div className="mt-4">
          {!loading && results.length === 0 && !error && !searched && (
            <p className="text-sm text-gray-600">
              Seleccione un rango de fechas y presione{" "}
              <span className="font-semibold">Buscar</span> para ver las altas de prestadores.
            </p>
          )}

          {!loading && results.length === 0 && !error && searched && (
            <p className="text-sm text-gray-600">
              No se encontraron prestadores dados de alta en el período seleccionado.
            </p>
          )}

          {results.length > 0 && (
            <>
              {/* DESKTOP: tabla */}
              <div className="hidden md:block rounded-md shadow-sm border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#5FA92C] text-white">
                    <tr>
                      {["Nombre", "CUIL/CUIT", "Tipo de prestador", "Fecha de alta"].map((h) => (
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
                    {currentRows.map((r) => (
                      <tr key={r.cuitCuil}>
                        <td className="px-4 py-2 text-sm">{r.nombreCompleto}</td>
                        <td className="px-4 py-2 text-sm">{r.cuitCuil}</td>
                        <td className="px-4 py-2 text-sm capitalize">
                          {r.tipoPrestador}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatFechaAlta(r.fechaAlta)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: cards */}
              <div className="md:hidden space-y-3">
                {currentRows.map((r) => (
                  <div
                    key={r.cuitCuil}
                    className="border border-gray-200 rounded-lg shadow-sm p-3 bg-white"
                  >
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 uppercase">Nombre</div>
                      <div className="font-semibold text-sm">
                        {r.nombreCompleto}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">CUIL/CUIT</div>
                        <div>{r.cuitCuil}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Tipo</div>
                        <div className="capitalize">{r.tipoPrestador}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">
                          Fecha de alta
                        </div>
                        <div>{formatFechaAlta(r.fechaAlta)}</div>
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
