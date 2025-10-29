import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import SearchDropdown from "../components/SearchDropdown";
import { ProvidersTable } from "../components/ProvidersTable";
import type { Prestador } from "../model/Provider.model";
import { providersMock } from "../data/providers";
import { EditProviderPopup } from "../components/EditProviderPopup";
import { ViewProviderPopup } from "../components/ViewProviderPopup";
import { ConfirmDeleteProviderDialog } from "../components/ConfirmDeleteProviderDialog";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

type ProviderField = keyof Pick<Prestador, "cuilCuit" | "nombreCompleto">;

export function Prestadores() {
  const navigate = useNavigate();

  const [prestadores, setPrestadores] = useState<Prestador[]>(providersMock);
  const [field, setField] = useState<ProviderField>("cuilCuit");
  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "profesional" | "centro">("todos");

  // Popups
  const [editingProvider, setEditingProvider] = useState<Prestador | null>(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<Prestador | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<Prestador | null>(null);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  // Buscador
  const handleSearch = (f: string, q: string) => {
    setField(f as ProviderField);
    setQuery(q);
  };

  // Filtros toggle
  const handleToggleFiltro = (valor: "profesional" | "centro") => {
    setTipoFiltro((prev) => (prev === valor ? "todos" : valor));
  };

  // Filtrado
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = prestadores;

    if (tipoFiltro !== "todos") {
      result = result.filter((p) => p.tipo === tipoFiltro);
    }

    if (q) {
      result = result.filter((p) => String(p[field] ?? "").toLowerCase().includes(q));
    }

    return result;
  }, [prestadores, field, query, tipoFiltro]);

  // Paginación para MOBILE (5 por página)
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const current = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(1);
  }, [field, query, tipoFiltro]);

  // Opciones por item
  const handleOptionClick = (option: string, prestador: Prestador) => {
    if (option === "Editar") {
      setEditingProvider(prestador);
      setOpenEditPopup(true);
    } else if (option === "Ver Detalles") {
      setViewingProvider(prestador);
      setOpenViewPopup(true);
    } else if (option === "Dar de Baja") {
      setDeletingProvider(prestador);
      setOpenDeletePopup(true);
    }
  };

  const handleSaveProvider = (updated: Prestador) => {
    setPrestadores((prev) => prev.map((p) => (p.cuilCuit === updated.cuilCuit ? updated : p)));
  };

  const handleDeleteProvider = () => {
    if (deletingProvider) {
      setPrestadores((prev) => prev.filter((p) => p.cuilCuit !== deletingProvider.cuilCuit));
      setOpenDeletePopup(false);
      setDeletingProvider(null);
    }
  };

  const handleAddProvider = () => navigate("/prestadores/agregarPrestador");

  return (
    <div className="w-full p-6 space-y-6">
      {/* Barra de herramientas (igual) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchDropdown
            options={[
              { value: "cuilCuit", label: "CUIL/CUIT" },
              { value: "nombreCompleto", label: "Nombre" },
            ]}
            placeholder="Buscar"
            onSearch={handleSearch}
            className="w-full sm:w-96"
          />

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                handleToggleFiltro("profesional");
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              aria-pressed={tipoFiltro === "profesional"}
              className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${tipoFiltro === "profesional"
                  ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                  : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
                } btn-filter`}
            >
              Ver profesionales
            </button>

            <button
              onClick={(e) => {
                handleToggleFiltro("centro");
                (e.currentTarget as HTMLButtonElement).blur();
              }}
              aria-pressed={tipoFiltro === "centro"}
              className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${tipoFiltro === "centro"
                  ? "bg-[#5FA92C] text-white border-[#5FA92C]"
                  : "border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white"
                } btn-filter`}
            >
              Ver centros
            </button>

          </div>
        </div>

        <ButtonAddAffiliate text="Agregar Prestador" onClick={handleAddProvider} />
      </div>

      {/* DESKTOP: tabla (igual que antes) */}
      <div className="hidden md:block rounded-md shadow-sm border border-gray-200">
        <ProvidersTable
          prestadores={filtered}
          onOptionClick={handleOptionClick}
          pageSize={5}
        />
      </div>

      {/* MOBILE: cards + paginación */}
      <div className="md:hidden">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4">
          {current.length === 0 && (
            <div className="text-center text-gray-500 py-6 border rounded-md bg-white">
              No hay prestadores para mostrar.
            </div>
          )}

          {current.map((p) => (
            <div
              key={p.cuilCuit}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              <div className="mb-3">
                <div className="text-xs text-gray-500 uppercase">CUIL/CUIT</div>
                <div className="font-semibold break-all">{p.cuilCuit}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase">Nombre</div>
                  <div className="text-sm">{p.nombreCompleto}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Tipo</div>
                  <div className="text-sm capitalize">{p.tipo}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleOptionClick("Ver Detalles", p)}
                  className="px-3 py-2 text-sm border rounded-md border-gray-300 hover:bg-gray-50"
                >
                  Ver detalles
                </button>
                <button
                  onClick={() => handleOptionClick("Editar", p)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-[#5FA92C] text-[#5FA92C] hover:bg-[#5FA92C] hover:text-white font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleOptionClick("Dar de Baja", p)}
                  className="px-3 py-2 text-sm border-2 rounded-md border-red-500 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Dar de baja
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación (compacta en mobile) */}
        <div className="bg-white px-4 py-3 mt-3 flex items-center justify-between gap-3 border border-gray-200 rounded">
          <span className="text-sm text-gray-700">
            {total === 0 ? 0 : startIndex + 1}
            –{endIndex} de {total} {safePage}/{totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
              title="Página anterior"
            >
              <NavigateBeforeIcon fontSize="small" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
              title="Página siguiente"
            >
              <NavigateNextIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {openEditPopup && editingProvider && (
        <EditProviderPopup
          provider={editingProvider}
          onClose={() => setOpenEditPopup(false)}
          onSave={handleSaveProvider}
        />
      )}

      {openViewPopup && viewingProvider && (
        <ViewProviderPopup
          provider={viewingProvider}
          onClose={() => setOpenViewPopup(false)}
        />
      )}

      {openDeletePopup && deletingProvider && (
        <ConfirmDeleteProviderDialog
          open={openDeletePopup}
          provider={deletingProvider}
          onClose={() => setOpenDeletePopup(false)}
          onConfirm={handleDeleteProvider}
        />
      )}
    </div>
  );
}
