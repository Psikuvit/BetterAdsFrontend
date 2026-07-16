import { apiRequest, buildQuery } from "../http";
import { Page, Site } from "../types";

export function listSites(params: { page?: number; size?: number } = {}) {
  const qs = buildQuery({ page: params.page, size: params.size });
  return apiRequest<Page<Site>>(`/api/sites${qs}`);
}

export function createSite(input: { name: string; allowedOrigin?: string; bundleId?: string }) {
  return apiRequest<Site>("/api/sites", { method: "POST", body: input });
}

export function getSite(id: number) {
  return apiRequest<Site>(`/api/sites/${id}`);
}
