---
name: a01-daily-health-check
description: Użyj tego skilla gdy AdOps pyta o poranny przegląd kampanii, daily check, alerty na dziś, status wszystkich kampanii. Triggery: "daily check", "poranny przegląd", "co się dzieje z kampaniami", "alerty na dziś", "pokaż mi wszystko", "morning check", "dziennik kampanii", "co sprawdzić dziś rano".
version: 1.0.0
quality_score: 9
---

# A01 — Daily health check

Poranny przegląd wszystkich aktywnych kampanii — pacing, anomalie, alerty. Punkt startowy dnia.

## Cel

Szybki przegląd wszystkich kampanii przed rozpoczęciem dnia pracy — identyfikacja tego co wymaga natychmiastowej uwagi.

## Kroki wykonania

### 1. Pobierz listę advertiserów

Wywołaj `list_advertisers` aby uzyskać aktywnych klientów.

**Edge case:** Jeśli `list_advertisers` zwraca pustą listę lub błąd — zatrzymaj się i zaraportuj: `⚠️ Nie można pobrać listy advertiserów. Sprawdź połączenie z MCP lub uprawnienia API.`

### 2. Pobierz dane kampanii (2 raporty równolegle)

**Raport A — yesterday:**
`run_report_preview` z dims: `ADVERTISER_NAME`, `CAMPAIGN_NAME`, `CAMPAIGN_STATUS`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`, `LINE_ITEM_NAME`, `LINE_ITEM_STATUS` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — date_range: yesterday.

**Raport B — last_7_days:**
Ten sam zestaw za last_7_days — do obliczenia trendów i średnich baseline.

**Edge case:** Jeśli kampania ma CAMPAIGN_STATUS = INACTIVE lub ENDED — pomijaj w głównym raporcie, policz je jako "nieaktywne: N".

### 3. Oblicz pacing dla każdej kampanii

Agent oblicza samodzielnie:

```
dni_od_startu       = dziś − CAMPAIGN_START_DATE
dni_całkowite       = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
pacing_oczekiwany%  = (dni_od_startu / dni_całkowite) × 100
pacing_rzeczywisty% = (TOTAL_SPEND_USD / CAMPAIGN_BUDGET) × 100
delta               = pacing_rzeczywisty% − pacing_oczekiwany%

STATUS:
  delta < −15%  → 🔴 UNDERPACING (krytyczny)
  delta < −5%   → 🟡 UNDERPACING (lekki)
  delta > +15%  → 🟡 OVERPACING
  pozostałe     → 🟢 OK
