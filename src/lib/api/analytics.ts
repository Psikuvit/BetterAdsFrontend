import { apiRequest } from "../http";
import { AdvertiserAnalytics } from "../types";

export function getAdvertiserAnalytics() {
  return apiRequest<AdvertiserAnalytics>("/api/analytics/advertiser");
}
