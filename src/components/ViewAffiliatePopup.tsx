import React from "react";

interface Situacion {
  situacion: string;
  fechaFinalizacion: string;
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
  plan?: Plan | string | number;
  planMedico?: string;
  tipoDocumento?: string;
  parentesco?: string;
  situaciones?: Situacion[];
  telefono?: string | Telefono[];
  email?: string | Email[];
  direccion?: string;
}

interface ViewAffiliatePopupProps {
  affiliate: AffiliateType;
  onClose: () => void;
}

export function ViewAffiliatePopup({ affiliate, onClose }: ViewAffiliatePopupProps) {
  const determinarParentesco = (affiliate: AffiliateType) => {
    if (affiliate.parentesco) return affiliate.parentesco;

    const partesCredencial = affiliate.credencial.split("-");
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
  const obtenerEmails = (email?: string | Email[]): string[] => {
    if (!email) return [];
    if (typeof email === 'string') return [email];
    return email.map(e => e.email);
  };

  // Helper para obtener teléfonos como array de strings
  const obtenerTelefonos = (telefono?: string | Telefono[]): string[] => {
    if (!telefono) return [];
    if (typeof telefono === 'string') return [telefono];
    return telefono.map(t => t.telefono);
  };

  const emails = obtenerEmails(affiliate.email);
  const telefonos = obtenerTelefonos(affiliate.telefono);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Detalles del Afiliado</h1>

        {/* Datos de Afiliado */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Datos de Afiliado
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {affiliate.tipoDocumento && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Tipo Documento</label>
                <p className="p-2 border border-gray-200 rounded">{affiliate.tipoDocumento}</p>
              </div>
            )}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nro Documento</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.nroDocumento || affiliate.dni || '-'}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Nombres</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.nombre}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Apellidos</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.apellido}</p>
            </div>
            {affiliate.fechaNacimiento && (
              <div>
                <label className="font-semibold mb-1 bg-gray-100 px-2 block">Fecha nacimiento</label>
                <p className="p-2 border border-gray-200 rounded">{affiliate.fechaNacimiento}</p>
              </div>
            )}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Plan Médico</label>
              <p className="p-2 border border-gray-200 rounded">
                {obtenerNombrePlan(affiliate.plan, affiliate.planMedico)}
              </p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Parentesco</label>
              <p className="p-2 border border-gray-200 rounded">{determinarParentesco(affiliate)}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2 block">Credencial</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.credencial}</p>
            </div>
          </div>
        </div>

        {/* Datos de Contacto */}
        {(telefonos.length > 0 || emails.length > 0 || affiliate.direccion) && (
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
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
              {affiliate.direccion && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold mb-1 bg-gray-100 px-2 block">Dirección</label>
                  <p className="p-2 border border-gray-200 rounded">{affiliate.direccion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Situaciones */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#5FA92C] text-lg font-semibold mb-4 border-b-2 border-[#5FA92C] pb-1">
            Situaciones Terapéuticas
          </h2>

          {affiliate.situaciones && affiliate.situaciones.length > 0 ? (
            <ul className="space-y-2">
              {affiliate.situaciones.map((sit, idx) => (
                <li
                  key={idx}
                  className="p-3 border border-gray-300 rounded bg-gray-50 flex flex-col sm:flex-row sm:justify-between gap-2"
                >
                  <span className="font-medium">{sit.situacion}</span>
                  {sit.fechaFinalizacion && (
                    <span className="text-gray-600 text-sm">
                      Finaliza: {sit.fechaFinalizacion}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay situaciones registradas</p>
          )}
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-gray-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}