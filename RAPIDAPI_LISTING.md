# RapidAPI Listing — IBAN Validator Pro

Copy-paste ready. Fields map 1:1 to RapidAPI Studio → General / Settings / Documentation.

---

## NAME
```
IBAN Validator Pro
```

## CATEGORY
```
Finance
```
(Secondary: Data / Business Software)

## TAGLINE (46/60 chars)
```
Validate IBANs & get bank details in one call
```

## SHORT DESCRIPTION (appears under API name in search)
```
Validate IBANs from ~80 countries with structured bank details — country, currency, bank code, and parsed account number — in a single API call. Batch up to 100 IBANs per request. Pure MOD-97 checksum validation, no external dependencies, sub-50ms response times.
```

## TAGS (10)
```
iban, iban-validation, iban-checker, bank-account, banking, finance, swift, fintech, payments, accounting
```

---

## LONG DESCRIPTION

```markdown
## What is IBAN Validator Pro?

**IBAN Validator Pro** validates International Bank Account Numbers (IBANs) against the ISO 13616 standard and returns **structured bank details** — country, currency, bank code, and parsed account number — in a single response. Covers ~80 countries in the official IBAN registry.

Unlike plain "valid / invalid" checkers, this API parses the IBAN into its structural components so you can use them directly in your invoicing, payments, or onboarding flows. Input is automatically normalized (spaces, dashes, lowercase — all handled).

Built for B2B applications that need to validate bank accounts on-the-fly: invoicing tools, payroll systems, onboarding forms, and anywhere you accept a customer's bank details.

## Use Cases

- **Invoicing & Accounting Software** — Validate a customer's IBAN at entry time. Auto-extract country and bank code. Reject malformed inputs before they hit your payment provider.
- **B2B Onboarding Forms** — Instant inline feedback on IBAN validity. Catch typos before they become support tickets.
- **Payroll & HR Tools** — Bulk-validate employee bank details when importing from spreadsheets. Batch up to 100 IBANs per request.
- **Payment Reconciliation** — Verify IBANs in bulk when importing bank statements or SEPA files.
- **Fintech & Banking Apps** — Pre-flight check before initiating a SEPA transfer to avoid rejected payments and failed-transaction fees.

## Why IBAN Validator Pro?

- ✅ **Structured response** — `country`, `country_name`, `currency`, `bank_code`, `account_number`, `formatted` — not just a boolean
- ✅ **~80 countries supported** — Full ISO 13616 registry coverage out of the box
- ✅ **Specific error codes** — `INVALID_FORMAT`, `INVALID_CHECKSUM`, `UNSUPPORTED_COUNTRY`, `TOO_SHORT`, `TOO_LONG` so you can show helpful messages
- ✅ **Input normalization** — Spaces, dashes, lowercase all handled automatically
- ✅ **Batch endpoint** — Validate up to 100 IBANs per request, results in input order
- ✅ **Sub-50ms response time** — Pure checksum math, no external API calls, no rate-limit cascades
- ✅ **No data leaks** — IBANs are never logged or stored. Stateless validation.

## Getting Started

1. Subscribe to a plan (Free tier: 100 requests/month)
2. Copy your RapidAPI key
3. POST your first IBAN:

```javascript
const response = await fetch('https://iban-validator-pro.p.rapidapi.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'iban-validator-pro.p.rapidapi.com'
  },
  body: JSON.stringify({ iban: 'DE89 3704 0044 0532 0130 00' })
});

const data = await response.json();
console.log(data);
```

## Response Format (Valid IBAN)

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
  "bic": null,
  "bank_name": null
}
```

## Response Format (Invalid IBAN)

```json
{
  "valid": false,
  "iban": "DE00000000000000000000",
  "error_code": "INVALID_CHECKSUM",
  "error": "IBAN checksum validation failed"
}
```

> **Note on BIC & bank_name:** v1 does not ship a BIC/bank-name registry — both fields are always `null`. We never fabricate these values. A future v2 may add optional BIC resolution.

## Batch Validation

Validate up to 100 IBANs in a single request (tier-dependent):

```javascript
await fetch('https://iban-validator-pro.p.rapidapi.com/api/v1/validate/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'iban-validator-pro.p.rapidapi.com'
  },
  body: JSON.stringify({
    ibans: ['DE89370400440532013000', 'GB82WEST12345698765432', 'INVALID_IBAN']
  })
});
```

