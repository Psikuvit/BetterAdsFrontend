import { apiRequest } from "../http";

export type PaceStatus = "AHEAD" | "ON_PACE" | "BEHIND" | "UNPACED";

export interface SelectAdResponse {
  adId: number;
  paceStatus: PaceStatus;
}

/**
 * POST /api/v1/placements/{siteKey}/select — server-driven ad selection
 * (frequency capping + pacing visibility). Public/site-key-based, not
 * JWT-authenticated — matches how a real publisher's page would call it.
 */
export function selectAd(siteKey: string, input: { campaignId: number; viewerId?: string; bundleId?: string }) {
  return apiRequest<SelectAdResponse>(`/api/v1/placements/${siteKey}/select`, {
    method: "POST",
    body: input,
    auth: false,
  });
}
