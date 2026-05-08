---
name: a16-overpacing-alert
description: Użyj tego skilla gdy AdOps chce wykryć kampanie które wydają za szybko, overpacing, ryzyko wyczerpania budżetu przed terminem. Triggery: "kampania wydaje za szybko", "overpacing", "budżet się skończy za wcześnie", "kontrola wydatków", "overspend alert", "kampania over pace", "za szybko wydajemy", "pacing za wysoki".
version: 1.0.0
quality_score: 9
---

# A16 — Overpacing alert i kontrola wydatków

Wykrycie kampanii które wydają za szybko — działania zanim skończy się budżet przed terminem.

## Cel

Lista kampanii overpacing z prognozą wyczerpania budżetu i konkretną wartością daily cap do ustawienia.

## Kroki wykonania

### 1. Pobierz dane z MCP (2 raporty równolegle)

**Raport dzienny (last_7_days):**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`, `DATE` + metrics: `TOTAL_SPEND_USD`, `IMPRESSIONS` — last_7_days.

**Raport całkowity (campaign_to_date):**
Ten sam zestaw bez `DATE` — do obliczenia łącznych wydatków od startu.

**Edge case:** Jeśli `CAMPAIGN_BUDGET` = 0 lub null — pomiń tę kampanię i zaraportuj: `⚠️ Kampania [NAZWA] — brak budżetu w danych, nie można obliczyć pacingu.`

### 2. Oblicz pacing i prognozę

Agent oblicza samodzielnie:

```
spend_total         = TOTAL_SPEND_USD (campaign_to_date)
budget              = CAMPAIGN_BUDGET
pozostało_budżetu   = budget − spend_total

dni_upłynęło        = dziś − CAMPAIGN_START_DATE
dni_całkowite       = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
dni_pozostałe       = CAMPAIGN_END_DATE − dziś

oczekiwany_pacing%  = (dni_upłynęło / dni_całkowite) × 100
rzeczywisty_pacing% = (spend_total / budget) × 100
delta               = rzeczywisty_pacing% − oczekiwany_pacing%

tempo_7d            = TOTAL_SPEND_USD_last7d / 7         ($/dzień, ostatni tydzień)
projected_total     = spend_total + (tempo_7d × dni_pozostałe)
dni_do_wyczerpania  = pozostało_budżetu / tempo_7d       (przy obecnym tempie)

# ALERT jeśli:
  delta > +15%  OR  projected_total > budget × 1.05

# Recommended daily cap (z 5% buforem bezpieczeństwa):
  recommended_cap = (pozostało_budżetu × 0.95) / dni_pozostałe
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
⚡ OVERPACING ALERT  |  czw 8 maja 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KAMPANIE OVERPACING (2):

  🔴 Rossmann Oferty — delta pacing: +22% (krytyczny overpacing)

     Budżet:        $15 000
     Wydano:        $11 200  (75%)
     Oczekiwano:    $8 200   (55%)  ← o 20 pp za dużo
     Pozostało:     $3 800

     Tempo last 7d: $920/dzień
     Prognoza:      wyda łącznie ~$18 400 przy budżecie $15 000 (nadwyżka $3 400)
     ⚠️ Budżet wyczerpie się za ~4 dni (14 maja) — planowane zakończenie: 31 maja

     📋 Działanie: ustaw daily cap = $180/dzień
        (pozostało $3 800 × 95% bufor / 20 dni = $180.50/dz)
        Uwaga: znaczące ograniczenie tempa — sprawdź czy klient akceptuje

  🟡 H&M Wiosna — delta pacing: +17% (lekki overpacing)

     Budżet:        $20 000
     Wydano:        $12 400  (62%)
     Oczekiwane:    $10 000  (50%)  ← o 12 pp za dużo
     Pozostało:     $7 600

     Tempo last 7d: $630/dzień
     Prognoza:      wyda ~$22 900 przy budżecie $20 000 (nadwyżka $2 900)
     ⚠️ Budżet wyczerpie się za ~12 dni (20 maja) — planowane zakończenie: 31 maja

     📋 Działanie: ustaw daily cap = $310/dzień
        (pozostało $7 600 × 95% / 23 dni = $313/dz, zaokrąglij do $310)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ KAMPANIE W NORMIE (6): pacing delta w przedziale −5% do +5%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LISTA DZIAŁAŃ:

  □ [DZIŚ]   Rossmann Oferty — ustaw daily cap $180/dz (obecny: brak cappa)
  □ [DZIŚ]   H&M Wiosna — ustaw daily cap $310/dz (obecny: brak cappa)
  □ [DZIŚ]   Powiadom klienta Rossmann — budżet skończy się 14 maja zamiast 31 maja
  □ [JUTRO]  Sprawdź czy daily cap na Rossmann nie blokuje delivery — monitoruj pacing
```

**Jeśli brak overpacingu:**
```
✅ OVERPACING ALERT  |  czw 8 maja 2026

  Brak kampanii z overpacingiem (delta pacing ≤ +15% dla wszystkich 8 kampanii).
  Następne sprawdzenie: jutro w ramach daily health check.
```

## Zasady

- Recommended daily cap obliczaj z 5% buforem bezpieczeństwa: `cap = pozostały_budżet × 0,95 / dni_pozostałe`
- Powiadom klienta jeśli budżet wyczerpie się >5 dni przed planowanym terminem
- Overpacing może być celowy ("acceleration" przed końcem kampanii) — sprawdź z klientem
- Zawsze podaj dzień wyczerpania budżetu przy obecnym tempie — to najważniejsza informacja
- Znaczące ograniczenie tempa (>50% redukcji dziennej) zawsze wymaga zgody klienta
- Progi alertów (system-wide): delta <−15% = 🔴 underpacing; −15% do −5% = 🟡; ±5% = 🟢 OK; +5% do +15% = 🟡 overpacing; >+15% = 🔴 krytyczny overpacing
- Projekcja wyczerpania budżetu i rekomendacja daily cap → patrz też skill K13 (projekcja spend klienta)