```

### 4. Wykryj alerty automatycznie

Sprawdź każdą kampanię/LI i flaguj:

| Warunek | Alert | Priorytet |
|---|---|---|
| IMPRESSIONS_yesterday = 0 AND LINE_ITEM_STATUS = ACTIVE | 🚨 ZERO DELIVERY | P0 — natychmiastowe działanie |
| delta_pacing < −15% | 🔴 UNDERPACING | P1 |
| CTR_yesterday > 2× CTR_7d_avg | ⚡ CTR SPIKE | P1 — sprawdź fraud |
| CTR_yesterday < 0.5× CTR_7d_avg | 📉 CTR DROP | P2 |
| VIEWABILITY_yesterday < 40% | 👁 LOW VIEWABILITY | P2 |
| delta_pacing > +15% | 🟡 OVERPACING | P2 |

### 5. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🌅 DAILY HEALTH CHECK — czw 8 maja 2026, godz. 08:42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 ALERTY (2) — wymagają działania dziś:

  P0 │ 🚨 ZERO DELIVERY
     │ Nike Air Max › LI: Prospecting_Mobile
     │ Status: ACTIVE, wczoraj: 0 impresji (norma: ~85k/dz)
     │ Działanie: sprawdź targeting, kreacje i bid — prawdopodobnie zbyt restrykcyjny frequency cap

  P1 │ ⚡ CTR SPIKE
     │ Adidas Running › LI: Remarketing_Desktop
     │ CTR wczoraj: 1,84% vs avg 7d: 0,11% — wzrost 16×
     │ Działanie: sprawdź domeny z najwyższym CTR — możliwy ruch botowy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATUS KAMPANII (8 aktywnych):

🟢 OK (5):
  Nike Air Max       pacing 74% | oczek. 73% | Δ+1%  | $920/dz | CTR 0,12% | viewab. 68%
  Samsung Galaxy     pacing 51% | oczek. 50% | Δ+1%  | $650/dz | CTR 0,09% | viewab. 71%
  Żywiec Zdrój       pacing 88% | oczek. 85% | Δ+3%  | $280/dz | CTR 0,08% | viewab. 62%
  H&M Wiosna         pacing 62% | oczek. 60% | Δ+2%  | $510/dz | CTR 0,14% | viewab. 65%
  PKO BP Kredyty     pacing 45% | oczek. 46% | Δ−1%  | $380/dz | CTR 0,07% | viewab. 74%

🟡 OBSERWACJA (2):
  Adidas Running     pacing 38% | oczek. 50% | Δ−12% | $390/dz | ⚡ CTR SPIKE — patrz alert
  Rossmann Oferty    pacing 91% | oczek. 70% | Δ+21% | $920/dz | OVERPACING — wyda budżet ~4 dni przed końcem → patrz A16

🔴 WYMAGA DZIAŁANIA (1):
  Nike Air Max › LI  pacing  0% | oczek. 73% | Δ−73% | 0 imp.  | ZERO DELIVERY — patrz alert P0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aktywnych kampanii: 8 | LI aktywnych: 23 | Alertów: 2 | Nieaktywnych (pominięto): 4
```

**Jeśli brak alertów**, zamień sekcję alertów na:
```
✅ ALERTY (0) — wszystkie kampanie w normie, brak anomalii wczoraj
```

**Działania dla każdego typu alertu (dołącz do alertu):**
- `ZERO DELIVERY` → "Sprawdź: (1) targeting zbyt wąski? (2) kreacje odrzucone? (3) bid poniżej floor price? (4) frequency cap wyczerpany?" → uruchom A02
- `CTR SPIKE` → "Sprawdź top domeny po CTR z wczoraj — jeśli landing_rate <20%, prawdopodobny ruch botowy. Wyklucz domenę." → uruchom A03
- `CTR DROP` → "Sprawdź czy nie zmieniono kreacji lub targetowania. Porównaj CTR per kreacja yesterday vs 7d." → uruchom A03
- `UNDERPACING` → "Opcje: (1) zwiększ bid floor o 15–20%, (2) rozszerz targetowanie, (3) sprawdź czy LI nie ma aktywnych konfliktów" → uruchom A02
- `OVERPACING` → "Ustaw daily cap = pozostały_budżet / dni_pozostałe = $[X]/dz" → uruchom A16
- `LOW VIEWABILITY` → "Sprawdź które domeny ciągną viewability w dół — wyklucz te poniżej 30%" → uruchom A04

## Zasady

- Priorytetuj alerty: P0 (ZERO_DELIVERY) > P1 (UNDERPACING, CTR_SPIKE) > P2 (reszta)
- Każdy alert musi zawierać: kampania, LI, konkretna wartość, gotowe działanie do podjęcia
- Sekcja STATUS: sortuj malejąco według priorytetu (🔴 → 🟡 → 🟢)
- Jeśli kampania kończy się za ≤3 dni — oznacz `⏰ KOŃCZY SIĘ [DATA]`
- Jeśli kampania ma 0 impresji przez cały poprzedni dzień — sprawdź czy CAMPAIGN_STATUS nie zmienił się na PAUSED lub ENDED nieoczekiwanie
- Czas generowania raportu wpisz na końcu — pomaga trackować freshness danych
- Cross-reference: każdy alert w sekcji DZIAŁANIA wskazuje skill diagnostyczny (A02, A03, A04, A16)
