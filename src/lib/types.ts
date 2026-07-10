export type Role = "ADVERTISER" | "ADMIN" | "PUBLISHER";

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  role: Role;
}

export interface Me {
  id: number;
  email: string;
  role: string;
}

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface Campaign {
  id: number;
  advertiserId: number;
  name: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  createdAt: string;
}

export type AdStatus =
  | "pending"
  | "validating"
  | "processing"
  | "live"
  | "flagged"
  | "rejected"
  | "failed";

export interface Ad {
  id: number;
  campaignId: number;
  title: string;
  storageKey: string;
  status: AdStatus;
  targetLocale: string;
  createdAt: string;
}

export interface AdValidation {
  adId: number;
  status: AdStatus;
  inHumanReview: boolean;
}

export interface EmbedLink {
  embedUrl: string;
  embedSnippet: string;
  token: string;
}

export interface CampaignAnalytics {
  campaignId: number;
  totalViews: number;
  totalAds: number;
  spent: number;
  budget: number;
  status: string;
}

export interface CampaignTimeseriesPoint {
  date: string;
  views: number;
}

export interface AdAnalyticsRow {
  adId: number;
  title: string;
  views: number;
}

export interface AdvertiserAnalytics {
  campaignCount: number;
  campaignsByStatus: Record<string, number>;
  totalSpent: number;
  totalBudget: number;
  totalViews: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface FundResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ApiErrorBody {
  error: string;
  status?: number;
  path?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error || `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}
