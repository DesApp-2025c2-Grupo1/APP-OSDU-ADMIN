import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProvidersTable } from "../components/ProvidersTable";
import type { Prestador, ProviderFilters } from "../model/Provider.model";
import { EditProviderPopup } from "../components/EditProviderPopup";
import { ViewProviderPopup } from "../components/ViewProviderPopup";
import { ConfirmDeleteProviderDialog } from "../components/ConfirmDeleteProviderDialog";
import {
  deleteProvider,
  fetchProviderByCuit,
  fetchProvidersPage,
  forceProviderPasswordChange,
  reactivateProvider,
  resendProviderCredentials,
  resetProviderPassword,
  suspendProvider,
} from "../api/providerService";
import { useModalPresence } from "../context/ModalContext";

type ProviderField = keyof Pick<Prestador, "cuitCuil" | "nombreCompleto">;

// 🔹 Toast component (notificación visual)
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-[#14B8A6] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
    {message}
    <button className="ml-3 font-bold text-white" onClick={onClose}>
      ×
    </button>
  </div>
);

export function Prestadores() {
  const navigate = useNavigate();

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [field, setField] = useState<ProviderField>("cuitCuil");
  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "profesional" | "centro_medico">("todos");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [localidadFiltro, setLocalidadFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activo" | "suspendido" | "baja">("activo");
  const [centroFiltro, setCentroFiltro] = useState("");
  const [serverPage, setServerPage] = useState(1);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const serverPageSize = 5;

  // Popups
  const [editingProvider, setEditingProvider] = useState<Prestador | null>(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<Prestador | null>(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<Prestador | null>(null);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [suspendingProvider, setSuspendingProvider] = useState<Prestador | null>(null);
  const [openSuspendPopup, setOpenSuspendPopup] = useState(false);

  useModalPresence(
    "providers-modals",
    openEditPopup || openViewPopup || openDeletePopup || openSuspendPopup
  );

  const providerFilters = useMemo<ProviderFilters>(() => {
    const filters: ProviderFilters = {
      tipoPrestador: tipoFiltro,
      especialidad: especialidadFiltro.trim(),
      localidad: localidadFiltro.trim(),
      estado: estadoFiltro,
      centroMedicoId: centroFiltro.trim(),
      page: serverPage,
      limit: serverPageSize,
    };

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (field === "cuitCuil") filters.cuitCuil = trimmedQuery;
      else filters.nombre = trimmedQuery;
    }

    return filters;
  }, [tipoFiltro, especialidadFiltro, localidadFiltro, estadoFiltro, centroFiltro, field, query, serverPage]);

  // 🟩 Función para mostrar mensaje visual (toast)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Carga de prestadores desde API
  const loadProviders = async (filters = providerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await fetchProvidersPage(filters);
      setPrestadores(pageData.data);
      setServerTotal(pageData.total);
      setServerTotalPages(pageData.totalPages);
    } catch (err) {
      setError("No se pudieron cargar los prestadores");
    } finally {
      setLoading(false);
    }
  };

  // Cargar prestadores al montar el componente
  useEffect(() => {
    loadProviders(providerFilters);
  }, [providerFilters]);

  // Filtros toggle
  const handleToggleFiltro = (valor: "profesional" | "centro_medico") => {
    setTipoFiltro((prev) => (prev === valor ? "todos" : valor));
  };

  // Filtrado local de respaldo para una respuesta ya filtrada por backend.
  const filtered = useMemo(() => {
    let result = prestadores;
    return result;
  }, [prestadores]);

  useEffect(() => {
    setServerPage(1);
  }, [field, query, tipoFiltro, especialidadFiltro, localidadFiltro, estadoFiltro, centroFiltro]);

  // Opciones por item
  const handleOptionClick = async (option: string, prestador: Prestador) => {
    if (option === "Editar") {
      setEditingProvider(prestador);
      setOpenEditPopup(true);
    } else if (option === "Ver Detalles") {
      try {
        const providerDetail = await fetchProviderByCuit(prestador.cuitCuil);
        setViewingProvider(providerDetail);
        setOpenViewPopup(true);
      } catch {
        setViewingProvider(prestador);
        setOpenViewPopup(true);
      }
    } else if (option === "Dar de Baja") {
      setDeletingProvider(prestador);
      setOpenDeletePopup(true);
    } else if (option === "Suspender") {
      setSuspendingProvider(prestador);
      setOpenSuspendPopup(true);
    } else if (option === "Reactivar") {
      try {
        await reactivateProvider(prestador.cuitCuil);
        await loadProviders();
        showToast(`Prestador ${prestador.nombreCompleto} reactivado`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error al reactivar prestador");
      }
    } else if (option === "Resetear contraseña") {
      try {
        const result = await resetProviderPassword(prestador.cuitCuil);
        await loadProviders();
        showToast(result.temporaryPassword ? `Contraseña temporal: ${result.temporaryPassword}` : result.message);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error al resetear contraseña");
      }
    } else if (option === "Reenviar credenciales") {
      try {
        const result = await resendProviderCredentials(prestador.cuitCuil);
        await loadProviders();
        showToast(result.message);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error al reenviar credenciales");
      }
    } else if (option === "Forzar cambio de contraseña") {
      try {
        await forceProviderPasswordChange(prestador.cuitCuil);
        await loadProviders();
        showToast("Cambio de contraseña requerido en próximo ingreso");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Error al forzar cambio de contraseña");
      }
    }
  };

  const handleSaveProvider = async (updated: Prestador) => {
    try {
      // El popup ya hizo el updateProvider, solo necesitamos recargar
      setOpenEditPopup(false);
      setEditingProvider(null);

      // Recargar la lista de prestadores desde el API
      await loadProviders();
      const updatedName = updated?.nombreCompleto ? ` ${updated.nombreCompleto}` : "";
      showToast(`Prestador${updatedName} actualizado correctamente`);
    } catch (err) {
      showToast("Error al actualizar el prestador");
    }
  };

  const handleDeleteProvider = async (motivo: string) => {
    if (!deletingProvider) return;

    try {
      await deleteProvider(deletingProvider.cuitCuil, motivo);
      await loadProviders();
      setOpenDeletePopup(false);
      setDeletingProvider(null);
      const deletedName = deletingProvider?.nombreCompleto ? ` ${deletingProvider.nombreCompleto}` : "";
      showToast(`Prestador${deletedName} dado de baja correctamente`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al dar de baja el prestador");
    }
  };

  const handleSuspendProvider = async (motivo: string) => {
    if (!suspendingProvider) return;

    try {
      await suspendProvider(suspendingProvider.cuitCuil, motivo);
      await loadProviders();
      setOpenSuspendPopup(false);
      setSuspendingProvider(null);
      showToast(`Prestador ${suspendingProvider.nombreCompleto} suspendido`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al suspender prestador");
    }
  };

  const handleAddProvider = () => navigate("/prestadores/agregarPrestador");

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-700 text-slate-800">Prestadores</h1>
          <p className="text-xs text-slate-400">Gestión de proveedores y centros médicos</p>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-5">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-600 text-sm font-medium">Cargando prestadores...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-rose-600 py-6 border border-rose-300 rounded-2xl bg-rose-50">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar prestador por CUIL/CUIT o nombre..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-700"
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value as ProviderField)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-600 bg-white"
                >
                  <option value="cuitCuil">CUIL/CUIT</option>
                  <option value="nombreCompleto">Nombre</option>
                </select>
                
                <button
                  onClick={() => handleToggleFiltro("profesional")}
                  className={`px-4 py-2 text-xs font-600 rounded-lg transition-colors ${
                    tipoFiltro === "profesional"
                      ? "bg-teal-100 text-teal-700 border border-teal-200 hover:bg-teal-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Ver Profesionales
                </button>

                <button
                  onClick={() => handleToggleFiltro("centro_medico")}
                  className={`px-4 py-2 text-xs font-600 rounded-lg transition-colors ${
                    tipoFiltro === "centro_medico"
                      ? "bg-teal-100 text-teal-700 border border-teal-200 hover:bg-teal-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Ver Centros
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  value={especialidadFiltro}
                  onChange={(event) => setEspecialidadFiltro(event.target.value)}
                  placeholder="Especialidad"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <input
                  value={localidadFiltro}
                  onChange={(event) => setLocalidadFiltro(event.target.value)}
                  placeholder="Localidad"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <select
                  value={estadoFiltro}
                  onChange={(event) => setEstadoFiltro(event.target.value as "todos" | "activo" | "suspendido" | "baja")}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="suspendido">Suspendidos</option>
                  <option value="baja">Dados de baja</option>
                </select>
                <input
                  value={centroFiltro}
                  onChange={(event) => setCentroFiltro(event.target.value)}
                  placeholder="CUIT centro médico"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="text-xs font-500 text-slate-400">
                Mostrando {prestadores.length} de {serverTotal} prestadores
              </div>
              <button
                onClick={handleAddProvider}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors w-fit"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar Prestador
              </button>
            </div>

            <div className="hidden md:block">
              <ProvidersTable
                prestadores={filtered}
                onOptionClick={handleOptionClick}
                pageSize={serverPageSize}
                showPagination={false}
              />
            </div>

            <div className="md:hidden">
              {filtered.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-slate-400">
                  No hay prestadores para mostrar.
                </div>
              )}

              <div className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <div 
                    key={p.cuitCuil} 
                    className="px-4 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 text-slate-700">{p.nombreCompleto}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.cuitCuil}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-500 bg-slate-100 text-slate-600 capitalize whitespace-nowrap ml-2">
                        {p.tipoPrestador === "profesional" ? "Prof." : "Centro"}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOptionClick("Ver Detalles", p)}
                        className="text-xs font-500 text-slate-600 hover:text-slate-700 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleOptionClick("Editar", p)}
                        className="text-xs font-500 text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleOptionClick("Dar de Baja", p)}
                        className="text-xs font-500 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Baja
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white px-4 py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Página {serverPage} de {serverTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServerPage((p) => Math.max(1, p - 1))}
                  disabled={serverPage <= 1}
                  className="h-8 w-8 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => setServerPage((p) => Math.min(serverTotalPages, p + 1))}
                  disabled={serverPage >= serverTotalPages}
                  className="h-8 w-8 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}

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

        {openSuspendPopup && suspendingProvider && (
          <ConfirmDeleteProviderDialog
            open={openSuspendPopup}
            provider={suspendingProvider}
            action="suspension"
            onClose={() => setOpenSuspendPopup(false)}
            onConfirm={handleSuspendProvider}
          />
        )}

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </div>
    </main>
  );
}