Response:
```json
{
  "results": [ /* one result object per input, same order */ ],
  "total": 3,
  "valid_count": 2,
  "invalid_count": 1
}
```

## Supported Countries

All ~80 countries in the ISO 13616 IBAN registry — including all SEPA countries (EU + EEA + UK + CH + others), Middle East, North Africa, and Central Asia.

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `MISSING_FIELD` | 400 | Request body is missing the `iban` field |
| `BAD_REQUEST` | 400 | Malformed JSON or empty batch array |
| `INVALID_FORMAT` | 200 | Input does not match IBAN structure (`valid: false`) |
| `INVALID_CHECKSUM` | 200 | MOD-97 checksum failed (`valid: false`) |
| `UNSUPPORTED_COUNTRY` | 200 | Country code not in IBAN registry (`valid: false`) |
| `TOO_SHORT` / `TOO_LONG` | 200 | Length doesn't match country's expected length |
| `BATCH_LIMIT_EXCEEDED` | 422 | Batch size exceeds your plan's tier limit |
| `RATE_LIMITED` | 429 | Too many requests — respect `Retry-After` header |

## Rate Limits

Soft per-minute limit: **120 requests/minute** per API key (sliding window). Monthly quota depends on your subscription tier.

## About the Validation

IBAN validation uses the ISO 13616 standard — the same MOD-97 checksum algorithm used by banks worldwide. No external API calls, no VIES-style downtime risk, no rate-limit cascades. Pure mathematics means reliable sub-50ms response times.
```

---

## CODE EXAMPLE (JavaScript / Node.js)

```javascript
// Single IBAN validation
const response = await fetch('https://iban-validator-pro.p.rapidapi.com/api/v1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'iban-validator-pro.p.rapidapi.com'
  },
  body: JSON.stringify({ iban: 'DE89 3704 0044 0532 0130 00' })
});

const data = await response.json();

if (data.valid) {
  console.log(`Valid ${data.country_name} IBAN`);
  console.log(`Bank code: ${data.bank_code}`);
  console.log(`Account:   ${data.account_number}`);
  console.log(`Currency:  ${data.currency}`);
} else {
  console.log(`Invalid: ${data.error} (${data.error_code})`);
}
```

## CODE EXAMPLE (Python)

```python
import requests

response = requests.post(
    'https://iban-validator-pro.p.rapidapi.com/api/v1/validate',
    headers={
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'iban-validator-pro.p.rapidapi.com',
    },
    json={'iban': 'DE89 3704 0044 0532 0130 00'}
)

data = response.json()
print(data)
```

## CODE EXAMPLE (curl)

```bash
curl -X POST https://iban-validator-pro.p.rapidapi.com/api/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: iban-validator-pro.p.rapidapi.com" \
  -d '{"iban": "DE89 3704 0044 0532 0130 00"}'
```

---

## PRICING TIERS (to enter in RapidAPI Studio → Plans)

| Tier | Price | Quota | Hard cap? | Batch limit |
|---|---|---|---|---|
| **BASIC (Free)** | $0/mo | 100 req/mo | Yes | no batch |
| **PRO** | $9/mo | 1,000 req/mo | soft, overage $5 / 1k | 10 per batch |
| **ULTRA** | $29/mo | 10,000 req/mo | soft, overage $5 / 1k | 100 per batch |
| **MEGA** | $99/mo | 100,000 req/mo | soft, overage $3 / 1k | 100 per batch |

**Rate limit on all tiers:** 120 req/min (sliding window)

> RapidAPI tier names (`BASIC`, `PRO`, `ULTRA`, `MEGA`) are sent via the `x-rapidapi-subscription` header and mapped internally to our batch-limit logic (`FREE → 0`, `BASIC → 10`, `PRO → 100`, `ULTRA/MEGA → BUSINESS → 100`).

---

## SEO KEYWORDS (for RapidAPI search ranking)

Primary: `iban validation`, `iban checker`, `bank account validation`
Secondary: `iban validator`, `iban api`, `sepa validation`, `bank account verification`
Long-tail: `validate iban api`, `iban checksum validator`, `batch iban validation`, `iso 13616 validator`
