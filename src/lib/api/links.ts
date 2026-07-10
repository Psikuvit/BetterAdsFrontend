import { apiRequest, buildQuery } from "../http";

export function getLinks(adId: number, locale?: string) {
  return apiRequest<string[]>(`/api/links/${adId}${buildQuery({ locale })}`);
}
