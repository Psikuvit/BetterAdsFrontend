import { apiRequest, buildQuery } from "../http";
import { AdValidation, EmbedLink } from "../types";

export function getAdValidation(id: number) {
  return apiRequest<AdValidation>(`/api/ads/${id}/validation`);
}

export function reviewAd(id: number, decision: "approve" | "reject") {
  return apiRequest<{ adId: number; status: string }>(`/api/ads/${id}/review`, {
    method: "PATCH",
    body: { decision },
  });
}

export function getEmbedLink(id: number) {
  return apiRequest<EmbedLink>(`/api/ads/${id}/link`);
}

export function selectFeatures(id: number, locales: string[]) {
  return apiRequest<{ adId: number; status: string }>(`/api/ads/${id}/features`, {
    method: "POST",
    body: { locales },
  });
}

export function getAdPublic(id: number, locale?: string) {
  return apiRequest<{ adId: number; variants: string[] }>(
    `/api/ads/${id}${buildQuery({ locale })}`,
    { auth: false }
  );
}
