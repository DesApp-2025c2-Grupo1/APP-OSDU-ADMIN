import { useState, useEffect } from "react";
import { API_BASE_URL, apiFetch } from "../config/api";


interface SituacionTerapeutica {
  idSituacionAfiliado?: number;
  idSituacion?: number;
  fechaInicio: string;
  fechaFin: string | null;
  situacionTerapeutica?: {
    idSituacion: number;
    nombre: string;
  };
}

interface Plan {
  idPlan?: number;
  nombre?: string;
}

interface Email {
  idEmail: number;
  email: string;
}

interface Telefono {
  idTelefono?: number;
  telefono: string;
}

interface AffiliateType {
  credencial: string;
  dni?: string;
  nroDocumento?: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  fecha_nacimiento?: string;
  plan?: Plan | string | number;
  planMedico?: string;
  tipoDocumento?: string;
  parentesco?: string;
  situaciones?: SituacionTerapeutica[];
  telefono?: string | Telefono[];
  telefonos?: Telefono[];
  email?: string | Email[];
  direccion?: string;
  activo?: boolean | number;
  dni_document_path?: string;
  payslip_document_path?: string;
  id?: number;
}

interface ViewAffiliatePopupProps {
  affiliate: AffiliateType;
  onClose: () => void;
  onStatusChanged?: () => void;
}

