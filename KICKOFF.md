# IBAN Validator Pro — Kickoff

**Status:** Planning
**Erstellt:** 2026-04-16
**Owner:** Arthur

---

## Phase 1: Markt-Validierung ✅

| Kriterium | Antwort | Status |
|---|---|---|
| Direkte Konkurrenten auf RapidAPI | Nicht im Scraper-Output (< 5 echte APIs) | ✅ |
| Popularity Score Top-Konkurrenten | Alle 0.0, alle 0 Subscribers | ✅ |
| Klare Differenzierung möglich? | Ja — siehe unten | ✅ |
| Zahlungsbereitschaft bewiesen? | Ja (ibanapi.com, IBANapi.com, openiban.com verdienen Geld) | ✅ |
| Rechtliche Risiken? | Niedrig — ISO 13616 ist öffentlicher Standard, keine externe Datenquelle nötig | ✅ |

**Fazit:** Geringe Konkurrenz auf RapidAPI, bewiesene Zahlungsbereitschaft außerhalb, technisch einfachste API im Portfolio — klares Go.

### Differenzierungsstrategie
1. **Multi-Format Support** — IBAN validieren + BIC/SWIFT-Code ableiten + Bank-Name zurückgeben (die meisten Konkurrenten liefern nur valid/invalid)
2. **Strukturierte Bankdaten** — `{ valid, iban, bic, bank_name, country, currency, account_number, bank_code }` statt roher Validierung
3. **Batch-Endpoint** — bis zu 100 IBANs in einem Request (Pain Point bei Buchhaltungs-Importen)
4. **Formatierung** — IBAN normalisieren (Leerzeichen entfernen, Großbuchstaben) bevor validiert wird
5. **Cross-Selling** — gleiche Zielgruppe wie VAT Validator Pro → natürlicher Upsell

---

## Phase 2: Technischer Ansatz

| Frage | Antwort |
|---|---|
| Was tut der Core-Endpoint? | IBAN-String → `{ valid, iban, bic, bank_name, country, currency, account_number, bank_code }` |
| Externe Datenquelle | Keine externe API nötig — ISO 13616 Validierungslogik (Checksum) + statische IBAN-Registry (JSON) |
| Puppeteer nötig? | **Nein** |
| Datenbank nötig? | **Ja** — Upstash Redis für Caching + Rate-Limiting (gleich wie VAT) |
| Async oder synchron? | Synchron (Single), Async optional (Batch) |
| Geschätzte Response-Zeit | < 50ms (cached) / 50–150ms (fresh — reine Berechnung, kein ext. Call) |
| Größtes technisches Risiko | **IBAN-Registry Vollständigkeit** — nicht alle Länder sind gleich gut dokumentiert. Mitigation: Top-30 Länder in v1, Rest mit Basis-Checksum |

### Kein Spike nötig
IBAN-Validierung ist reine Mathematik (MOD-97) + statische Lookup-Tabellen. Kein externes System, kein Downtime-Risiko. Direkt bauen.

### Datenquelle für Bankdaten
- **IBAN-Struktur pro Land:** ISO 13616 Registry (öffentlich, ~80 Länder)
- **BIC/Bank-Name Mapping:** Open-Source Datenbanken (z.B. `iban-js`, `ibantools`) oder eigene JSON-Datei
- **Statisch eingebettet** als JSON im Projektordner — kein externer API-Call, kein Ausfallrisiko

---

## Phase 3: API-Design (Endpoints)

**3 Endpoints für v1:**

1. `POST /api/v1/validate` — Single IBAN
2. `POST /api/v1/validate/batch` — Multi IBAN (bis zu 100)
3. `GET /api/health` — Health Check

### Request / Response Schema

