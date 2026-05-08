---
name: a17-analiza-odbiorcow
description: Użyj tego skilla gdy AdOps chce zobaczyć które segmenty odbiorców przynoszą najlepsze wyniki, jak rozkłada się performance po urządzeniach, typach treści i godzinach. Triggery: "które segmenty działają", "analiza odbiorców", "kto ogląda reklamę", "performance po segmentach", "audience performance", "który target działa", "najlepsza grupa", "gdzie performance jest najwyższy".
version: 1.0.0
quality_score: 9
---

# A17 — Analiza segmentów odbiorców

Które grupy odbiorców przynoszą najlepsze wyniki — by skuteczniej alokować budżet.

## Cel

Zidentyfikować top-performing i underperforming segmenty i podać konkretny % budżetu do przesunięcia.

## Kroki wykonania

### 1. Pobierz dane z MCP (3 raporty równolegle)

**Raport 1 — Urządzenia:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `TOTAL_CONVERSIONS`, `ECPA_USD` — last_30_days lub campaign_to_date.

**Raport 2 — Środowisko i pora dnia (jeśli dostępna):**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `ENVIRONMENT`, `SUPPLY_SOURCE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — last_30_days.

**Raport 3 — Geo segmenty:**
dims: `CAMPAIGN_NAME`, `COUNTRY`, `REGION`, `CITY` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH` — last_30_days.

**Edge case:** Jeśli TOTAL_CONVERSIONS = 0 lub niedostępne — oceń performance przez CTR × viewability (proxy efektywności bez piksela).

### 2. Oblicz performance score per segment

Agent oblicza samodzielnie:

```
# Bez danych konwersji:
efficiency_score = CTR × (VIEWABILITY / 100) × 10 000

# Z danymi konwersji:
efficiency_score = (TOTAL_CONVERSIONS / IMPRESSIONS) × 10 000   [konwersje per 10k wyświetleń]
cost_efficiency  = TOTAL_CONVERSIONS / TOTAL_SPEND_USD           [konwersje per $]

# Kategoryzacja segmentu:
mediana_score = mediana efficiency_score dla segmentów z ≥50 000 impressions

KATEGORIA:
  score > 1,5 × mediana  → 🚀 TOP — zwiększ budżet
  score 0,75–1,5 × med.  → 👀 OK — utrzymaj
  score < 0,75 × mediana → 🔻 SŁABY — rozważ zmniejszenie
  impressions < 50 000   → 📊 Za mało danych

# Potencjał przesunięcia:
spend_słabych    = suma TOTAL_SPEND_USD segmentów 🔻
spend_do_TOP     = spend_słabych × 0,5   [rekomendacja: przesuń 50% budżetu ze słabych do TOP]
```

### 3. Przygotuj output

```
👥 ANALIZA SEGMENTÓW ODBIORCÓW — Nike Air Max (kwiecień 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFORMANCE PER URZĄDZENIE:

Urządzenie   | Spend   | Imp.    | CTR    | Viewab. | Score  | Ocena
─────────────────────────────────────────────────────────────────────
Mobile       | $14 200 | 2,8M   | 0,17%  | 71%     | 12,1   | 🚀 TOP
Desktop      |  $7 400 | 1,1M   | 0,10%  | 64%     |  6,4   | 👀 OK
Tablet       |  $2 100 |  220k  | 0,06%  | 58%     |  3,5   | 🔻 Słaby
CTV          |    $700 |   80k  | 0,04%  | 89%     |  3,6   | 📊 Za mało danych

→ Mobile generuje 2× wyższy score przy 57% budżetu. Tablet ($2 100) — najniższy score,
  kandydat do zmniejszenia lub wykluczenia.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE PER ŚRODOWISKO:

Środowisko        | Spend   | CTR    | Viewab. | Score  | Ocena
────────────────────────────────────────────────────────────────
Web (strony)      | $18 100 | 0,14%  | 67%     |  9,4   | 👀 OK
App (aplikacje)   |  $5 400 | 0,19%  | 74%     | 14,1   | 🚀 TOP
CTV (Smart TV)    |    $900 | 0,03%  | 91%     |  2,7   | 📊 Za mało danych

→ Aplikacje mobilne osiągają o 50% wyższy score niż strony — przy tylko 22% budżetu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 5 MIAST PO EFEKTYWNOŚCI:

Miasto      | Spend   | CTR    | Efektyw. | Ocena
──────────────────────────────────────────────────
Kraków      | $3 100  | 0,21%  |   1,4×   | 🚀 TOP — niedofinansowany
Wrocław     | $2 200  | 0,18%  |   1,2×   | 🚀 TOP
Warszawa    | $9 800  | 0,13%  |   1,0×   | 👀 Baseline
Łódź        | $1 100  | 0,09%  |   0,6×   | 🔻 Słaby
Katowice    |   $800  | 0,07%  |   0,5×   | 🔻 Słaby

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJE ALOKACJI BUDŻETU:

🚀 Zwiększ o ~$2 800/mies.:
  • Mobile — score 2× wyższy niż desktop, niedofinansowany vs wyniki
  • Aplikacje mobilne — score 50% wyższy niż web
  • Kraków + Wrocław — niedofinansowane przy wysokim CTR

🔻 Zmniejsz o ~$2 800/mies.:
  • Tablet — najniższy score, $2 100/mies. można przesunąć
  • Katowice + Łódź — poniżej 0,75× mediany efektywności

Oczekiwany efekt: +8–12% CTR kampanii przy tym samym budżecie.
```

**Edge case — brak danych konwersji:**

```
ℹ️ Brak danych konwersji (piksel nieaktywny) — ocena na podstawie CTR × widoczność.
   Wyniki są szacunkowe. Dla pełnej analizy zwrot z inwestycji (ROAS/CPA) wdróż piksel śledzący.
```

## Zasady

- Minimum 50 000 impresji per segment żeby oceniać — mniej = "za mało danych"
- Zawsze podaj konkretny $ do przesunięcia, nie tylko "zwiększ mobile"
- Jeśli brak piksela — powiedz wprost i użyj CTR × viewability jako proxy
- Kraków/Wrocław często niedofinansowane vs Warszawa — sprawdź systematycznie
- Rekomendacja przesunięcia budżetu: max 50% ze słabego segmentu w jednej iteracji
- Zakończ prognozowanym efektem: "oczekiwany wzrost CTR o X%"
