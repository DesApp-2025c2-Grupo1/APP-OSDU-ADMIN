import { apiFetch, API_BASE_URL } from "../config/api";
import type { ReintegroFilters, ReintegrosPageResponse } from "../model/Reintegro.model";

const BASE = `${API_BASE_URL}/admin/affiliates`;

export const fetchReintegros = async (filters: ReintegroFilters = {}): Promise<ReintegrosPageResponse> => {
  const params = new URLSearchParams();
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.page)   params.set("page",   String(filters.page));
  if (filters.limit)  params.set("limit",  String(filters.limit));

  const res = await apiFetch(`${BASE}/reintegros/admin?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar los reintegros");
  return res.json();
};

export const updateReintegroEstado = async (
  id: number,
  estado: string,
  motivo?: string
): Promise<void> => {
  const res = await apiFetch(`${BASE}/reintegros/${id}/admin/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, motivo }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? "Error al actualizar el estado");
  }
};
