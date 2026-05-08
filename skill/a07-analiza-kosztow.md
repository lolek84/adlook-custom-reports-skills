---
name: a07-analiza-kosztow
description: Użyj tego skilla gdy AdOps chce sprawdzić efektywność kosztową kampanii, eCPM, eCPC, eCPA, optymalizację kosztów. Triggery: "sprawdź koszty", "eCPM rośnie", "drogo płacimy za kliknięcia", "optymalizuj koszty", "CPA ponad KPI", "koszt za wysoki", "eCPM spike", "dlaczego tyle płacimy", "analiza kosztów".
version: 1.0.0
quality_score: 9
---

# A07 — Analiza kosztów (eCPM / eCPC / eCPA)

Efektywność kosztowa kampanii — czy płacimy właściwą cenę za wynik i gdzie przepłacamy.

## Cel

Zidentyfikować outlierów kosztowych i wskazać konkretne działania z szacowaną oszczędnością.

## Kroki wykonania

### 1. Pobierz dane z MCP (3 raporty równolegle)

**Raport główny:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_BIDDING_MODEL`, `LINE_ITEM_PRIMARY_GOAL_NAME`, `LINE_ITEM_PRIMARY_GOAL_VALUE` + metrics: `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `ECPCV_USD`, `TOTAL_SPEND_USD`, `IMPRESSIONS`, `CLICKS`, `TOTAL_CONVERSIONS` — last_14_days.

**Raport supply vs koszt:**
dims: `CAMPAIGN_NAME`, `SUPPLY_SOURCE`, `CREATIVE_TYPE`, `DEVICE_TYPE` + metrics: `ECPM_USD`, `ECPC_USD`, `TOTAL_SPEND_USD`, `IMPRESSIONS` — last_14_days.

**Raport trend 14 dni:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DATE` + metrics: `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `TOTAL_SPEND_USD` — last_14_days.

**Edge case:** Jeśli `LINE_ITEM_PRIMARY_GOAL_VALUE` = null lub 0 — nie możesz obliczyć efektywności vs cel. Zaraportuj: `⚠️ Brak zdefiniowanego KPI dla tego LI — analizuję vs benchmark rynkowy zamiast celu kampanii.`

### 2. Benchmarki i progi alarmowe

| Format | Typowy eCPM | 🟡 Obserwuj | 🔴 Alarm |
|---|---|---|---|
| Display standard | $1,00–3,00 | >$4,00 | >$6,00 |
| Rich media | $3,00–8,00 | >$10,00 | >$15,00 |
| Video pre-roll | $5,00–15,00 | >$18,00 | >$25,00 |
| CTV | $15,00–30,00 | >$35,00 | >$50,00 |

### 3. Oblicz efektywność vs cel i znajdź outlierów

Agent oblicza samodzielnie:

```
dla każdego LI z celem:
  if BIDDING_MODEL = "CPC":  efektywność = LINE_ITEM_PRIMARY_GOAL_VALUE / ECPC_USD
  if BIDDING_MODEL = "CPA":  efektywność = LINE_ITEM_PRIMARY_GOAL_VALUE / ECPA_USD
  if BIDDING_MODEL = "CPM":  efektywność = benchmark_eCPM / ECPM_USD
  # efektywność > 1.0 = poniżej celu kosztowego (dobrze)
  # efektywność < 1.0 = powyżej celu (przepłata)

trend_eCPM        = porównaj eCPM z 1. tygodnia vs 2. tygodnia (delta%)
najdrozsze_combo  = SUPPLY_SOURCE + CREATIVE_TYPE z najwyższym ECPM i >5% budżetu
najtansze_combo   = SUPPLY_SOURCE + CREATIVE_TYPE z najniższym ECPM i >5% budżetu
```

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
💰 ANALIZA KOSZTÓW — Nike Air Max (14 dni: 25 kwi – 8 maj 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KOSZTY OGÓLNE:
  eCPM średni:   $2,40  🟢  (benchmark display: $1–3)
  eCPC średni:   $0,82  🟡  (cel: $0,60 — przekroczony o 37%)
  eCPA:          n/d    (brak piksela konwersji)

  Trend eCPM (tydzień 1 vs tydzień 2):
  Tydz. 1: $2,10 | Tydz. 2: $2,90 → wzrost +38% 🔴  — sprawdź co się zmieniło

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EFEKTYWNOŚĆ vs CEL (per line item):

  LI                    Model  Cel     Rzecz.  Efektywnść  Ocena
  ─────────────────── ─────── ─────  ───────  ──────────  ──────
  Remarketing_Desktop CPC     $0,60   $0,52   115%  🟢    poniżej celu (dobrze)
  Prospecting_Mobile  CPC     $0,60   $1,24    48%  🔴    2× drożej niż cel
  Display_Broad       CPC     $0,60   $0,71    85%  🟡    lekko powyżej celu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAJDROŻSZE KOMBINACJE (outlierzy):

  Supply Source    Format    eCPM   % budżetu  Uwaga
  ──────────────  ────────  ─────  ─────────  ─────────────────────
  Magnite         display   $5,80    18%       🔴 2,4× powyżej avg — kandydat do redukcji
  Index Exchange  display   $3,90    12%       🟡 lekko powyżej normy

NAJTAŃSZE + EFEKTYWNE:

  Supply Source    Format    eCPM   CTR     Viewab.  Uwaga
  ──────────────  ────────  ─────  ──────  ───────  ─────────────────
  Google AdX       display   $1,80   0,14%   71%     🟢 najlepsza relacja cena/jakość
  Xandr            display   $2,10   0,12%   68%     🟢 dobry wynik

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJE:

  □ 1. [DZIŚ]  Prospecting_Mobile — eCPC $1,24 vs cel $0,60 (2×)
               Działanie: zmień bid floor z CPC na CPM $2,00 lub zmień strategię biddingu
               Oczekiwana oszczędność: ~$340/tydzień przy 30% redukcji CPC

  □ 2. [DZIŚ]  Magnite eCPM $5,80 (18% budżetu) — zbadaj czy wyniki uzasadniają premium
               Działanie: jeśli CTR i viewability nie są wyraźnie wyższe → ogranicz udział do 5%
               Oczekiwana oszczędność: ~$420/tydzień

  □ 3. [TYDZIEŃ] Wzrost eCPM +38% w tygodniu 2 — ustal przyczynę
               Sprawdź: czy zmieniono bid floor, targetowanie lub dodano nowy supply source?
```

## Zasady

- eCPM rośnie ≠ automatyczny problem — może rosnąć przy wyższej viewability lub lepszym CTR
- Zawsze porównaj do `LINE_ITEM_PRIMARY_GOAL_VALUE` jeśli dostępny — to prawdziwy KPI
- Szukaj outlierów: jeden SSP z 2–3× wyższym eCPM bez wyraźnie lepszych wyników to kandydat
- Każda rekomendacja = konkretna kwota oszczędności (uzasadnia działanie)
- Trend 14-dniowy jest ważniejszy niż pojedyncza wartość — jedno drogi dzień to szum, trend to sygnał
