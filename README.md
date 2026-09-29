# ZOATLAS

**Collect the living world.** ZOATLAS is a modern natural-history collection game built around real species, collectible card editions, expeditions and a player market.

## What is implemented

- Responsive desktop and mobile game shell
- Home dashboard with progress, daily pack, mystery species and objectives
- Five-card daily pack opening with staged reveal, skip and progress summary
- Searchable/filterable Atlas with discovered and hidden species
- Reusable rarity-aware card component and species detail panel
- Collection inventory and duplicate recycling interaction
- Three-step Congo Basin expedition with reward pack
- Demo market with wallet balance and purchases
- Profile, showcases and achievement previews
- Accessible focus states and reduced-motion support
- PostgreSQL/Supabase core migration and architectural decisions

The hosted experience is a polished interactive demo. Its state is intentionally session-scoped. The included Supabase schema establishes the production boundary for durable accounts, packs, ownership, ledgers and atomic market operations.

## Local setup

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

For a production build, run `npm run build`.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and keys.
3. Apply `supabase/migrations/202609290001_core.sql`.
4. Add security-definer RPCs for pack opening, recycling and market purchase before enabling client mutations. Their required transactional behavior is documented in `docs/architecture.md`.

Never expose the service role key to browser code.

## Structure

- `app/page.tsx` — interactive product vertical slice
- `app/globals.css` — visual system and responsive behavior
- `supabase/migrations` — production database foundation
- `docs/architecture.md` — domain and security decisions

## Next production steps

- Connect Supabase Auth and replace the demo identity with the signed-in profile
- Import and normalize the 50–100 species development catalogue
- Implement pack, recycling and market RPCs with integration tests
- Add server-rendered public species routes and PWA manifest/service worker
- Add admin catalogue and pack-rule tools
