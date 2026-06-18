import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiFetch } from "../config/api";
import { fetchPlans, type Plan } from "../api/planService";
import AltaProgramadaPopup from "../components/AltaProgramadaPopup";
import { fetchGeorefLocalities, fetchGeorefProvinces, type GeorefLocality, type GeorefProvince } from "../api/georefService";
import { fetchTherapeuticSituationTypes } from "../api/therapeuticSituationService";
import { useModalPresence } from "../context/ModalContext";
import { validateBirthDate, validateDocument, validatePersonName } from "../utils/affiliateValidation";

interface Situacion {
  idSituacion: number;
  fechaFinalizacion: string;
}

interface SituacionDisponible {
  idSituacion: number;
  nombre: string;
}

interface Familiar {
  tipoDocumento: string;
  nroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  parentesco: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  direccion2?: string;
  usaDireccionTitular?: boolean;
  usaContactoTitular?: boolean;
  situaciones?: Array<{ idSituacion: number; fechaFinalizacion: string }>;
}

export function AddAffiliate() {
  const navigate = useNavigate();
  const [showAltaPopup, setShowAltaPopup] = useState(false);
  useModalPresence("add-affiliate-modals", showAltaPopup);

  const [formData, setFormData] = useState({
    tipoDocumento: "DNI",
    nroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    planMedico: "1",
    credencial: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    direccion2: "",
    provincia: "",
    localidad: "",
  });

  const [showPhone2, setShowPhone2] = useState(false);
  const [showEmail2, setShowEmail2] = useState(false);
  const [situaciones, setSituaciones] = useState<Situacion[]>([]);
  const [situacionesDisponibles, setSituacionesDisponibles] = useState<SituacionDisponible[]>([]);
  const [loadingSituaciones, setLoadingSituaciones] = useState(true);
  const [planesDisponibles, setPlanesDisponibles] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [provincias, setProvincias] = useState<GeorefProvince[]>([]);
  const [localidadesPorProvincia, setLocalidadesPorProvincia] = useState<Record<string, GeorefLocality[]>>({});
  const [loadingGeoref, setLoadingGeoref] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState<Record<string, boolean>>({});
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar situaciones terapéuticas y planes desde la BD al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar situaciones terapéuticas
        setLoadingSituaciones(true);
        const situacionesData = await fetchTherapeuticSituationTypes();
        setSituacionesDisponibles(situacionesData);
        setErrors(prev => ({ ...prev, situaciones: "" }));
      } catch (error) {
        setErrors(prev => ({ ...prev, situaciones: "No se pudieron cargar las situaciones terapéuticas" }));
      } finally {
        setLoadingSituaciones(false);
      }

      try {
        // Cargar planes
        setLoadingPlanes(true);
        const planes = await fetchPlans();
        setPlanesDisponibles(planes);
      } catch (error) {
        setErrors(prev => ({ ...prev, planes: "No se pudieron cargar los planes médicos" }));
      } finally {
        setLoadingPlanes(false);
      }

      try {
        setLoadingGeoref(true);
        const provinciasData = await fetchGeorefProvinces();
        setProvincias(provinciasData);
      } catch (error) {
        setErrors(prev => ({ ...prev, georef: "No se pudieron cargar las provincias" }));
      } finally {
        setLoadingGeoref(false);
      }
    };

    fetchData();
  }, []);

  const normalizeGeorefName = (value?: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase("es-AR");

  const getProvinciaId = (provinciaNombre?: string) =>
    provincias.find((provincia) => {
      const provinceName = normalizeGeorefName(provincia.nombre);
      const selectedName = normalizeGeorefName(provinciaNombre);

      return provinceName === selectedName
        || (provincia.id === "02" && ["caba", "ciudad de buenos aires", "capital federal"].includes(selectedName));
    })?.id || "";

  const cargarLocalidades = async (provinciaId: string) => {
    if (!provinciaId || localidadesPorProvincia[provinciaId] || loadingLocalidades[provinciaId]) return;

    setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: true }));
    try {
      const localidades = await fetchGeorefLocalities(provinciaId);
      setLocalidadesPorProvincia((prev) => ({ ...prev, [provinciaId]: localidades }));
      setErrors((prev) => ({ ...prev, georef: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, georef: "No se pudieron cargar las localidades" }));
    } finally {
      setLoadingLocalidades((prev) => ({ ...prev, [provinciaId]: false }));
    }
  };

  const handleProvinciaChange = (provinciaId: string) => {
    const provincia = provincias.find((item) => item.id === provinciaId);
    setFormData((prev) => ({
      ...prev,
      provincia: provincia?.nombre || "",
      localidad: "",
    }));
    void cargarLocalidades(provinciaId);
    setErrors((prev) => ({ ...prev, provincia: "", localidad: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSituacion = () => {
    if (situacionesDisponibles.length === 0) {
      console.warn("No hay situaciones terapéuticas disponibles");
      setErrors(prev => ({ ...prev, situaciones: "No hay situaciones terapéuticas disponibles. Verifique la conexión con el servidor." }));
      return;
    }
    setSituaciones((prev) => [...prev, { idSituacion: situacionesDisponibles[0].idSituacion, fechaFinalizacion: "" }]);
  };

  const removeSituacion = (idx: number) =>
    setSituaciones((prev) => prev.filter((_, i) => i !== idx));

  const updateSituacion = (idx: number, field: keyof Situacion, value: string | number) => {
    setSituaciones((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const agregarFamiliar = () => {
    const nuevoFamiliar: Familiar = {
      tipoDocumento: "DNI",
      nroDocumento: "",
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      parentesco: "Hijo",
      telefono: "",
      email: "",
      usaDireccionTitular: true,
      usaContactoTitular: false,
      situaciones: [],
    };
    setFamiliares((prev) => [...prev, nuevoFamiliar]);
  };

  const eliminarFamiliar = (posicion: number) => {
    setFamiliares((prev) => prev.filter((_, i) => i !== posicion));
  };

  const cambiarDatoFamiliar = (posicion: number, campo: keyof Familiar, valor: any) => {
    setFamiliares((prev) => {
      const next = [...prev];
      next[posicion] = { ...next[posicion], [campo]: valor };
      return next;
    });
  };

  const addSituacionFamiliar = (i: number) => {
    if (situacionesDisponibles.length === 0) return;
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = next[i].situaciones || [];
      next[i] = { ...next[i], situaciones: [...sit, { idSituacion: situacionesDisponibles[0].idSituacion, fechaFinalizacion: "" }] };
      return next;
    });
  };

  const updateSituacionFamiliar = (
    i: number,
    idx: number,
    field: "idSituacion" | "fechaFinalizacion",
    value: string | number
  ) => {
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = [...(next[i].situaciones || [])];
      sit[idx] = { ...sit[idx], [field]: field === "idSituacion" ? parseInt(value as string) : value };
      next[i] = { ...next[i], situaciones: sit };
      return next;
    });
  };

  const removeSituacionFamiliar = (i: number, idx: number) => {
    setFamiliares((prev) => {
      const next = [...prev];
      const sit = (next[i].situaciones || []).filter((_, k) => k !== idx);
      next[i] = { ...next[i], situaciones: sit };
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const docErr = validateDocument(formData.tipoDocumento, formData.nroDocumento);
    if (docErr) newErrors.nroDocumento = docErr;

    const nombreErr = validatePersonName(formData.nombre, "nombre");
    if (nombreErr) newErrors.nombre = nombreErr;

    const apellidoErr = validatePersonName(formData.apellido, "apellido");
    if (apellidoErr) newErrors.apellido = apellidoErr;

    const fechaErr = validateBirthDate(formData.fechaNacimiento);
    if (fechaErr) newErrors.fechaNacimiento = fechaErr;

    // Emails del titular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }
    if (formData.email2 && !emailRegex.test(formData.email2)) {
      newErrors.email2 = "Formato de email inválido";
    }

    // Teléfonos del titular
    if (!formData.telefono?.trim()) {
      newErrors.telefono = "Requerido";
    } else if (!/^[0-9]{7,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos";
    }
    if (formData.telefono2 && !/^[0-9]{7,15}$/.test(formData.telefono2.replace(/\s/g, ''))) {
      newErrors.telefono2 = "El teléfono debe tener entre 7 y 15 dígitos";
    }

    // Plan del titular
    if (!formData.planMedico) {
      newErrors.planMedico = "Requerido";
    }

    // Dirección del titular (opcional pero con límite)
    if (formData.direccion && formData.direccion.length > 100) {
      newErrors.direccion = "La dirección no puede superar los 100 caracteres";
    }

    // Validaciones de familiares
    familiares.forEach((f, index) => {
      const prefix = `familiares[${index}]`;

      const familiarDocErr = validateDocument(f.tipoDocumento, f.nroDocumento);
      if (familiarDocErr) newErrors[`${prefix}.nroDocumento`] = familiarDocErr;

      const familiarNombreErr = validatePersonName(f.nombre, "nombre");
      if (familiarNombreErr) newErrors[`${prefix}.nombre`] = familiarNombreErr;

      const familiarApellidoErr = validatePersonName(f.apellido, "apellido");
      if (familiarApellidoErr) newErrors[`${prefix}.apellido`] = familiarApellidoErr;

      const familiarFechaErr = validateBirthDate(f.fechaNacimiento);
      if (familiarFechaErr) newErrors[`${prefix}.fechaNacimiento`] = familiarFechaErr;

      // Email del familiar
      if (!f.usaContactoTitular) {
        // Si no usa contacto del titular, debe proveer su propio email
        if (!f.email?.trim()) {
          newErrors[`${prefix}.email`] = "Requerido";
        } else if (!emailRegex.test(f.email)) {
          newErrors[`${prefix}.email`] = "Formato de email inválido";
        }
      }

      // Teléfono del familiar
      if (!f.usaContactoTitular) {
        // Si no usa contacto del titular, debe proveer su propio teléfono
        if (!f.telefono?.trim()) {
          newErrors[`${prefix}.telefono`] = "Requerido";
        } else if (!/^[0-9]{7,15}$/.test(f.telefono.replace(/\s/g, ''))) {
          newErrors[`${prefix}.telefono`] = "El teléfono debe tener entre 7 y 15 dígitos";
        }
      }

      // Validar que el DNI del familiar no sea igual al del titular
      if (f.nroDocumento === formData.nroDocumento) {
        newErrors[`${prefix}.nroDocumento`] = "El DNI del familiar no puede ser igual al del titular";
      }

      // Validar que no haya DNIs duplicados entre familiares
      const duplicados = familiares.filter((fam, idx) =>
        idx !== index && fam.nroDocumento === f.nroDocumento
      );
      if (duplicados.length > 0 && f.nroDocumento) {
        newErrors[`${prefix}.nroDocumento`] = "Este DNI ya está en uso por otro familiar";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const buildFormData = (altaProgramadaEn?: string) => {
    const familyGroup = familiares.map(f => ({
      nombreCompleto: `${f.nombre.trim()} ${f.apellido.trim()}`,
      parentesco: f.parentesco,
      nroDocumento: f.nroDocumento,
      tipoDocumento: f.tipoDocumento,
      fechaNacimiento: f.fechaNacimiento,
      nombre: f.nombre.trim(),
      apellido: f.apellido.trim(),
      email: f.usaContactoTitular ? formData.email.trim() : f.email?.trim(),
      telefono: f.usaContactoTitular ? formData.telefono.trim() : f.telefono?.trim(),
      direccion: f.usaDireccionTitular ? formData.direccion.trim() : f.direccion?.trim(),
      localidad: f.usaDireccionTitular ? formData.localidad.trim() : undefined,
      provincia: f.usaDireccionTitular ? formData.provincia.trim() : undefined,
      situaciones: (f.situaciones || []).map(s => ({
        id: s.idSituacion,
        fechaFin: s.fechaFinalizacion || null,
      })),
    }));

    const normalizedSituations = situaciones.map(s => ({
      id: s.idSituacion,
      fechaFin: s.fechaFinalizacion || null,
    }));

    const fd = new FormData();
    fd.append('nroDocumento', formData.nroDocumento);
    fd.append('nombre', formData.nombre.trim());
    fd.append('apellido', formData.apellido.trim());
    fd.append('tipoDocumento', formData.tipoDocumento);
    fd.append('fechaNacimiento', formData.fechaNacimiento);
    fd.append('idPlan', formData.planMedico);
    fd.append('email', formData.email.trim());
    fd.append('telefono', formData.telefono.trim());
    if (formData.direccion?.trim()) fd.append('direccion', formData.direccion.trim());
    if (formData.localidad?.trim()) fd.append('localidad', formData.localidad.trim());
    if (formData.provincia?.trim()) fd.append('provincia', formData.provincia.trim());
    if (normalizedSituations.length > 0) fd.append('situaciones', JSON.stringify(normalizedSituations));
    if (familyGroup.length > 0) fd.append('grupoFamiliar', JSON.stringify(familyGroup));
    if (altaProgramadaEn) fd.append('altaProgramadaEn', altaProgramadaEn);
    return fd;
  };

  const handleProgramarAlta = async (fechaAltaISO: string) => {
    if (!validate()) {
      setShowAltaPopup(false);
      return;
    }

    setLoading(true);
    setSuccess(null);
    setShowAltaPopup(false);

    try {
      const response = await apiFetch(`${API_BASE_URL}/affiliates`, {
        method: "POST",
        body: buildFormData(fechaAltaISO),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setLoading(false);
      setSuccess("Afiliado programado exitosamente para alta futura");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Error al programar. Verifica la conexión con el servidor."
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);

    try {
      const response = await apiFetch(`${API_BASE_URL}/affiliates`, {
        method: "POST",
        body: buildFormData(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setLoading(false);
      setSuccess("Afiliado y familiares creados con éxito");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setLoading(false);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Error al guardar. Verifica la conexión con el servidor."
      }));
    }
  };

  return (
    <div className="p-4 sm:p-8">
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Crear nuevo afiliado</h1>
        <p className="text-sm text-slate-400">Completa los datos del afiliado titular</p>
      </div>

      {loadingSituaciones && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-center">
          <p className="text-blue-600">Cargando situaciones terapéuticas...</p>
        </div>
      )}

      {errors.situaciones && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
          <p className="text-yellow-600">{errors.situaciones}</p>
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* DATOS DE AFILIADO (Titular) */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Tipo Documento</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Nro Documento *</label>
              <input
                type="text"
                name="nroDocumento"
                value={formData.nroDocumento}
                onChange={handleInputChange}
                placeholder="12345678"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.nroDocumento && (
                <p className="text-red-500 text-sm mt-1">{errors.nroDocumento}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Nombres *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Juan"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Apellidos *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Pérez"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Fecha de nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.fechaNacimiento && (
                <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Plan Médico *</label>
              <select
                name="planMedico"
                value={formData.planMedico}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                disabled={loadingPlanes}
              >
                <option value="">-- Seleccionar --</option>
                {planesDisponibles.map(plan => (
                  <option key={plan.idPlan} value={plan.idPlan}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
              {errors.planMedico && (
                <p className="text-red-500 text-sm mt-1">{errors.planMedico}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Calle Principal 123"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Provincia</label>
              <select
                value={getProvinciaId(formData.provincia)}
                onChange={(e) => handleProvinciaChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                disabled={loadingGeoref}
              >
                <option value="">{loadingGeoref ? "Cargando provincias..." : "Seleccionar provincia"}</option>
                {provincias.map((provincia) => (
                  <option key={provincia.id} value={provincia.id}>
                    {provincia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-600 text-slate-600 mb-2">Localidad</label>
              <select
                value={formData.localidad}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, localidad: e.target.value }));
                  setErrors((prev) => ({ ...prev, localidad: "" }));
                }}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                disabled={!getProvinciaId(formData.provincia) || Boolean(loadingLocalidades[getProvinciaId(formData.provincia)])}
              >
                {(() => {
                  const provinciaId = getProvinciaId(formData.provincia);
                  const localidades = localidadesPorProvincia[provinciaId] || [];
                  const cargando = Boolean(loadingLocalidades[provinciaId]);
                  return (
                    <>
                      <option value="">
                        {!provinciaId
                          ? "Seleccione una provincia primero"
                          : cargando
                            ? "Cargando localidades..."
                            : "Seleccionar localidad"}
                      </option>
                      {localidades.map((localidad) => (
                        <option key={localidad.id} value={localidad.nombre}>
                          {localidad.nombre}
                        </option>
                      ))}
                    </>
                  );
                })()}
              </select>
            </div>
          </div>
          {errors.georef && <p className="text-red-500 text-sm mt-2">{errors.georef}</p>}
        </div>

        {/* DATOS DE CONTACTO */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-600 text-slate-600 mb-2">Teléfono *</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="1234567890"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}

              {showPhone2 && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      name="telefono2"
                      value={formData.telefono2}
                      onChange={handleInputChange}
                      placeholder="Teléfono adicional"
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, telefono2: "" }));
                        setShowPhone2(false);
                      }}
                      className="px-4 py-2.5 border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                  {errors.telefono2 && <p className="text-red-500 text-sm mt-1">{errors.telefono2}</p>}
                </div>
              )}

              {!showPhone2 && (
                <button
                  type="button"
                  onClick={() => setShowPhone2(true)}
                  className="mt-2 text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-500"
                >
                  + Agregar teléfono
                </button>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-600 text-slate-600 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="juan@example.com"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

              {showEmail2 && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      name="email2"
                      value={formData.email2}
                      onChange={handleInputChange}
                      placeholder="Email adicional"
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, email2: "" }));
                        setShowEmail2(false);
                      }}
                      className="px-4 py-2.5 border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                  {errors.email2 && <p className="text-red-500 text-sm mt-1">{errors.email2}</p>}
                </div>
              )}

              {!showEmail2 && (
                <button
                  type="button"
                  onClick={() => setShowEmail2(true)}
                  className="mt-2 text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 font-500"
                >
                  + Agregar email
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SITUACIONES TERAPÉUTICAS (Titular) */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Situaciones terapéuticas</h2>

          <div className="space-y-3">
            {situaciones.length === 0 && (
              <p className="text-sm text-slate-500">No hay situaciones cargadas.</p>
            )}

            {situaciones.map((s, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end p-4 border border-slate-200 rounded-lg bg-slate-50"
              >
                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Situación terapéutica</label>
                  <select
                    value={s.idSituacion}
                    onChange={(e) => updateSituacion(idx, "idSituacion", parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                    disabled={loadingSituaciones}
                  >
                    <option value="">-- Seleccionar --</option>
                    {situacionesDisponibles.map(sit => (
                      <option key={sit.idSituacion} value={sit.idSituacion}>
                        {sit.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Fecha de finalización (opcional)</label>
                  <input
                    type="date"
                    value={s.fechaFinalizacion || ""}
                    onChange={(e) => updateSituacion(idx, "fechaFinalizacion", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => removeSituacion(idx)}
                    className="px-3 py-2.5 text-xs font-600 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSituacion}
              className="px-4 py-2 text-xs font-600 text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
              disabled={loadingSituaciones || situacionesDisponibles.length === 0}
            >
              + Agregar situación
            </button>
          </div>
        </div>

        {/* FAMILIARES A CARGO */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Familiares a cargo</h2>

          {familiares.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">No hay familiares agregados.</p>
          )}

          {familiares.map((familiar, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-600 text-slate-800">Familiar {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => eliminarFamiliar(i)}
                  className="text-xs font-600 text-red-600 hover:text-red-800 transition-colors"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Tipo Documento</label>
                  <select
                    value={familiar.tipoDocumento}
                    onChange={(e) => cambiarDatoFamiliar(i, "tipoDocumento", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Nro Documento *</label>
                  <input
                    type="text"
                    value={familiar.nroDocumento}
                    onChange={(e) => cambiarDatoFamiliar(i, "nroDocumento", e.target.value)}
                    placeholder="12345678"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  {errors[`familiares[${i}].nroDocumento`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].nroDocumento`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Nombres *</label>
                  <input
                    type="text"
                    value={familiar.nombre}
                    onChange={(e) => cambiarDatoFamiliar(i, "nombre", e.target.value)}
                    placeholder="Juan"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  {errors[`familiares[${i}].nombre`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].nombre`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Apellidos *</label>
                  <input
                    type="text"
                    value={familiar.apellido}
                    onChange={(e) => cambiarDatoFamiliar(i, "apellido", e.target.value)}
                    placeholder="Pérez"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                  />
                  {errors[`familiares[${i}].apellido`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].apellido`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Fecha Nacimiento *</label>
                  <input
                    type="date"
                    value={familiar.fechaNacimiento}
                    onChange={(e) => cambiarDatoFamiliar(i, "fechaNacimiento", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                  />
                  {errors[`familiares[${i}].fechaNacimiento`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].fechaNacimiento`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-600 mb-2">Parentesco</label>
                  <select
                    value={familiar.parentesco}
                    onChange={(e) => cambiarDatoFamiliar(i, "parentesco", e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700"
                  >
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Hijo">Hijo</option>
                    <option value="Hija">Hija</option>
                    <option value="Familiar a cargo">Familiar a cargo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-600 text-slate-600 mb-3">
                    <input
                      type="checkbox"
                      checked={familiar.usaDireccionTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaDireccionTitular", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    Usar dirección del titular
                  </label>
                  {!familiar.usaDireccionTitular && (
                    <input
                      type="text"
                      value={familiar.direccion || ""}
                      onChange={(e) => cambiarDatoFamiliar(i, "direccion", e.target.value)}
                      placeholder="Dirección del familiar"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-600 text-slate-600 mb-3">
                    <input
                      type="checkbox"
                      checked={familiar.usaContactoTitular}
                      onChange={(e) => cambiarDatoFamiliar(i, "usaContactoTitular", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    Usar contacto del titular
                  </label>
                  {!familiar.usaContactoTitular && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-600 text-slate-600 mb-2">Email *</label>
                        <input
                          type="email"
                          value={familiar.email || ""}
                          onChange={(e) => cambiarDatoFamiliar(i, "email", e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                        />
                        {errors[`familiares[${i}].email`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].email`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-600 text-slate-600 mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          value={familiar.telefono || ""}
                          onChange={(e) => cambiarDatoFamiliar(i, "telefono", e.target.value)}
                          placeholder="1234567890"
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400"
                        />
                        {errors[`familiares[${i}].telefono`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`familiares[${i}].telefono`]}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {(familiar.situaciones && familiar.situaciones.length > 0) && (
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-600 text-slate-600 mb-3">Situaciones terapéuticas del familiar</h4>
                    {familiar.situaciones.map((s, sIdx) => (
                      <div key={sIdx} className="mb-3 p-3 bg-white rounded border border-slate-200 flex items-end gap-2">
                        <select
                          value={s.idSituacion}
                          onChange={(e) => updateSituacionFamiliar(i, sIdx, "idSituacion", parseInt(e.target.value))}
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        >
                          <option value="">-- Seleccionar --</option>
                          {situacionesDisponibles.map(sit => (
                            <option key={sit.idSituacion} value={sit.idSituacion}>
                              {sit.nombre}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={s.fechaFinalizacion || ""}
                          onChange={(e) => updateSituacionFamiliar(i, sIdx, "fechaFinalizacion", e.target.value)}
                          className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeSituacionFamiliar(i, sIdx)}
                          className="px-2 py-2 text-xs font-600 text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSituacionFamiliar(i)}
                      className="text-xs text-teal-600 border border-teal-200 px-2 py-1.5 rounded hover:bg-teal-50 transition-colors"
                    >
                      + Agregar situación
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarFamiliar}
            className="px-4 py-2 text-xs font-600 text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            + Agregar familiar
          </button>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setShowAltaPopup(true)}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-600 px-4 py-2 rounded-xl transition-colors"
          disabled={loading}
        >
          Programar Alta
        </button>
      </div>

      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-center">
          <p className="text-red-600 font-semibold">{errors.submit}</p>
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded text-center">
          <p className="text-teal-600 font-semibold">{success}</p>
        </div>
      )}

      {showAltaPopup && (
        <AltaProgramadaPopup
          isOpen={showAltaPopup}
          onClose={() => setShowAltaPopup(false)}
          onConfirm={handleProgramarAlta}
        />
      )}
    </div>
    </div>
  );
}
