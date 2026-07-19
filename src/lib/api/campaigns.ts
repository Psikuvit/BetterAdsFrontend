import { apiRequest, buildQuery } from "../http";
import {
  Ad,
  AdAnalyticsRow,
  AdPreview,
  Campaign,
  CampaignAnalytics,
  CampaignEmbed,
  CampaignStatus,
  CampaignTimeseriesPoint,
  FundResponse,
  Page,
} from "../types";

export function createCampaign(input: { name?: string; budget?: number | string }) {
  return apiRequest<Campaign>("/api/campaigns", { method: "POST", body: input });
}

export function listCampaigns(params: { page?: number; size?: number; sort?: string } = {}) {
  const qs = buildQuery({ page: params.page, size: params.size, sort: params.sort });
  return apiRequest<Page<Campaign>>(`/api/campaigns${qs}`);
}

export function getCampaign(id: number) {
  return apiRequest<Campaign>(`/api/campaigns/${id}`);
}

export function updateCampaign(id: number, input: { name?: string; budget?: number | string }) {
  return apiRequest<Campaign>(`/api/campaigns/${id}`, { method: "PATCH", body: input });
}

export function updateCampaignStatus(id: number, status: CampaignStatus) {
  return apiRequest<{ campaignId: number; status: string }>(`/api/campaigns/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function getCampaignAds(id: number, params: { page?: number; size?: number } = {}) {
  const qs = buildQuery({ page: params.page, size: params.size });
  return apiRequest<Page<Ad>>(`/api/campaigns/${id}/ads${qs}`);
}

export function getCampaignAnalytics(id: number) {
  return apiRequest<CampaignAnalytics>(`/api/campaigns/${id}/analytics`);
}

export function getCampaignTimeseries(id: number, days = 7) {
  return apiRequest<CampaignTimeseriesPoint[]>(
    `/api/campaigns/${id}/analytics/timeseries${buildQuery({ days })}`
  );
}

export function getCampaignAdsAnalytics(id: number) {
  return apiRequest<AdAnalyticsRow[]>(`/api/campaigns/${id}/ads/analytics`);
}

export function fundCampaign(id: number, amount: number) {
  return apiRequest<FundResponse>(`/api/campaigns/${id}/fund`, {
    method: "POST",
    body: { amount },
  });
}

export function getCampaignEmbed(id: number) {
  return apiRequest<CampaignEmbed>(`/api/campaigns/${id}/embed`);
}

export function getCampaignPreview(id: number, locale?: string) {
  return apiRequest<AdPreview[]>(`/api/campaigns/${id}/preview${buildQuery({ locale })}`);
}