export function ViewAffiliatePopup({ affiliate, onClose, onStatusChanged }: ViewAffiliatePopupProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fullAffiliate, setFullAffiliate] = useState<AffiliateType | null>(null);

  // Cargar datos completos del afiliado
  useEffect(() => {
    const fetchAffiliateDetails = async () => {
      try {
        setLoading(true);

        if (!affiliate.id) throw new Error("ID de afiliado no proporcionado");
        
        const response = await apiFetch(
          `${API_BASE_URL}/affiliates/${affiliate.id}`
        );

        if (!response.ok) throw new Error("Error al cargar datos del afiliado");

        const data = await response.json();

        setFullAffiliate(data.affiliates);
      } catch (error) {
        setFullAffiliate(affiliate); // Usar datos básicos si falla
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateDetails();
  }, [affiliate.dni, affiliate.nroDocumento]);

  const determinarParentesco = (aff: AffiliateType) => {
    if (aff.parentesco) return aff.parentesco;

    const partesCredencial = aff.credencial.split("-");
    if (partesCredencial.length !== 2) return "Familiar a cargo";

    const numeroCredencial = parseInt(partesCredencial[1]);
    switch (numeroCredencial) {
      case 1: return "Titular";
      case 2: return "Cónyuge";
      case 3:
      case 4:
      case 5: return "Hijo";
      default: return "Familiar a cargo";
    }
  };

  const obtenerNombrePlan = (plan: Plan | string | number | undefined, planMedico?: string) => {
    if (planMedico) return planMedico;
    if (!plan) return "Sin plan";

    if (typeof plan === 'object' && plan.nombre) {
      return plan.nombre;
    }

    return String(plan);
  };

  // Helper para obtener emails como array de strings
  const obtenerEmails = (aff: AffiliateType): string[] => {
    if (aff.email) {
      if (typeof aff.email === 'string') return [aff.email];
      if (Array.isArray(aff.email)) return aff.email.map(e => typeof e === 'string' ? e : e.email);
    }
    return [];
  };

  // Helper para obtener teléfonos como array de strings
  const obtenerTelefonos = (aff: AffiliateType): string[] => {
    // Primero verificar si hay un array de telefonos
    if (aff.telefonos && Array.isArray(aff.telefonos)) {
      return aff.telefonos.map(t => t.telefono);
    }
    // Si no, verificar telefono (singular)
    if (aff.telefono) {
      if (typeof aff.telefono === 'string') return [aff.telefono];
      if (Array.isArray(aff.telefono)) return aff.telefono.map(t => typeof t === 'string' ? t : t.telefono);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Cargando datos del afiliado...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayAffiliate = fullAffiliate || affiliate;

  const handleStatusChange = async (action: 'activate' | 'deactivate') => {
    if (!displayAffiliate.id) return;
    try {
        setActionLoading(true);
        const response = await apiFetch(`${API_BASE_URL}/affiliates/${displayAffiliate.id}/${action}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`Error al ${action} el afiliado`);
        alert(`Afiliado ${action === 'activate' ? 'aprobado' : 'rechazado'} con éxito.`);
        if (onStatusChanged) onStatusChanged();
        onClose();
    } catch (err) {
        alert(`Ocurrió un error al intentar cambiar el estado.`);
    } finally {
        setActionLoading(false);
    }
  };

  const emails = obtenerEmails(displayAffiliate);
  const telefonos = obtenerTelefonos(displayAffiliate);
  const rawDate = displayAffiliate.fechaNacimiento || displayAffiliate.fecha_nacimiento;
  let fechaNac = rawDate;
  if (rawDate && rawDate.includes("-")) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      fechaNac = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl my-8 p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-600 text-2xl hover:text-gray-800 z-10"
        >
          ✕
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pr-8">Detalles del Afiliado</h1>

        {/* Datos de Afiliado */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#14B8A6] text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b-2 border-[#14B8A6] pb-1">
            Datos de Afiliado
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {displayAffiliate.tipoDocumento && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Tipo Documento</label>
                <p className="p-2 border border-gray-200 rounded">{displayAffiliate.tipoDocumento}</p>
              </div>
            )}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nro Documento</label>
              <p className="p-2 border border-gray-200 rounded">
                {displayAffiliate.nroDocumento || displayAffiliate.dni || '-'}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nombres</label>
              <p className="p-2 border border-gray-200 rounded">{displayAffiliate.nombre}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Apellidos</label>
              <p className="p-2 border border-gray-200 rounded">{displayAffiliate.apellido}</p>
            </div>
            {fechaNac && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Fecha nacimiento</label>
                <p className="p-2 border border-gray-200 rounded">{fechaNac}</p>
              </div>
            )}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Plan Médico</label>
              <p className="p-2 border border-gray-200 rounded">
                {obtenerNombrePlan(displayAffiliate.plan, displayAffiliate.planMedico)}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Parentesco</label>
              <p className="p-2 border border-gray-200 rounded">{determinarParentesco(displayAffiliate)}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Credencial</label>
              <p className="p-2 border border-gray-200 rounded">{displayAffiliate.credencial}</p>
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        {(telefonos.length > 0 || emails.length > 0 || displayAffiliate.direccion) && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-[#14B8A6] text-lg font-semibold mb-4 border-b-2 border-[#14B8A6] pb-1">
              Datos de Contacto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {telefonos.length > 0 && (
                <div>
                  <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                    Teléfono{telefonos.length > 1 ? 's' : ''}
                  </label>
                  <div className="space-y-1">
                    {telefonos.map((tel, idx) => (
                      <p key={idx} className="p-2 border border-gray-200 rounded">{tel}</p>
                    ))}
                  </div>
                </div>
              )}
              {emails.length > 0 && (
                <div>
                  <label className="font-semibold mb-1 bg-gray-100 px-2 block">
                    Email{emails.length > 1 ? 's' : ''}
                  </label>
                  <div className="space-y-1">
                    {emails.map((mail, idx) => (
                      <p key={idx} className="p-2 border border-gray-200 rounded break-all">{mail}</p>
                    ))}
                  </div>
                </div>
              )}
              {displayAffiliate.direccion && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold mb-1 bg-gray-100 px-2 block">Dirección</label>
                  <p className="p-2 border border-gray-200 rounded">{displayAffiliate.direccion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documentos */}
        {(displayAffiliate.dni_document_path || displayAffiliate.payslip_document_path) && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
              Documentación Adjunta
            </h2>
            <div className="flex gap-4">
              {displayAffiliate.dni_document_path && (
                <a 
                    href={`${API_BASE_URL.replace('/api', '')}${displayAffiliate.dni_document_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 p-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 transition"
                >
                    <span className="font-semibold text-gray-700">Ver DNI</span>
                    <span className="text-blue-500 underline text-sm">Abrir documento</span>
                </a>
              )}
              {displayAffiliate.payslip_document_path && (
                <a 
                    href={`${API_BASE_URL.replace('/api', '')}${displayAffiliate.payslip_document_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 p-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50 transition"
                >
                    <span className="font-semibold text-gray-700">Ver Recibo de Sueldo</span>
                    <span className="text-blue-500 underline text-sm">Abrir documento</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Situaciones Terapéuticas */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#14B8A6] text-lg font-semibold mb-4 border-b-2 border-[#14B8A6] pb-1">
            Situaciones Terapéuticas
          </h2>

          {displayAffiliate.situaciones && displayAffiliate.situaciones.length > 0 ? (
            <div className="space-y-3">
              {displayAffiliate.situaciones.map((sit, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-300 rounded bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-semibold text-lg">
                      {sit.situacionTerapeutica?.nombre || 'Situación sin nombre'}
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                      {sit.fechaInicio && (
                        <span className="bg-blue-100 px-3 py-1 rounded">
                          Inicio: {sit.fechaInicio}
                        </span>
                      )}
                      {sit.fechaFin && (
                        <span className="bg-green-100 px-3 py-1 rounded">
                          Fin: {sit.fechaFin}
                        </span>
                      )}
                      {!sit.fechaFin && (
                        <span className="bg-yellow-100 px-3 py-1 rounded">
                          En curso
                        </span>
                      )}
                      {sit.fechaFin && new Date(sit.fechaFin) > new Date() && (
                        <span className="bg-blue-100 px-3 py-1 rounded">
                          Activa
                        </span>
                      )}
                      {sit.fechaFin && new Date(sit.fechaFin) <= new Date() && (
                        <span className="bg-gray-100 px-3 py-1 rounded text-gray-600">
                          Finalizada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay situaciones terapéuticas registradas</p>
            </div>
          )}
        </div>

        {/* Botón de cierre o Acciones de Aprobación */}
        <div className="flex justify-between mt-4 sm:mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded font-semibold shadow hover:bg-gray-600 transition w-full sm:w-auto"
          >
            Cerrar
          </button>

          {(!displayAffiliate.activo) && displayAffiliate.id && (
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusChange('deactivate')}
                disabled={actionLoading}
                className="bg-red-500 text-white px-6 py-2 rounded font-semibold shadow hover:bg-red-600 transition disabled:opacity-50"
              >
                Rechazar
              </button>
              <button
                onClick={() => handleStatusChange('activate')}
                disabled={actionLoading}
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold shadow hover:bg-green-600 transition disabled:opacity-50"
              >
                Aprobar Alta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
