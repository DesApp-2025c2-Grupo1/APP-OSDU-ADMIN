import { API_BASE_URL, apiFetch } from "../config/api";

export type TherapeuticSituationType = {
  idSituacion: number;
  nombre: string;
};

export const fetchTherapeuticSituationTypes = async (): Promise<TherapeuticSituationType[]> => {
  const response = await apiFetch(`${API_BASE_URL}/prestadores/situaciones/tipos`);

  if (!response.ok) {
    throw new Error("Error al cargar situaciones terapéuticas");
  }

  const data = await response.json();
  const situations = Array.isArray(data) ? data : data.situaciones || [];

  return situations.map((item: any) => ({
    idSituacion: item.idSituacion ?? item.id,
    nombre: item.nombre ?? item.name,
  })).filter((item: TherapeuticSituationType) => item.idSituacion && item.nombre);
};
