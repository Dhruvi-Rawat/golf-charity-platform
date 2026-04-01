

# Golf Charity Subscription Platform — Implementation Plan

## Requirement Analysis

### Core Modules
1. **Auth & User Management** — signup, login, roles (visitor/subscriber/admin)
2. **Subscription & Payments** — monthly/yearly plans via Stripe, lifecycle management
3. **Score Management** — rolling 5-score Stableford entry (1–45), auto-replace oldest
4. **Draw & Reward Engine** — monthly draws (5/4/3-match), random or weighted, jackpot rollover
5. **Prize Pool** — 40%/35%/25% split, auto-calculated from subscriber count
6. **Charity System** — directory, selection at signup, min 10% contribution, independent donations
7. **Winner Verification** — proof upload, admin review, payout tracking
8. **User Dashboard** — subscription status, scores, charity, draws, winnings
9. **Admin Dashboard** — user/draw/charity/winner management, reports
10. **Public Pages** — homepage, charity listing, how-it-works

### Missing/Ambiguous Requirements (will make reasonable defaults)
- Exact subscription prices not specified → will make configurable by admin
- Draw number range not defined → will use 1–45 (matching Stableford range)
- "Algorithmic weighted draw" is vague → will implement frequency-weighted selection
- Winner proof format not specified → will accept image uploads
- Email notifications mentioned but no provider specified → will use Supabase edge functions + Resend

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite + Tailwind + shadcn/ui | Already set up in project; fast, modern |
| Backend | Supabase (Lovable Cloud) | Auth, DB, edge functions, storage — all-in-one |
| Database | PostgreSQL (Supabase) | Relational data, RLS for security |
| Auth | Supabase Auth | Built-in, JWT-based, role support |
| Payments | Stripe (Lovable integration) | PCI-compliant, subscriptions built-in |
| Storage | Supabase Storage | Winner proof uploads, charity images |

---

## Architecture

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React SPA  │────▶│ Supabase API │────▶│  PostgreSQL DB  │
│  (Vite)     │     │  + Auth      │     │  (RLS enabled)  │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │
       │              ┌─────┴──────┐
       │              │Edge Functions│
       │              └─────┬──────┘
       │                    │
  ┌────┴────┐        ┌─────┴──────┐
  │ Stripe  │◀──────▶│  Webhooks  │
  │Checkout │        │  Handler   │
  └─────────┘        └────────────┘
