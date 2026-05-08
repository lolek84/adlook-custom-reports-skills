---
name: k13-prognoza-realizacji
description: Użyj tego skilla gdy klient lub AdOps pyta czy kampania zdąży wydać budżet, ile wyświetleń osiągnie do końca, czy dotrzemy do celu. Triggery: "czy zdążymy wydać budżet", "ile osiągniemy do końca", "prognoza kampanii", "czy dotrzemy do celu", "ile impresji będzie", "czy kampania dowiezie", "kiedy skończy się budżet", "co osiągniemy do końca miesiąca".
version: 1.0.0
quality_score: 9
---

# K13 — Prognoza realizacji kampanii

Ile kampania osiągnie do końca przy obecnym tempie — konkretne liczby, nie ogólniki.

## Cel

Odpowiedzieć na pytanie "czy kampania dowiezie?" z prognozowanymi wartościami końcowymi i wariantami scenariuszy.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:** `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`

**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`, `REACH`, `CTR`, `VIEWABILITY`

**Date range:** campaign_to_date + last_7_days (do obliczenia aktualnego tempa).

**Edge case:** Jeśli kampania już się zakończyła — nie prognozuj, wywołaj K12 (raport końcowy). Zaznacz: *"Kampania zakończyła się [DATA]. Używam K12 zamiast K13."* Jeśli kampania jeszcze się nie rozpoczęła — odpowiedz: *"Kampania nie wystartowała — brak danych do prognozy. Sprawdź datę startu."* Jeśli CAMPAIGN_BUDGET = $0 lub niedostępny — pomiń obliczenia pacing% i zaznacz: *"Dane budżetowe niedostępne — prognoza wyświetleń dostępna, prognoza wydatków niedostępna."* Jeśli kampania ma <3 dni danych — zaznacz: *"Za mała próba (X dni) — prognoza może być bardzo niedokładna."*

### 2. Oblicz prognozy

Agent oblicza samodzielnie:

```
# Dane historyczne
dni_od_startu     = dziś − CAMPAIGN_START_DATE
dni_całkowite     = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
dni_pozostałe     = CAMPAIGN_END_DATE − dziś

# Tempo z ostatnich 7 dni (bardziej aktualne niż campaign_to_date)
spend_7d          = TOTAL_SPEND_USD (last_7_days)
impressions_7d    = IMPRESSIONS (last_7_days)
tempo_spend_$/dz  = spend_7d / 7
tempo_imp/dz      = impressions_7d / 7

# Dotychczasowe wyniki
spend_CTD         = TOTAL_SPEND_USD (campaign_to_date)
imp_CTD           = IMPRESSIONS (campaign_to_date)
pacing_actual%    = spend_CTD / CAMPAIGN_BUDGET × 100
pacing_expected%  = (dni_od_startu / dni_całkowite) × 100
delta             = pacing_actual − pacing_expected

# Prognoza końcowa (przy obecnym tempie)
projected_spend   = spend_CTD + (tempo_spend_$/dz × dni_pozostałe)
projected_imp     = imp_CTD + (tempo_imp/dz × dni_pozostałe)
utilization%      = projected_spend / CAMPAIGN_BUDGET × 100

# Scenariusz — kiedy skończy się budżet (jeśli overpacing)
dni_do_wyczerpania = (CAMPAIGN_BUDGET − spend_CTD) / tempo_spend_$/dz
data_wyczerpania   = dziś + dni_do_wyczerpania

# Status prognozy:
utilization% > 95  i utilization% ≤ 105  → 🟢 Na dobrej drodze
utilization% > 105                        → 🟡 Overpacing — skończy się za wcześnie
utilization% 80–95                        → 🟡 Lekkie niedofinansowanie
utilization% < 80                         → 🔴 Underpacing — nie dowiezie
```

### 3. Przygotuj output

**Dla klienta:**

```
📊 PROGNOZA REALIZACJI — Nike Air Max
Kampania trwa do 30 maja 2026 (8 dni pozostało)

Dotychczas:
  • Wydano: $18 400 z $25 000 (74%)
  • Wyświetlenia: 3 100 000

Prognoza do końca kampanii (przy obecnym tempie $820/dz):
  • Łączne wydatki: ~$24 960 z $25 000 (≈100%)
  • Łączne wyświetlenia: ~4 200 000

🟢 Kampania realizuje się zgodnie z planem.
   Budżet zostanie niemal w całości wykorzystany, a reklama dotrze
   do ok. 4,2 miliona wyświetleń do końca miesiąca.
```

**Dla AdOps:**

```
📊 PROGNOZA — Nike Air Max | pozostało 8 dni | 2026-05-08
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBECNE TEMPO (last 7d):
  Spend/dz:      $820   | Imp/dz:    387 500
  Pacing actual: 74%    | Oczekiwany: 72% | delta: +2% 🟢

PROGNOZA KOŃCOWA (przy tempie $820/dz × 8 dni):
  Projected spend:  $24 960 / $25 000   (99,8%) 🟢
  Projected imp:     4 200 000
  Projected reach:   1 820 000 (szacunek: reach/imp ratio × projected_imp)

STATUS: 🟢 Na dobrej drodze — budżet zostanie zrealizowany w 99,8%

WRAŻLIWOŚĆ:
  Jeśli tempo spadnie o 20% → utilization: 84% ($21 000) — niedofinansowanie $4 000
  Jeśli tempo wzrośnie o 15% → budżet wyczerpie się 27 maja (3 dni wcześniej)
```

**Wariant — Underpacing (prognoza <80%):**

```
📊 PROGNOZA — Adidas Running | pozostało 21 dni | 2026-05-08

OBECNE TEMPO (last 7d):
  Spend/dz:      $390   | Pacing actual: 43% | Oczekiwany: 57% | delta: −14% 🟡

PROGNOZA KOŃCOWA:
  Projected spend:  $16 590 / $30 000   (55%) 🔴 — nie dowiezie
  Niedobór:         $13 410 pozostanie niewydane przy obecnym tempie

STATUS: 🔴 Underpacing — kampania nie zrealizuje budżetu

Żeby wydać 100%: potrzeba $638/dz (obecnie $390/dz → wymagany wzrost o 64%)
Rekomendacja: diagnostyka underpacingu → A02
```

**Wariant — Overpacing (budżet skończy się za wcześnie):**

```
📊 PROGNOZA — H&M Wiosna | pozostało 14 dni | 2026-05-08

OBECNE TEMPO (last 7d):
  Spend/dz:      $1 420 | Pacing actual: 78% | Oczekiwany: 57% | delta: +21% 🟡

PROGNOZA KOŃCOWA:
  Budżet wyczerpie się: ~12 maja 2026 (za 4 dni) 🔴
  Pozostały budżet: $4 420 | Przy tempie $1 420/dz → 3,1 dnia

Rekomendacja: natychmiast zmniejsz dzienny cap do $316/dz
  (= $4 420 pozostałych / 14 dni) → A16
```

## Zasady komunikacji

- Prognoza bazuje na tempie z ostatnich 7 dni — napisz to wprost ("przy obecnym tempie")
- Zawsze podaj warianty wrażliwości dla AdOps: co jeśli tempo +/− 15–20%
- Dla klienta: zaokrąglaj do pełnych tysięcy (4 200 000, nie 4 183 750)
- Jeśli kampania ma <7 dni danych — zaznacz: "Za mała próba danych (X dni), prognoza może być niedokładna"
- Underpacing → zawsze zaproponuj A02; Overpacing → zawsze A16
- Nie prognozuj zakończonych kampanii — kieruj do K12
