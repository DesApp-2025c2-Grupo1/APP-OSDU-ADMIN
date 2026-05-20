import React, { useState, useEffect } from "react";
import type { Affiliate as AffiliateType } from "./AffiliatesTable";
import { API_BASE_URL, apiFetch } from "../config/api";
import { fetchTherapeuticSituationTypes } from "../api/therapeuticSituationService";

interface Situacion {
  idSituacionAfiliado?: number;
  idSituacion?: number;
  fechaInicio: string;
  fechaFin: string | null;
  situacionTerapeutica?: {
    idSituacion: number;
    nombre: string;
  };
}

interface SituacionDisponible {
  idSituacion: number;
  nombre: string;
}

interface Plan {
  idPlan: number;
  nombre: string;
}

interface EditAffiliatePopupProps {
  affiliate: AffiliateType;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function EditAffiliatePopup({ affiliate, onClose, onSave }: EditAffiliatePopupProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    direccion: "",
    idPlan: 0,
  });

  const [telefonos, setTelefonos] = useState<Array<{ idTelefono?: number; telefono: string }>>([]);
  const [emails, setEmails] = useState<Array<{ idEmail?: number; email: string }>>([]);
  const [situaciones, setSituaciones] = useState<Situacion[]>([]);

  const [telefonosEliminados, setTelefonosEliminados] = useState<number[]>([]);
  const [emailsEliminados, setEmailsEliminados] = useState<number[]>([]);
  const [situacionesEliminadas, setSituacionesEliminadas] = useState<number[]>([]);

  const [situacionesDisponibles, setSituacionesDisponibles] = useState<SituacionDisponible[]>([]);
  const [planesDisponibles, setPlanesDisponibles] = useState<Plan[]>([]);

  // Cargar datos del afiliado, situaciones y planes disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);


        // Cargar datos del afiliado
        const [affiliateRes, situacionesData, planesRes] = await Promise.all([
          apiFetch(`${API_BASE_URL}/affiliates/affiliate/${affiliate.dni}`),
          fetchTherapeuticSituationTypes(),
          apiFetch(`${API_BASE_URL}/plans`)
        ]);

        if (!affiliateRes.ok) throw new Error("Error al cargar datos del afiliado");
        if (!planesRes.ok) throw new Error("Error al cargar planes");

        const affiliateData = await affiliateRes.json();
        const planesData = await planesRes.json();

        // El endpoint puede devolver el afiliado directamente o dentro de un objeto
        const aff = affiliateData.affiliate || affiliateData.affiliates || affiliateData;

        if (!aff || !aff.dni) {
          throw new Error("No se encontraron datos del afiliado");
        }

        // ✅ Manejar el plan correctamente (puede ser null, objeto, o número)
        let planId = 0;
        if (aff.plan) {
          if (typeof aff.plan === 'object' && aff.plan.idPlan) {
            planId = aff.plan.idPlan;
          } else if (typeof aff.plan === 'number') {
            planId = aff.plan;
          }
        }

        setFormData({
          nombre: aff.nombre || "",
          apellido: aff.apellido || "",
          fechaNacimiento: aff.fecha_nacimiento || "",
          direccion: aff.direccion || "",
          idPlan: planId,
        });

        // ✅ Teléfonos
        setTelefonos(
          aff.telefonos && aff.telefonos.length > 0
            ? aff.telefonos.map((t: any) => ({ idTelefono: t.idTelefono, telefono: t.telefono }))
            : [{ telefono: "" }]
        );

        // ✅ Emails
        setEmails(
          aff.email && aff.email.length > 0
            ? aff.email.map((e: any) => ({ idEmail: e.idEmail, email: e.email }))
            : [{ email: "" }]
        );

        // ✅ Situaciones terapéuticas
        setSituaciones(aff.situaciones || []);

        setSituacionesDisponibles(situacionesData);
        setPlanesDisponibles(planesData.plans || []);

      } catch (error) {
        alert(`Error al cargar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [affiliate.dni]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "idPlan" ? parseInt(value) : value }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.trim().length < 2 || formData.nombre.trim().length > 50) {
      newErrors.nombre = "El nombre debe tener entre 2 y 50 caracteres";
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio";
    } else if (formData.apellido.trim().length < 2 || formData.apellido.trim().length > 50) {
      newErrors.apellido = "El apellido debe tener entre 2 y 50 caracteres";
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const partes = formData.fechaNacimiento.split('/');
      if (partes.length === 3) {
        const fecha = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        const hoy = new Date();
        if (fecha > hoy) {
          newErrors.fechaNacimiento = "La fecha no puede ser futura";
        }
      }
    }

    // Validar plan
    if (!formData.idPlan || formData.idPlan === 0) {
      newErrors.idPlan = "Debe seleccionar un plan";
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emails.forEach((mail, idx) => {
      if (mail.email && !emailRegex.test(mail.email)) {
        newErrors[`email${idx}`] = "Formato de email inválido";
      }
    });

    // Validar teléfonos
    telefonos.forEach((tel, idx) => {
      if (tel.telefono && !/^[0-9]{7,15}$/.test(tel.telefono.replace(/\s/g, ''))) {
        newErrors[`telefono${idx}`] = "El teléfono debe tener entre 7 y 15 dígitos";
      }
    });

    // Si hay errores, mostrarlos y no continuar
    if (Object.keys(newErrors).length > 0) {
      alert("Por favor corrija los errores antes de guardar:\n" + Object.values(newErrors).join('\n'));
      return;
    }

    // Si no hay errores, proceder con el guardado
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      fecha_nacimiento: formData.fechaNacimiento,
      direccion: formData.direccion,
      idPlan: formData.idPlan,
      telefonos: telefonos.filter(t => t.telefono.trim() !== ""),
      emails: emails.filter(e => e.email.trim() !== ""),
      situaciones: situaciones.map(s => ({
        idSituacionAfiliado: s.idSituacionAfiliado,
        idSituacion: s.idSituacion || s.situacionTerapeutica?.idSituacion,
        fechaInicio: s.fechaInicio,
        fechaFin: s.fechaFin
      })),
      telefonosEliminados,
      emailsEliminados,
      situacionesEliminadas
    };

    onSave(payload);
  };

  // TELÉFONOS
  const addTelefono = () => setTelefonos(prev => [...prev, { telefono: "" }]);
  const removeTelefono = (idx: number) => {
    const tel = telefonos[idx];
    if (tel.idTelefono) {
      setTelefonosEliminados(prev => [...prev, tel.idTelefono!]);
    }
    setTelefonos(prev => prev.filter((_, i) => i !== idx));
  };
  const updateTelefono = (idx: number, value: string) => {
    setTelefonos(prev => prev.map((t, i) => (i === idx ? { ...t, telefono: value } : t)));
  };

  // EMAILS
  const addEmail = () => setEmails(prev => [...prev, { email: "" }]);
  const removeEmail = (idx: number) => {
    const mail = emails[idx];
    if (mail.idEmail) {
      setEmailsEliminados(prev => [...prev, mail.idEmail!]);
    }
    setEmails(prev => prev.filter((_, i) => i !== idx));
  };
  const updateEmail = (idx: number, value: string) => {
    setEmails(prev => prev.map((e, i) => (i === idx ? { ...e, email: value } : e)));
  };

  // SITUACIONES
  const addSituacion = () => {
    if (situacionesDisponibles.length === 0) return;

    const primeraSituacion = situacionesDisponibles[0];
    const hoy = new Date().toISOString().split('T')[0].split('-').reverse().join('/');

    setSituaciones(prev => [...prev, {
      idSituacion: primeraSituacion.idSituacion,
      fechaInicio: hoy,
      fechaFin: null,
      situacionTerapeutica: {
        idSituacion: primeraSituacion.idSituacion,
        nombre: primeraSituacion.nombre
      }
    }]);
  };

  const removeSituacion = (idx: number) => {
    const sit = situaciones[idx];

    if (sit.idSituacionAfiliado) {
      setSituacionesEliminadas(prev => {
        const newList = [...prev, sit.idSituacionAfiliado!];
        return newList;
      });
    }

    setSituaciones(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSituacion = (idx: number, field: string, value: any) => {

    setSituaciones(prev => prev.map((s, i) => {
      if (i !== idx) return s;

      if (field === "idSituacion") {
        const sitSelected = situacionesDisponibles.find(sd => sd.idSituacion === parseInt(value));

        return {
          ...s,
          idSituacion: parseInt(value),
          situacionTerapeutica: sitSelected ? {
            idSituacion: sitSelected.idSituacion,
            nombre: sitSelected.nombre
          } : s.situacionTerapeutica
        };
      }

      return { ...s, [field]: value };
    }));
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

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl my-8 p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-600 text-2xl hover:text-gray-800 z-10"
        >
          ✕
        </button>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pr-8">Editar Afiliado</h1>

        {/* DATOS BÁSICOS */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#14B8A6] text-base sm:text-lg font-semibold mb-3 sm:mb-4 border-b-2 border-[#14B8A6] pb-1">
            Datos Básicos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">DNI (*)</label>
              <input
                type="text"
                value={affiliate.dni}
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                readOnly
                title="Campo no editable"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Credencial (*)</label>
              <input
                type="text"
                value={affiliate.credencial}
                className="p-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Nombres (*)</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Apellidos (*)</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Fecha nacimiento (*)</label>
              <input
                type="date"
                value={formData.fechaNacimiento ? (formData.fechaNacimiento.includes('/') ? formData.fechaNacimiento.split('/').reverse().join('-') : formData.fechaNacimiento) : ''}
                onChange={(e) => {
                  const date = e.target.value.split('-').reverse().join('/');
                  setFormData(prev => ({ ...prev, fechaNacimiento: date }));
                }}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Plan Médico (*)</label>
              <select
                name="idPlan"
                value={formData.idPlan}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value={0}>Seleccionar plan</option>
                {planesDisponibles.map(plan => (
                  <option key={plan.idPlan} value={plan.idPlan}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label className="font-semibold mb-1 bg-gray-100 px-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#14B8A6] text-lg font-semibold mb-4 border-b-2 border-[#14B8A6] pb-1">
            Datos de Contacto
          </h2>

          {/* Teléfonos */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">Teléfonos</label>
            {telefonos.map((tel, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="tel"
                  value={tel.telefono}
                  onChange={(e) => updateTelefono(i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="Ej: 1145678901"
                />
                <button
                  type="button"
                  onClick={() => removeTelefono(i)}
                  className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTelefono}
              className="text-sm text-[#14B8A6] font-semibold hover:underline"
            >
              + Agregar teléfono
            </button>
          </div>

          {/* Emails */}
          <div>
            <label className="font-semibold mb-2 block">Emails</label>
            {emails.map((mail, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={mail.email}
                  onChange={(e) => updateEmail(i, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="ejemplo@email.com"
                />
                <button
                  type="button"
                  onClick={() => removeEmail(i)}
                  className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEmail}
              className="text-sm text-[#14B8A6] font-semibold hover:underline"
            >
              + Agregar email
            </button>
          </div>
        </div>

        {/* SITUACIONES TERAPÉUTICAS */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-[#14B8A6] text-lg font-semibold mb-4 border-b-2 border-[#14B8A6] pb-1">
            Situaciones Terapéuticas
          </h2>

          <div className="space-y-3">
            {situaciones.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay situaciones terapéuticas registradas
              </p>
            )}

            {situaciones.map((sit, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-gray-50 p-3 rounded">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Situación</label>
                  <select
                    value={sit.idSituacion || sit.situacionTerapeutica?.idSituacion || ""}
                    onChange={(e) => updateSituacion(idx, "idSituacion", e.target.value)}
                    className="p-2 border border-gray-300 rounded text-sm"
                  >
                    {situacionesDisponibles.map(sd => (
                      <option key={sd.idSituacion} value={sd.idSituacion}>
                        {sd.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={sit.fechaInicio ? (sit.fechaInicio.includes('/') ? sit.fechaInicio.split('/').reverse().join('-') : sit.fechaInicio) : ''}
                    onChange={(e) => {
                      const date = e.target.value.split('-').reverse().join('/');
                      updateSituacion(idx, "fechaInicio", date);
                    }}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex flex-col flex-1">
                    <label className="text-xs font-semibold mb-1">Fecha Fin (opcional)</label>
                    <input
                      type="date"
                      value={sit.fechaFin ? (sit.fechaFin.includes('/') ? sit.fechaFin.split('/').reverse().join('-') : sit.fechaFin) : ''}
                      onChange={(e) => {
                        const date = e.target.value ? e.target.value.split('-').reverse().join('/') : null;
                        updateSituacion(idx, "fechaFin", date);
                      }}
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSituacion(idx)}
                    className="px-3 py-2 border rounded hover:bg-red-50 text-red-500 font-semibold"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSituacion}
            className="mt-3 text-sm text-[#14B8A6] font-semibold hover:underline"
            disabled={situacionesDisponibles.length === 0}
          >
            + Agregar situación terapéutica
          </button>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={handleSave}
            className="bg-[#14B8A6] text-white px-6 py-2 sm:py-3 rounded font-semibold shadow hover:bg-teal-700 transition w-full sm:w-auto order-2 sm:order-1"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 sm:py-3 rounded font-semibold shadow hover:bg-gray-600 transition w-full sm:w-auto order-1 sm:order-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