```

**Data flows:**
- User → React → Supabase Auth → JWT → RLS-protected queries
- Subscription: React → Stripe Checkout → Webhook → Edge Function → DB update
- Draw: Admin triggers → Edge Function → random/weighted algo → results → DB
- Charity: 10%+ of subscription auto-calculated, tracked per payment

---

## Database Schema

### Tables

**profiles** — extends auth.users
- `id` (uuid, PK, FK → auth.users)
- `full_name`, `avatar_url`, `selected_charity_id` (FK), `charity_percentage` (int, default 10, min 10)
- `created_at`, `updated_at`

**user_roles** — separate role table (security requirement)
- `id` (uuid, PK), `user_id` (FK → auth.users), `role` (app_role enum: admin/user)
- Unique constraint on (user_id, role)

**subscriptions**
- `id`, `user_id` (FK), `stripe_subscription_id`, `stripe_customer_id`
- `plan_type` (monthly/yearly), `status` (active/cancelled/past_due/expired)
- `current_period_start`, `current_period_end`, `created_at`

**scores**
- `id`, `user_id` (FK), `score` (int, 1–45), `played_date` (date)
- `created_at`
- Constraint: max 5 per user (enforced via trigger — delete oldest on insert if count ≥ 5)

**charities**
- `id`, `name`, `description`, `image_url`, `website_url`
- `is_featured` (bool), `is_active` (bool), `created_at`

**draws**
- `id`, `draw_date` (date), `draw_type` (random/algorithmic)
- `winning_numbers` (int[5]), `status` (draft/simulated/published)
- `jackpot_amount` (decimal), `is_rollover` (bool), `created_at`

**draw_entries**
- `id`, `draw_id` (FK), `user_id` (FK), `scores` (int[5])
- `match_count` (int), `created_at`

**winners**
- `id`, `draw_id` (FK), `user_id` (FK), `match_type` (3/4/5)
- `prize_amount` (decimal), `proof_url`, `verification_status` (pending/approved/rejected)
- `payout_status` (pending/paid), `created_at`

**contributions**
- `id`, `user_id` (FK), `charity_id` (FK), `amount` (decimal)
- `subscription_id` (FK), `period_date`, `created_at`

**prize_pool**
- `id`, `draw_id` (FK), `total_pool` (decimal)
- `five_match_pool`, `four_match_pool`, `three_match_pool`
- `rollover_amount` (decimal), `created_at`

---

## Implementation Plan (Phased)

### Phase 1: Foundation (Days 1–2)
1. **Enable Supabase** (Lovable Cloud) — set up database
2. **Create all DB tables** with migrations, RLS policies, triggers
3. **Auth system** — signup/login pages, profile creation trigger, role management
4. **Basic routing** — public pages, protected routes, admin routes

### Phase 2: Subscription & Payments (Days 3–4)
5. **Enable Stripe** integration
6. **Subscription page** — monthly/yearly plan cards, Stripe Checkout flow
7. **Webhook handler** — edge function for subscription lifecycle events
8. **Access control** — gate features behind active subscription

### Phase 3: Core Features (Days 5–6)
9. **Score management** — input UI (1–45), rolling 5-score logic with DB trigger, display
10. **Charity system** — directory page, charity profiles, selection at signup, contribution tracking
11. **User dashboard** — subscription status, scores, charity, participation summary

### Phase 4: Draw Engine (Days 7–8)
12. **Draw engine edge function** — random number generation, weighted algorithm option
13. **Draw management** (admin) — configure, simulate, publish draws
14. **Match calculation** — compare user scores to winning numbers, determine winners
15. **Prize distribution** — auto-calculate pools (40/35/25), split among winners, jackpot rollover

### Phase 5: Winner & Admin (Days 9–10)
16. **Winner verification** — proof upload (Supabase Storage), admin review UI
17. **Payout tracking** — pending/paid status management
18. **Admin dashboard** — user management, reports/analytics, charity CRUD
19. **Public homepage** — hero section, how-it-works, charity spotlight, CTA

### Phase 6: Polish (Days 11–12)
20. **UI/UX refinement** — animations, micro-interactions, mobile responsiveness
21. **Edge cases** — duplicate scores, no-winner scenarios, payment failures, fraud checks
22. **Email notifications** via edge function (draw results, winner alerts)

---

## UI/UX Strategy

- **Color palette**: Deep navy (#0F172A) + vibrant emerald (#10B981) + warm amber (#F59E0B) + white
- **Typography**: Inter (body), Plus Jakarta Sans (headings) — clean, modern
- **Design language**: Emotion-driven, charity-first. Hero shows impact stats, not golf imagery
- **Animations**: Framer Motion for page transitions, score entry celebrations, draw reveals
- **Mobile-first**: Bottom nav on mobile, responsive grid layouts

---

## Security

- Supabase Auth with JWT, RLS on all tables
- Roles in separate `user_roles` table with `has_role()` security definer function
- Stripe webhook signature verification in edge function
- Score validation (1–45 range) at both client and DB level (CHECK constraint)
- Admin routes protected by role check

---

## Bonus Features (Not in PRD)

1. **Live draw animation** — countdown + number reveal with suspense animations
2. **Leaderboard** — top charity contributors, most active players
3. **Referral system** — invite friends, earn bonus draw entries

---

## Files to Create/Modify

~40+ files across pages, components, hooks, edge functions, and migrations. Key new files:

- `src/pages/` — Home, Login, Signup, Dashboard, Admin/*, Charities, Subscribe, ResetPassword
- `src/components/` — ScoreInput, DrawResults, CharityCard, SubscriptionCard, AdminSidebar, WinnerProof, StatsCards
- `src/hooks/` — useAuth, useSubscription, useScores, useDraws, useCharities
- `src/integrations/supabase/` — client config, types
- `supabase/functions/` — stripe-webhook, run-draw, send-notification
- `supabase/migrations/` — tables, RLS policies, triggers, functions

