import { apiRequest, buildQuery } from "../http";
import { AdPreview, AdValidation, EmbedLink } from "../types";

export function getAdValidation(id: number) {
  return apiRequest<AdValidation>(`/api/ads/${id}/validation`);
}

export function reviewAd(id: number, decision: "approve" | "reject") {
  return apiRequest<{ adId: number; status: string }>(`/api/ads/${id}/review`, {
    method: "PATCH",
    body: { decision },
  });
}

export function deleteAd(id: number) {
  return apiRequest<{ adId: number; deleted: boolean }>(`/api/ads/${id}`, {
    method: "DELETE",
  });
}

export function getEmbedLink(id: number) {
  return apiRequest<EmbedLink>(`/api/ads/${id}/link`);
}

export function getAdPreview(id: number, locale?: string) {
  return apiRequest<AdPreview>(`/api/ads/${id}/preview${buildQuery({ locale })}`);
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
