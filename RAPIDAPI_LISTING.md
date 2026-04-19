# RapidAPI Listing — IBAN Validator Pro

Copy-paste ready. Paste into RapidAPI Studio → General / Settings / Documentation / Security / Tests.

---

## Core fields (Studio → Settings)

| Field | Value |
|---|---|
| **API Name** | `IBAN Validator Pro` |
| **Category** | `Business Software` (secondary: `Finance`, `Data`) |
| **Base URL** | `https://iban-validator-one.vercel.app/api/v1` |
| **Health Check URL** | `https://iban-validator-one.vercel.app/api/health` |
| **RapidAPI Host** | `iban-validator-one.p.rapidapi.com` |
| **Privacy URL** | `https://raw.githubusercontent.com/arrijr/iban-validator/main/PRIVACY.md` |
| **Terms URL** | `https://raw.githubusercontent.com/arrijr/iban-validator/main/TERMS.md` |

## Secret Headers & Parameters (Studio → Security)

Add ONE row in the **Secret Headers & Parameters** table (NOT Transformations):

| Name | Value | Type |
|---|---|---|
| `X-RapidAPI-Proxy-Secret` | `ba727b80-3a22-11f1-ba56-933436aaa55d` | `Header` |

⚠️ Do NOT paste this into **Transformations** — that dialog needs a `request.header.name` dotted path and rejects plain header names with "Invalid format".

---

## TAGLINE (≤60 chars)

```
Validate IBANs + get BIC, bank name & parsed account
```

## SHORT DESCRIPTION (≤160 chars)

```
IBAN validation (ISO 13616) plus BIC, bank name, country, currency & parsed account components. Single + batch (up to 100). Sub-50ms responses.
```

---

## LONG DESCRIPTION

```markdown
# IBAN Validator Pro — Validate IBANs and Enrich with BIC + Bank Name

Production-ready REST API for validating **International Bank Account Numbers (IBAN)** against the ISO 13616 checksum (MOD-97) and enriching them with **BIC/SWIFT**, **bank name**, **country**, **currency**, and **parsed account components** — bank code, branch code, account number — in a single call.

Built for **payment processors, accounting software, marketplaces, subscription billing, and KYC pipelines** that need more than a simple boolean.

## Why developers choose this API

- ✅ **Validation + enrichment in one call** — no chaining two APIs
- ✅ **70+ IBAN-supporting countries** — full SEPA coverage plus Middle East, North Africa, and the Caribbean
- ✅ **BIC + bank name lookup** — registry-backed, returns `null` honestly when unknown instead of guessing
- ✅ **Parsed components** — bank code, branch code, account number already split out
- ✅ **Batch endpoint** — validate up to 100 IBANs in one request (tier-limited)
- ✅ **Deterministic error codes** — `INVALID_FORMAT`, `INVALID_CHECKSUM`, `UNSUPPORTED_COUNTRY`, `TOO_SHORT`, `TOO_LONG` — build real UX feedback
- ✅ **Sub-50ms p95** — in-memory checksum + Redis-cached bank registry on Vercel Edge (fra1)

## Common use cases

- **Payment processors** — pre-validate IBANs at payment-method entry before hitting the rail
- **Accounting & ERP** — enrich vendor/customer records with BIC automatically
- **Subscription billing** — fail IBAN errors at checkout, not at the direct-debit mandate
- **Marketplace payouts** — verify seller IBANs before wiring funds
- **KYC & onboarding** — structured IBAN parsing for compliance forms
- **SEPA direct debit (SDD)** — validate mandate IBANs before submission to the bank

## Endpoints

### POST /validate
Validate one IBAN. Body: `{ "iban": "DE89 3704 0044 0532 0130 00" }`. Spaces and dashes are ignored. Returns the normalized IBAN, formatted IBAN (4-char groups), country + currency, parsed bank/account components, and BIC + bank name when available.

### POST /validate/batch
Validate up to 100 IBANs in one call. Body: `{ "ibans": ["DE89...", "GB82...", ...] }`. Returns per-IBAN results plus aggregate counts. Batch size limit depends on plan (BASIC: 10, PRO+: 100).

### GET /health
Unguarded health check. Returns `{ status: "ok", timestamp: ... }`.

## Response format (example — valid IBAN)

```json
{
  "valid": true,
  "iban": "DE89370400440532013000",
  "formatted": "DE89 3704 0044 0532 0130 00",
  "country": "DE",
  "country_name": "Germany",
  "currency": "EUR",
  "bank_code": "37040044",
  "account_number": "0532013000",
  "bic": "COBADEFFXXX",
  "bank_name": "Commerzbank"
}
```

## Response format (example — invalid IBAN)

```json
{
  "valid": false,
  "iban": "DE00000000000000000000",
  "error_code": "INVALID_CHECKSUM",
  "error": "IBAN checksum validation failed"
}
```

## Supported countries

Full SEPA zone plus the international IBAN registry — 70+ countries including:

Germany (DE), United Kingdom (GB), France (FR), Netherlands (NL), Belgium (BE), Luxembourg (LU), Austria (AT), Spain (ES), Portugal (PT), Italy (IT), Ireland (IE), Greece (GR), Finland (FI), Sweden (SE), Denmark (DK), Norway (NO), Iceland (IS), Switzerland (CH), Liechtenstein (LI), Poland (PL), Czech Republic (CZ), Slovakia (SK), Slovenia (SI), Hungary (HU), Croatia (HR), Romania (RO), Bulgaria (BG), Estonia (EE), Latvia (LV), Lithuania (LT), Malta (MT), Cyprus (CY), Turkey (TR), Israel (IL), Saudi Arabia (SA), United Arab Emirates (AE), Qatar (QA), Kuwait (KW), Bahrain (BH), Jordan (JO), Lebanon (LB), Egypt (EG), Tunisia (TN), Albania (AL), Andorra (AD), Bosnia and Herzegovina (BA), Gibraltar (GI), Kazakhstan (KZ), Kosovo (XK), Moldova (MD), Monaco (MC), Montenegro (ME), North Macedonia (MK), Pakistan (PK), San Marino (SM), Serbia (RS), Ukraine (UA), and more.

## FAQ

**Is this API free?** Yes — the BASIC plan gives you a monthly quota at no cost. Paid tiers start at $9/month.

**Does validation actually check the bank exists, or just the math?** Both. The checksum step (MOD-97 per ISO 13616) verifies the IBAN itself; the enrichment step looks up the bank code against a registry and returns `bic` + `bank_name` when available. If the bank is not in the registry, those fields are `null` rather than guessed.

**What's the difference between `valid: true` with `bic: null` and `valid: false`?** `valid: true` + `bic: null` means the IBAN is mathematically valid but the bank was not found in our registry — still safe to use. `valid: false` means the input failed checksum or format validation.

**How big can a batch be?** Up to 100 IBANs on PRO+ plans, 10 on BASIC. Over-limit requests return `422 BATCH_LIMIT_EXCEEDED`.

**Do you support non-IBAN account numbers (US routing numbers, Canadian transit + account)?** No — IBAN only. The US, Canada, Australia, and New Zealand don't use IBAN.

**Does this do real-time bank account verification (pennydrop / open banking)?** No. This API validates IBAN structure + enriches with bank metadata. It does not contact the bank or confirm the account is live.

**Is this financial advice?** No. It is a data service. Users are responsible for their own risk decisions.

**Can I cache results on my side?** Yes — IBAN validity is deterministic. Bank name / BIC can change (mergers, rebrands) so refresh those periodically.

## Keywords

iban validator api, iban validation api, iban check, sepa iban, bic lookup, iban to bic, bank code lookup, iban parser, iso 13616, mod-97 checksum, iban enrichment, bulk iban validation, batch iban check, sepa direct debit, payment validation api, kyc iban, iban format check.

## Disclaimer

IBAN Validator Pro performs structural validation (ISO 13616 / MOD-97) and registry-based enrichment. A `valid: true` result confirms the IBAN's syntactic and checksum integrity and, where available, the bank registry entry — it does not confirm the account exists, is open, or belongs to any specific person or entity. No financial, legal, or KYC advice is given; see TERMS.md for full liability limits.
```