**Single Validate:**
```json
// Request
{ "iban": "DE89 3704 0044 0532 0130 00" }

// Response 200 — valid
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

// Response 200 — invalid
{
  "valid": false,
  "iban": "DE00000000000000000000",
  "error_code": "INVALID_CHECKSUM",
  "error": "IBAN checksum validation failed"
}

// Response 400 — bad input
{ "error": "Missing required field: iban", "code": "MISSING_FIELD" }
```

### Core-Regeln
- Input normalisieren: Leerzeichen + Bindestriche entfernen, Großbuchstaben
- Alle Error-Responses: `{ error: string, code: string }`
- Header `X-RateLimit-Remaining` bei jedem Response
- BIC + Bank-Name nur wenn bekannt — sonst `null` (nicht faken!)

---

## Phase 4: Pricing-Tiers

| Tier | Preis/Monat | Requests/Monat | Batch? | Zielgruppe |
|---|---|---|---|---|
| Free | $0 | 100 | ❌ | Testing, Hobby |
| Basic | $9 | 1.000 | ✅ (max 10/batch) | Indie-Entwickler, Freelancer |
| Pro | $29 | 10.000 | ✅ (max 100/batch) | Kleine Firmen, SaaS-Startups |
| Business | $99 | 100.000 | ✅ (max 100/batch) | Buchhaltungs-SaaS, Agenturen |

**Overage:** $5 pro 1.000 zusätzliche Requests
**Orientierung:** ibanapi.com nimmt $19–99/mo → wir sind günstiger mit mehr Features

---

## Phase 5: RapidAPI Listing Vorbereitung

| Feld | Inhalt |
|---|---|
| API Name | **IBAN Validator Pro** |
| Kategorie (RapidAPI) | Finance → Financial / Data |
| Tagline (max 60 Zeichen) | "Validate IBANs & get bank details in one call" (46) |
| Zielgruppe | Entwickler von Buchhaltungs-, Invoicing-, Payment-, Banking-SaaS |
| Hauptuse-Case | IBAN validieren + BIC + Bank-Name strukturiert zurückbekommen für Rechnungsstellung & Zahlungsabwicklung |
| 3 SEO-Keywords | `iban validation`, `iban checker`, `bank account validation` |
| Differenzierung | Einzige API die Validierung + BIC + Bank-Name + strukturierte Kontodaten in einem Response liefert, mit Batch-Support |

---

## Phase 6: Infrastruktur-Checkliste

- [ ] Neues GitHub-Repo `arrijr/iban-validator` anlegen
- [ ] Vercel-Projekt konnektieren (Region: `fra1`)
- [ ] Upstash Redis erstellen (Free Tier reicht für Start)
- [ ] Environment Variables:
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `RAPIDAPI_PROXY_SECRET`
  - [ ] `SENTRY_DSN`
- [ ] Rate-Limiting: Upstash `@upstash/ratelimit` (sliding window)
- [ ] Lazy Redis-Initialisierung (siehe APIs/CLAUDE.md Boilerplate)
- [ ] Sentry Free Tier eingerichtet
- [ ] Health Check: `GET /api/health → { status: "ok", timestamp }`
- [ ] Logo: `public/logo.svg` — Kürzel `IBAN`, gleiche Farben wie VAT + postshot

---

## Open Questions

- [x] BIC-Datenbank: **`ibantools` npm package** — gut gepflegt, MIT-Lizenz, deckt ~80 Länder ab
- [x] Länderabdeckung v1: **Alle ~80 ISO-Länder** via ibantools (kommt automatisch mit)
- [x] Sollen wir `bank_name` weglassen wenn nicht in DB? → **`null` zurückgeben** (nie faken)

---

## Nächste Schritte

1. Open Questions beantworten
2. Next.js Projekt scaffolden (wie VAT — gleicher Boilerplate)
3. IBAN-Validierungslogik implementieren (MOD-97 + Länder-Registry)
4. `/api-review` nach erstem funktionierenden Endpoint
5. `/rapidapi-listing` wenn MVP steht
6. `/api-launch` Checkliste vor Go-Live
