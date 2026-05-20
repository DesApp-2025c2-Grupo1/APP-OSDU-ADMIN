import axios from "axios";
import { API_PORTAL_URL } from "../config/api";

const api = axios.create({
  baseURL: API_PORTAL_URL,
  withCredentials: true,
});

function responseData(request) {
  return request.then((response) => response.data);
}

export function login(email, password) {
  return responseData(api.post("/auth/login", { email, password }));
}

export function getSession() {
  return responseData(api.get("/auth/me"));
}

export function logout() {
  return responseData(api.post("/auth/logout"));
}

export function getAffiliates(status) {
  const params = status === "all" ? {} : { status };
  return responseData(api.get("/admin/affiliates", { params }));
}

export function activateAffiliate(id) {
  return responseData(api.put(`/admin/affiliates/${id}/activate`));
}

export function deactivateAffiliate(id) {
  return responseData(api.put(`/admin/affiliates/${id}/deactivate`));
}

export function getApiErrorMessage(error) {
  return error?.response?.data?.message
    || error?.response?.data?.error
    || "No se pudo completar la operación";
}
