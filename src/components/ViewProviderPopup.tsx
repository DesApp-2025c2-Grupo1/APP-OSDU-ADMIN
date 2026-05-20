import { useState, useEffect } from "react";
import type { Prestador } from "../model/Provider.model";
import { API_BASE_URL, apiFetch } from "../config/api";

interface ViewProviderPopupProps {
  provider: Prestador;
  onClose: () => void;
}

export function ViewProviderPopup({ provider, onClose }: ViewProviderPopupProps) {
  const [selectedLugarIndex, setSelectedLugarIndex] = useState(0);
  const [centroNombre, setCentroNombre] = useState<string | null>(provider.centroMedico?.nombreCompleto || null);

  useEffect(() => {
    const cargarCentros = async () => {
      try {
        if (!provider.centroMedico?.nombreCompleto && provider.tipoPrestador === "profesional" && provider.centroMedicoId) {
          const response = await apiFetch(`${API_BASE_URL}/prestadores`);
          const data = await response.json();
          const centros = Array.isArray(data) ? data : (data.data || []);

          // Filtrar solo centros médicos
          const centrosMedicos = centros.filter((c: any) => c.tipoPrestador === "centro_medico");

          const centro = centrosMedicos.find(
            (c: any) => c.cuitCuil === provider.centroMedicoId
          );
          setCentroNombre(centro?.nombreCompleto || null);
        }
      } catch (error) {
      }
    };

    cargarCentros();
  }, [provider]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-AR");
  };

  const estado = provider.estado === "baja" ? "Baja" : provider.estado === "suspendido" ? "Suspendido" : "Activo";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800">✕</button>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Detalles del Prestador</h1>

        {/* DATOS DEL PRESTADOR */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Datos del Prestador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">CUIL / CUIT</label>
              <p className="p-2 border border-gray-200 rounded break-words">{provider.cuitCuil}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nombre Completo</label>
              <p className="p-2 border border-gray-200 rounded break-words">{provider.nombreCompleto}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Tipo</label>
              <p className="p-2 border border-gray-200 rounded capitalize">
                {provider.tipoPrestador === "centro_medico" ? "Centro Médico" : "Profesional"}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Estado</label>
              <p className="p-2 border border-gray-200 rounded">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${estado === "Activo" ? "bg-green-100 text-green-700" : estado === "Suspendido" ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-700"}`}>
                  {estado}
                </span>
              </p>
            </div>
            {provider.tipoPrestador === "profesional" && centroNombre && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Centro Médico</label>
                <p className="p-2 border border-gray-200 rounded break-words bg-blue-50">{centroNombre}</p>
              </div>
            )}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Fecha de alta</label>
              <p className="p-2 border border-gray-200 rounded break-words">{formatDate(provider.createdAt)}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Última modificación</label>
              <p className="p-2 border border-gray-200 rounded break-words">{formatDate(provider.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Especialidades
          </h2>

          {provider.especialidades && provider.especialidades.length > 0 ? (
            <ul className="space-y-2">
              {provider.especialidades.map((esp, i) => (
                <li key={i} className="p-2 border border-gray-200 rounded break-words">
                  {typeof esp === "string" ? esp : esp.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Sin especialidades.</p>
          )}
        </div>

        {/* CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Teléfonos</label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {provider.telefonos?.length ? provider.telefonos.join(" / ") : "-"}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Mails</label>
              <p className="p-2 border border-gray-200 rounded break-words">
                {provider.mails?.length ? provider.mails.join(" / ") : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* CUENTA */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">Estado de Cuenta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Email de acceso</label>
              <p className="p-2 border border-gray-200 rounded break-words">{provider.cuenta?.email || provider.emailPrincipal || "-"}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Rol</label>
              <p className="p-2 border border-gray-200 rounded">{provider.cuenta?.rol || "PRESTADOR"}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Contraseña</label>
              <p className="p-2 border border-gray-200 rounded">
                {provider.cuenta?.debeCambiarPassword ? "Debe cambiarla al ingresar" : "Actualizada"}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Credenciales enviadas</label>
              <p className="p-2 border border-gray-200 rounded">{formatDate(provider.cuenta?.credencialesEnviadasAt)}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Último reset</label>
              <p className="p-2 border border-gray-200 rounded">{formatDate(provider.cuenta?.passwordReseteadaAt)}</p>
            </div>
          </div>
        </div>

        {/* LUGARES DE ATENCIÓN */}
        {provider.lugaresAtencion && provider.lugaresAtencion.length > 0 && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
              Lugares de Atención ({provider.lugaresAtencion.length})
            </h2>

            {/* TABS PARA MÚLTIPLES LUGARES */}
            {provider.lugaresAtencion.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-300">
                {provider.lugaresAtencion.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLugarIndex(idx)}
                    className={`px-4 py-2 font-semibold transition ${selectedLugarIndex === idx
                      ? "text-[#5FA92C] border-b-2 border-[#5FA92C]"
                      : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    Lugar {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* DETALLES DEL LUGAR SELECCIONADO */}
            <div className="p-3 border border-gray-300 rounded bg-gray-50">
              <p className="text-gray-700 font-semibold mb-2">
                {provider.lugaresAtencion[selectedLugarIndex].calle}
              </p>
              {(provider.lugaresAtencion[selectedLugarIndex].localidad ||
                provider.lugaresAtencion[selectedLugarIndex].provincia) && (
                  <p className="text-gray-700 text-sm">
                    {provider.lugaresAtencion[selectedLugarIndex].localidad &&
                      provider.lugaresAtencion[selectedLugarIndex].localidad}
                    {provider.lugaresAtencion[selectedLugarIndex].localidad &&
                      provider.lugaresAtencion[selectedLugarIndex].provincia && " - "}
                    {provider.lugaresAtencion[selectedLugarIndex].provincia &&
                      provider.lugaresAtencion[selectedLugarIndex].provincia}
                  </p>
                )}
              <p className="text-gray-700 text-sm">
                CP: {provider.lugaresAtencion[selectedLugarIndex].cp}
              </p>

              {provider.lugaresAtencion[selectedLugarIndex].horarios &&
                provider.lugaresAtencion[selectedLugarIndex].horarios!.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="font-semibold text-gray-700 mb-2">Horarios de Atención:</p>
                    <ul className="space-y-1 text-sm">
                      {provider.lugaresAtencion[selectedLugarIndex].horarios!.map((h, idx) => (
                        <li key={idx} className="text-gray-600">
                          {h.dias.join(", ")}: {h.desde} - {h.hasta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* AGENDAS */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Agendas Asociadas ({provider.agendas?.length || 0})
          </h2>
          {provider.agendas && provider.agendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Especialidad", "Lugar", "Vigencia", "Duración", "Estado"].map((header) => (
                      <th key={header} className="px-3 py-2 text-left font-semibold text-gray-700">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {provider.agendas.map((agenda) => (
                    <tr key={agenda.id}>
                      <td className="px-3 py-2">{agenda.especialidad || "-"}</td>
                      <td className="px-3 py-2">{agenda.lugar || "-"}</td>
                      <td className="px-3 py-2">{formatDate(agenda.fechaInicio)} - {formatDate(agenda.fechaFin)}</td>
                      <td className="px-3 py-2">{agenda.duracionTurno || "-"} min</td>
                      <td className="px-3 py-2">{agenda.estaActivo ? "Activa" : "Inactiva"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Sin agendas asociadas.</p>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
