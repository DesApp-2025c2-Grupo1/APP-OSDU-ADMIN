import type { PrestadorTipo, LugarAtencion, Especialidad } from "../model/Provider.model";

export type ProviderValidationPayload = {
  cuitCuil?: string;
  nombreCompleto?: string;
  tipoPrestador?: PrestadorTipo | "";
  mails?: string[];
  telefonos?: string[];
  especialidades?: Array<number | Especialidad>;
  lugaresAtencion?: LugarAtencion[];
};

export type ProviderValidationError = {
  field: string;
  message: string;
};

export const providerValidationMessages = {
  cuitRequired: "CUIT/CUIL es requerido",
  cuitInvalid: "CUIT/CUIL debe tener entre 7 y 11 dígitos",
  nameRequired: "Nombre completo es requerido",
  typeRequired: "Debe seleccionar si es profesional o centro médico.",
  typeInvalid: "Tipo de prestador inválido",
  emailRequired: "Debe informar al menos un email",
  emailInvalid: "Formato de email inválido",
  phoneRequired: "Debe informar al menos un teléfono",
  phoneInvalid: "El teléfono debe tener entre 7 y 15 dígitos",
  specialtyRequired: "Debe informar al menos una especialidad",
  placeRequired: "Debe informar al menos un lugar de atención",
  placeFieldsRequired: "Complete todos los datos de los lugares de atención.",
};

export const normalizeCuit = (value: string) => value.replace(/\D/g, "");
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const isValidPhone = (value: string) => /^\d{7,15}$/.test(value.replace(/\D/g, ""));

export function validateProviderPayload(payload: ProviderValidationPayload): ProviderValidationError[] {
  const errors: ProviderValidationError[] = [];
  const cuit = normalizeCuit(payload.cuitCuil || "");
  const mails = (payload.mails || []).map((mail) => mail.trim()).filter(Boolean);
  const telefonos = (payload.telefonos || []).map((phone) => phone.trim()).filter(Boolean);
  const especialidades = payload.especialidades || [];
  const lugares = payload.lugaresAtencion || [];

  if (!payload.tipoPrestador) errors.push({ field: "tipoPrestador", message: providerValidationMessages.typeRequired });
  if (payload.tipoPrestador && !["profesional", "centro_medico"].includes(payload.tipoPrestador)) {
    errors.push({ field: "tipoPrestador", message: providerValidationMessages.typeInvalid });
  }

  if (!cuit) errors.push({ field: "cuitCuil", message: providerValidationMessages.cuitRequired });
  else if (!/^\d{7,11}$/.test(cuit)) errors.push({ field: "cuitCuil", message: providerValidationMessages.cuitInvalid });

  if (!payload.nombreCompleto?.trim()) errors.push({ field: "nombreCompleto", message: providerValidationMessages.nameRequired });

  if (mails.length === 0) errors.push({ field: "mails", message: providerValidationMessages.emailRequired });
  mails.forEach((mail, index) => {
    if (!isValidEmail(mail)) errors.push({ field: `mails.${index}`, message: providerValidationMessages.emailInvalid });
  });

  if (telefonos.length === 0) errors.push({ field: "telefonos", message: providerValidationMessages.phoneRequired });
  telefonos.forEach((phone, index) => {
    if (!isValidPhone(phone)) errors.push({ field: `telefonos.${index}`, message: providerValidationMessages.phoneInvalid });
  });

  if (especialidades.length === 0) errors.push({ field: "especialidades", message: providerValidationMessages.specialtyRequired });
  if (lugares.length === 0) errors.push({ field: "lugaresAtencion", message: providerValidationMessages.placeRequired });
  if (lugares.some((lugar) => !lugar.calle?.trim() || !lugar.localidad?.trim() || !lugar.provincia?.trim() || !lugar.cp?.trim())) {
    errors.push({ field: "lugaresAtencion", message: providerValidationMessages.placeFieldsRequired });
  }

  return errors;
}

export function firstProviderValidationMessage(errors: ProviderValidationError[]) {
  return errors[0]?.message || "";
}