---

## Code examples

**JavaScript**
```javascript
const res = await fetch('https://iban-validator-one.p.rapidapi.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'iban-validator-one.p.rapidapi.com'
  },
  body: JSON.stringify({ iban: 'DE89 3704 0044 0532 0130 00' })
});
const data = await res.json();
console.log(data.valid, data.bic, data.bank_name);
```

**Python**
```python
import requests
res = requests.post(
    'https://iban-validator-one.p.rapidapi.com/api/v1/validate',
    json={'iban': 'DE89 3704 0044 0532 0130 00'},
    headers={
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'iban-validator-one.p.rapidapi.com',
    },
)
data = res.json()
print(data['valid'], data.get('bic'), data.get('bank_name'))
```

**cURL**
```bash
curl -X POST "https://iban-validator-one.p.rapidapi.com/api/v1/validate" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: iban-validator-one.p.rapidapi.com" \
  -d '{"iban":"DE89370400440532013000"}'
```

---

## Pricing (Studio → Plans)

| Tier | Price | Quota | Batch size | Hard cap |
|---|---|---|---|---|
| **BASIC (Free)** | $0/mo | 500 req/mo | 10 | Yes |
| **PRO** | $9/mo | 10,000 req/mo | 100 | Soft — overage $2 / 1k |
| **ULTRA** | $29/mo | 100,000 req/mo | 100 | Soft — overage $1 / 1k |
| **MEGA** | $99/mo | 1,000,000 req/mo | 100 | Soft — overage $0.50 / 1k |

All plans: 120 req/min sliding-window rate limit.

---

## Studio Tests (free plan = 2 tests max — default to 1)

### Test 1 — Health check (MANDATORY)

- **Location:** Frankfurt
- **Schedule:** every 15 min
- **Step 1 — HTTP GET**
  - URL: `https://iban-validator-one.vercel.app/api/health`
  - No headers needed (`/api/health` is unguarded)
  - Variable name: `health`
- **Step 2 — Assert Equals**
  - Expression: `health.data.status` *(no `{{ }}` braces, use Studio's variable picker)*
  - Value: `ok`

### Test 2 — optional (only if adding a second test)

Prefer a deterministic **format-rejection** test (POST `/validate` with `{"iban":"INVALID"}` → assert `fmt.data.error_code == INVALID_FORMAT`) over a live valid-IBAN happy-path — no upstream dependency, so the assertion is stable.

---

## Pre-Go-Live checklist

1. ✅ Base URL set to `https://iban-validator-one.vercel.app/api/v1`
2. ✅ Secret Header `X-RapidAPI-Proxy-Secret` configured
3. ✅ Privacy + Terms URLs pasted
4. ✅ Health test green
5. ✅ Playground smoketest: subscribe to own API, call `/validate` via Try-It with a real Consumer key → expect 200 (verifies Gateway → Secret Injection → Origin chain)
