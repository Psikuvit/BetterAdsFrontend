# BetterAds — Frontend

Next.js dashboard for BetterAds, a video advertising platform. This app is
where advertisers upload video ads, manage campaigns, fund budget via
Stripe, register the sites/apps that will display their ads, and preview
their own creative — and where admins moderate flagged ads and see
platform-wide stats. It talks to a separate Spring Boot backend over a JSON
REST API (`NEXT_PUBLIC_API_BASE_URL`); this repo has no server-side logic of
its own beyond what Next.js needs to render pages.

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** for styling, `framer-motion` for the auth-page animations
- **Stripe** (`@stripe/react-stripe-js`) for campaign funding
- **recharts** for the campaign view-count timeseries chart
- No app-level state library — auth lives in `AuthContext`, everything else
  is per-page `useState`/`useEffect` against the API client in `src/lib/api/`

## Roles

Two roles exist: `ADVERTISER` and `ADMIN` (a separate `PUBLISHER` role used
to gate site registration was merged into `ADVERTISER` — one role now covers
both buying campaigns and registering a site to display ads). Every
authenticated page is wrapped in `<RequireAuth allowedRoles={[...]}>`
(`src/components/RequireAuth.tsx`), which redirects unauthenticated users to
`/login` and redirects a logged-in user with the wrong role to their
role's default page (`/dashboard` for `ADVERTISER`, `/admin` for `ADMIN`).

## Authentication

JWT access token (15min) + opaque refresh token, both stored via
`src/lib/tokens.ts`. `AuthContext` (`src/context/AuthContext.tsx`) hydrates
the current user from `GET /auth/me` on load, exposes `login`/`register`/
`logout`, and listens for an `AUTH_EXPIRED_EVENT` (fired by `src/lib/http.ts`
when a request comes back 401) to bounce the user back to `/login`. The root
route (`/`) and `RequireAuth` both redirect based on role once auth state
resolves — there's a `FullScreenLoader` shown while that's in flight.

## Pages

**Public (`(auth)` route group):**

| Route | Purpose |
|-------|---------|
| `/login` | `POST /auth/login` |
| `/register` | `POST /auth/register` — pick `ADVERTISER` or `ADMIN` |
| `/forgot-password` | `POST /auth/forgot-password` |
| `/reset-password?token=...` | `POST /auth/reset-password` |

**Advertiser (`ADVERTISER`, most also visible to `ADMIN` — see table below):**

| Route | Purpose |
|-------|---------|
| `/dashboard` | Cross-campaign stats (`GET /api/analytics/advertiser`) — `ADVERTISER` only |
| `/campaigns` | Paginated campaign list + create-campaign form |
| `/campaigns/:id` | Budget/spend/status, edit form, status control (incl. archive), Stripe funding panel, view-count chart, **Playlist** preview (every LIVE ad, see below), embed URL/snippet to copy |
| `/campaigns/:id/ads` | Paginated ad list for the campaign + per-ad view breakdown |
| `/campaigns/:id/upload` | Upload flow: presigned S3 PUT, then confirm |
| `/ads/:id` | Single ad's status (live via SSE, falls back to polling), locale-selection form once validated, **Preview** of that one ad (see below), embed URL/snippet to copy |
| `/sites` | Register a site/app (domain or mobile bundle ID) to get a site key for embedding |

**Admin (`ADMIN` only):**

| Route | Purpose |
|-------|---------|
| `/admin` | Platform-wide stats: campaigns/ads by status, total budget/spend, flagged-ad count |
| `/admin/ads` | All ads across every campaign, filterable, with delete |
| `/review-queue` | Approve/reject `FLAGGED` ads (`PATCH /api/ads/{id}/review`) |

## Ad Lifecycle

An uploaded ad moves through `PENDING → VALIDATING → (FLAGGED | REJECTED) |
AWAITING_FEATURES → PROCESSING → LIVE`, driven entirely by the backend's
async worker. `/ads/:id` subscribes to `GET /api/ads/{id}/events` (SSE) to
reflect each transition live, falling back to polling
`GET /api/ads/{id}/validation` if the SSE connection can't be established
(native `EventSource` can't carry an `Authorization` header, so `src/lib/sse.ts`
does its own `fetch`-based stream instead). Once `AWAITING_FEATURES`, the
advertiser picks locales to translate (or skips translation) to push the ad
to `LIVE`. A `FLAGGED` ad has no automatic path forward — it sits in
`/review-queue` until an admin approves or rejects it.

## Ad Preview vs. Real Serving — two different things

This app draws a hard line between "the advertiser looking at their own ad
inside the dashboard" and "a publisher's actual visitor watching a served
ad," because those two need very different guarantees:

- **In-dashboard preview (untracked, no site key).** `/ads/:id` renders
  `DummyAdPlayer` (one ad) and `/campaigns/:id`'s "Playlist" section renders
  `DummyPlaylistPlayer` (every LIVE ad in the campaign). Both are plain
  `<video>` elements fed by `GET /api/ads/{id}/preview` and
  `GET /api/campaigns/{id}/preview` respectively — authenticated,
  ownership-checked backend endpoints that skip billing/fraud/view-token
  logic entirely. Opening your own ad or campaign here is never counted as
  a served impression and never requires a registered site.
- **Real serving (tracked, billed, needs a site key).** A publisher embeds
  `embedSnippet` (an `<iframe src="{embedUrl}">`, copyable from `/ads/:id`
  or `/campaigns/:id`) on their own site. That iframe loads the backend's
  public `GET /embed/{token}` widget, which fetches
  `GET /api/ads/{id}/playlist` and bills a real view on every load. This
  app never renders that iframe live on its own pages — only the copyable
  URL/snippet.

## Sites

`/sites` registers the web origin or mobile bundle ID where ads will be
embedded (`POST /api/sites`) and returns a non-secret site key — safe to
ship client-side, same trust model as a Stripe publishable key. This site
key is for the backend's placements API (`POST /api/v1/placements/{siteKey}/...`),
which this dashboard app itself does not call — it's meant for a real
publisher's own page, not for anything rendered here.

## Campaign Funding

`/campaigns/:id`'s funding panel (`FundCampaignPanel`) calls
`POST /api/campaigns/{id}/fund` for a Stripe `PaymentIntent`, then confirms
the card payment client-side via `@stripe/react-stripe-js`. Budget isn't
updated instantly on confirm — the backend's Stripe webhook applies it
asynchronously, so the UI just prompts a manual refresh.

## Environment Variables

See `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` — the backend's base URL (default `http://localhost:8080`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — omit to disable the funding panel (it renders a "Stripe isn't configured" message instead of erroring)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires the backend
(see the sibling `BetterAds` Spring Boot repo) running and reachable at
`NEXT_PUBLIC_API_BASE_URL`.

Other scripts: `npm run build`, `npm run start` (production server), `npm run lint`.
