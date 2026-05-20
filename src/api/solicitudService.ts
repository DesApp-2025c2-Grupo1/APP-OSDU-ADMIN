import { apiFetch, API_BASE_URL } from "../config/api";
import type { SolicitudFilters, SolicitudesPageResponse } from "../model/Solicitud.model";

const BASE = `${API_BASE_URL}/prestadores`;

export const fetchSolicitudes = async (filters: SolicitudFilters = {}): Promise<SolicitudesPageResponse> => {
  const params = new URLSearchParams();
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.page)   params.set("page",   String(filters.page));
  if (filters.limit)  params.set("limit",  String(filters.limit));

  const res = await apiFetch(`${BASE}/solicitudes/admin?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar las solicitudes");
  return res.json();
};

export const updateSolicitudEstado = async (
  id: number,
  estado: string,
  motivo?: string
): Promise<void> => {
  const res = await apiFetch(`${BASE}/solicitudes/${id}/admin/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, motivo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? "Error al actualizar el estado");
  }
};
