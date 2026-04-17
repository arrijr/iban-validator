# IBAN Validator Pro

Next.js API for IBAN validation with structured bank details. Deployed on Vercel, distributed via RapidAPI.

## Endpoints

- `POST /api/v1/validate` — Single IBAN
- `POST /api/v1/validate/batch` — Batch (up to 100, tier-limited)
- `GET /api/health` — Health check

## Environment Variables

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RAPIDAPI_PROXY_SECRET`

Set on Vercel via `printf` (never `echo`, which appends a newline):

```bash
printf "%s" "$SECRET" | vercel env add RAPIDAPI_PROXY_SECRET production
```

## Tier Batch Limits

| Tier | Max batch size |
|---|---|
| Free | 0 (no batch) |
| Basic | 10 |
| Pro | 100 |
| Business | 100 |

## Development

```bash
npm install
npm run dev
```

## Notes

- `bic` and `bank_name` are always `null` in v1 — `ibantools` does not ship a BIC registry, and we never fabricate values.
- Redis is lazy-initialized; in-memory fallback is used when env vars are missing (local dev).
