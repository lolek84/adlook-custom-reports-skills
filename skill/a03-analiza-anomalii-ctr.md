---
name: a03-analiza-anomalii-ctr
description: Użyj tego skilla gdy AdOps zauważy anomalię CTR — nagły skok lub spadek CTR, podejrzenie fraudu. Triggery: "CTR spike", "CTR za wysoki", "CTR spada", "dziwny CTR na kampanii", "fraud CTR", "CTR anomalia", "CTR nagle wzrósł", "CTR bardzo wysoki", "podejrzane kliknięcia".
version: 1.0.0
quality_score: 9
---

# A03 — Analiza anomalii CTR

Wykrycie i diagnoza nagłego skoku lub spadku CTR — odróżnienie rzeczywistej zmiany od fraudu i szumu statystycznego.

## Cel

Zdiagnozować skąd pochodzi anomalia CTR i ocenić czy to fraud, zmiana kreacji czy naturalna fluktuacja — z konkretnym planem działania.

## Kroki wykonania

### 1. Pobierz dane historyczne (3 raporty równolegle)

**Raport trend 30 dni:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DATE` + metrics: `CTR`, `CLICKS`, `IMPRESSIONS`, `LANDING_RATE` — last_30_days.

**Raport domain breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `TOP_LEVEL_DOMAIN`, `DATE` + metrics: `CTR`, `CLICKS`, `IMPRESSIONS`, `LANDING_RATE` — last_14_days.

**Raport device/creative:**
dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `DEVICE_TYPE` + metrics: `CTR`, `CLICKS`, `LANDING_RATE` — last_14_days.

**Edge case:** Jeśli kampania ma <7 dni historii — zaraportuj: `⚠️ Za mała próba danych (<7 dni) do wiarygodnej analizy statystycznej. Porównuję do benchmarku formatu zamiast historii kampanii.`

### 2. Wykryj anomalię

Agent oblicza samodzielnie:

```
srednia_CTR     = średnia CTR za last_30d (bez ostatnich 2 dni)
std_CTR         = odchylenie standardowe CTR za last_30d
prog_spike      = srednia + 2 × std  (przekroczenie = anomalia)
prog_drop       = srednia − 2 × std  (zejście poniżej = anomalia)

dzien_anomalii  = dzień gdzie |CTR − srednia| > 2 × std
wartosc_delta   = CTR_anomalia − srednia_CTR
```

### 3. Diagnozuj: fraud vs. rzeczywista zmiana

**Wskaźniki fraudu (CTR spike) — im więcej spełnionych, tym pewniejsza diagnoza:**

| Sygnał | Próg | Waga diagnozy |
|---|---|---|
| Landing rate w dniu spike | <50% (boty klikają, nie wchodzą) | 🔴 Wysoka |
| CTR display | >2,0% | 🔴 Wysoka |
| Koncentracja na 1–3 domenach | >70% kliknięć z 1 domeny | 🔴 Wysoka |
| Spike w nocy (00:00–06:00) | nieproporcjonalne kliknięcia | 🟡 Średnia |
| Spike tylko w weekend | brak uzasadnienia biznesowego | 🟡 Średnia |

**Wskaźniki rzeczywistej zmiany:**
- Landing rate pozostaje wysoki (>70%) — realni użytkownicy wchodzą na stronę
- Nowa kreacja wdrożona dokładnie w dniu spike
- Spike równomierny po domenach (>10 domen z wyższym CTR)
- Zmiana targetowania lub bidu w dniu spike

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
⚡ ANALIZA CTR SPIKE — Adidas Running › LI: Remarketing_Desktop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WYKRYTA ANOMALIA:
  Typ:          CTR SPIKE 🔴
  Dzień:        wt 6 maja 2026
  CTR w tym dniu: 1,84%  vs  średnia 30d: 0,11%  (wzrost 16×, +1,73 pp)
  Próg anomalii:  0,28%  (średnia + 2σ)

DIAGNOZA: 🔴 PROBABLE FRAUD (pewność: wysoka)

Dowody:
  ✗ Landing rate 6 maja:   8%  (norma: 74%)  → kliknięcia nie docierają na stronę
  ✗ Koncentracja:          94% kliknięć z 1 domeny (podejrzany-serwis.pl — normalnie 2%)
  ✗ CTR display >2%:       1,84% — powyżej progu fraudu
  ✓ Kreacje bez zmian:     brak nowych wdrożeń 5–7 maja

Podejrzane domeny (top 3 po udziale w klikalności):
  1. podejrzany-serwis.pl  — 94% kliknięć | CTR 18,4% | landing_rate 3%   🔴 WYKLUCZ
  2. info-portal24.pl      — 4% kliknięć  | CTR  2,1% | landing_rate 42%  🟡 SPRAWDŹ
  3. klik-news.com         — 2% kliknięć  | CTR  1,8% | landing_rate 38%  🟡 SPRAWDŹ

REKOMENDACJA:
  □ 1. [DZIŚ] Wyklucz podejrzany-serwis.pl z domain exclusion list kampanii
  □ 2. [DZIŚ] Dodaj info-portal24.pl i klik-news.com do obserwacji — wyklucz jeśli landing_rate <50%
  □ 3. [DZIŚ] Rozważ zgłoszenie do SSP (Google AdX) jako invalid traffic
  □ 4. [JUTRO] Sprawdź CTR i landing_rate po 24h — potwierdzenie powrotu do normy
```

**Wariant CTR DROP:**
```
📉 ANALIZA CTR DROP — [KAMPANIA]

  CTR wczoraj: 0,03%  vs  średnia 30d: 0,11%  (spadek 72%)
  Landing rate: 78% (norma) → ruch jest prawdziwy, ale mniej kliknięć

DIAGNOZA: 🟡 ZMIANA KREACJI / TARGETOWANIA

Sprawdź:
  □ 1. Czy wczoraj zmieniono kreację? (nowa kreacja może mieć niższy CTR przez pierwsze dni)
  □ 2. Czy zmieniono targeting lub audience? (nowa grupa może mieć inne zachowanie)
  □ 3. Porównaj CTR per kreacja: wczoraj vs 7d avg
  □ 4. Jeśli brak zmian — monitoruj przez 3 dni (może być naturalna fluktuacja)
```

**Wariant NIEJASNE (mixed signals):**
```
🔍 ANOMALIA CTR — wymagana dalsza obserwacja

  Spełnione sygnały fraudu: 2/5
  Spełnione sygnały zmiany: 2/4
  → Diagnoza niepewna

Działanie: monitoruj przez 48h. Jeśli spike powtórzy się → wyklucz top domenę.
```

## Zasady

- Landing rate to kluczowy sygnał — <50% przy spike = prawie pewny fraud
- CTR >2% dla display zawsze wymaga wyjaśnienia — nie traktuj jako dobry wynik
- Nie alarmuj bez dowodów — opisz pewność diagnozy (wysoka / średnia / niejasne)
- Dla każdej podejrzanej domeny: podaj CTR, udział w klikalności i landing_rate
- Działania naprawcze zawsze z deadlinem (DZIŚ / JUTRO / MONITORUJ)
