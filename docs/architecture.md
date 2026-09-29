# ZOATLAS architecture

## Product boundary

The first release treats the web interface as an immediately playable vertical slice. The production data boundary is Supabase/PostgreSQL. All rewards, ownership changes and wallet mutations belong on the server; the browser only reveals results returned by a server operation.

## Species and cards

`species` is canonical zoological data. `card_editions` describes a collectible printing (rarity, edition and variant traits). `card_instances` is an individually owned object. A species can therefore have many editions and every edition can have many unique instances.

Variants are stored as a `text[]` on an edition for the MVP. UI code renders traits generically instead of branching on every possible combination. This can become a normalized trait catalogue without changing ownership.

## Pack generation

Pack rules and weighted pools are database records. Opening a pack is one server transaction: lock eligibility, select results from the configured pool, create card instances, write acquisition events, write the pack opening, grant XP, then commit. The client receives the committed result before beginning the reveal animation. Daily claims use a unique `(profile_id, claim_date, pack_type)` constraint and an idempotency key.

## Ownership and economy

Credits and research are account balances backed by immutable ledgers. Balances are cached for efficient reads but never changed without a matching ledger entry. Card acquisition and transfer events provide a complete ownership audit trail.

A market purchase is a security-definer PostgreSQL function. It locks the listing, card and both wallets, validates ownership and balance, writes both ledger entries, transfers the card, closes the listing and records the market transaction in one transaction. Any failure rolls back the entire purchase.

## Security

RLS permits public reads of active catalogue data and user reads of their own collection/profile. Direct inserts or updates to cards, wallets, pack openings and market transactions are denied. Sensitive operations are exposed only through narrowly scoped server actions/RPCs that derive the actor from `auth.uid()`.

## Taxonomy and progress

Taxonomy is modeled as an adjacency tree with materialized paths. Species point to their leaf nodes. Collection and taxonomy progress are derived from distinct owned species, then cached when scale requires it. The source of truth remains ownership, never a client counter.

## Internationalization

Scientific names remain canonical. Common names and descriptions use explicit locale fields initially. UI strings are grouped by feature and can move to message catalogues without altering domain records.
