import React from "react";
import type { Affiliate as AffiliateType } from "./AffiliatesTable";

interface ViewAffiliatePopupProps {
  affiliate: AffiliateType;
  onClose: () => void;
}

export function ViewAffiliatePopup({ affiliate, onClose }: ViewAffiliatePopupProps) {
  // Función para determinar el parentesco (la misma que usas en GrupoFamiliar)
  const determinarParentesco = (affiliate: AffiliateType) => {
    if (affiliate.parentesco) return affiliate.parentesco;
    
    const partesCredencial = affiliate.credencial.split('-');
    if (partesCredencial.length !== 2) return "Familiar a cargo";
    
    const numeroCredencial = parseInt(partesCredencial[1]);
    
    switch(numeroCredencial) {
      case 1: return "Titular";
      case 2: return "Cónyuge";
      case 3: 
      case 4: 
      case 5: return "Hijo";
      default: return "Familiar a cargo";
    }
  };

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Tipo Documento</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.tipoDocumento}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nro Documento</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.nroDocumento || affiliate.dni}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombres</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.nombre}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Apellidos</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.apellido}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Fecha nacimiento</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.fechaNacimiento}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Plan Médico</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.planMedico || affiliate.plan}</p>
            </div>
            {/* NUEVO CAMPO PARENTESCO */}
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Parentesco</label>
              <p className="p-2 border border-gray-200 rounded">{determinarParentesco(affiliate)}</p>
            </div>
            <div>
              <label className="font-semibold mb-1 bg-gray-100 px-2">Credencial</label>
              <p className="p-2 border border-gray-200 rounded">{affiliate.credencial}</p>
            </div>
          </div>
        </div>

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
                  className="p-2 border border-gray-300 rounded bg-gray-50 flex justify-between"
                >
                  <span>{sit.situacion}</span>
                  <span className="text-gray-600">{sit.fechaFinalizacion}</span>
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