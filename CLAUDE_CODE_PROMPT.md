# Prompt für Claude Code — IBAN Validator Pro

Bitte lies zuerst diese beiden Dateien vollständig durch, bevor du anfängst:
- `C:\Users\Arthur\Documents\Coding\APIs\iban-validator\KICKOFF.md`
- `C:\Users\Arthur\Documents\Coding\APIs\iban-validator\openapi.yaml`
- `C:\Users\Arthur\Documents\Coding\APIs\CLAUDE.md` (Projekt-Standards, Logo-System, Boilerplate)

---

## Aufgabe

Baue die **IBAN Validator Pro API** als Next.js App (gleicher Stack wie das bestehende `vat-validation` Projekt).

**Orientiere dich am bestehenden Projekt:** `C:\Users\Arthur\Documents\Coding\APIs\vat-validation\`
Gleiche Ordnerstruktur, gleiche Patterns, gleiche Boilerplate (Lazy Redis, RapidAPI Proxy Secret Guard, Health Check).

---

## Stack
- Next.js 15+ mit App Router, TypeScript
- Upstash Redis (Lazy-Initialisierung — siehe CLAUDE.md Boilerplate, NICHT `Redis.fromEnv()` auf Modulebene!)
- `ibantools` npm package für IBAN-Validierung + Länder-Registry
- Vercel deployment

---

## Endpoints (exakt nach openapi.yaml)

### 1. `POST /api/v1/validate` — Single IBAN
- Input: `{ "iban": "DE89 3704 0044 0532 0130 00" }`
- Normalisierung: Leerzeichen + Bindestriche entfernen, Großbuchstaben
- Validierung: MOD-97 Checksum via `ibantools`
- Response valid: `{ valid, iban, formatted, country, country_name, currency, bank_code, account_number, bic, bank_name }`
- Response invalid: `{ valid: false, iban, error_code, error }`
- `bic` und `bank_name` → `null` wenn nicht in ibantools-Registry (NIEMALS faken)
- Error-Codes: `INVALID_FORMAT`, `INVALID_CHECKSUM`, `UNSUPPORTED_COUNTRY`, `TOO_SHORT`, `TOO_LONG`

### 2. `POST /api/v1/validate/batch` — Batch (bis 100 IBANs)
- Input: `{ "ibans": ["DE89...", "GB82..."] }`
- Batch-Limit je nach Tier: Free = 0 (kein Batch), Basic = 10, Pro/Business = 100
- Response: `{ results: [...], total, valid_count, invalid_count }`
- Bei Überschreitung: 422 mit `BATCH_LIMIT_EXCEEDED`

### 3. `GET /api/health`
- Response: `{ status: "ok", timestamp }`

---

## Pflicht-Regeln (aus CLAUDE.md + Learnings aus vat-validation)

- **Lazy Redis-Initialisierung** — Redis NICHT als globale Variable, sondern lazy in einer Funktion (siehe CLAUDE.md Boilerplate)
- **Vercel env vars** mit `printf` setzen, NIEMALS mit `echo` (echo hängt `\n` an → Build-Fehler)
- **RapidAPI Proxy Secret Guard** — jeden Request auf `x-rapidapi-proxy-secret` Header prüfen
- **`X-RateLimit-Remaining`** Header in jeder Response
- **Konsistente Error-Responses:** immer `{ error: string, code: string }`
- **Rate Limiting** via `@upstash/ratelimit` (sliding window)
- **Logo:** `public/logo.svg` — 120×120px, `rx="24"`, Hintergrund `#0F172A`, Akzent `#FACC15`, Text `#FFFFFF`, Kürzel `IBAN`

---

## Environment Variables (müssen in Vercel gesetzt werden)

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RAPIDAPI_PROXY_SECRET
SENTRY_DSN (optional für Start)
```

---

## Projektordner

`C:\Users\Arthur\Documents\Coding\APIs\iban-validator\`

KICKOFF.md und openapi.yaml liegen bereits dort. Das Next.js Projekt bitte direkt in diesem Ordner scaffolden (nicht in einem Unterordner).

---

## Wenn du fertig bist

1. Ruf `/api-review` auf (Skill im Projekt) — Security, Error Handling, Breaking Changes prüfen
2. Sag Bescheid, dann machen wir das RapidAPI Listing mit `/rapidapi-listing`
