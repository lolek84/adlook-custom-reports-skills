---
name: a02-diagnostyka-underpacingu
description: Użyj tego skilla gdy AdOps diagnozuje kampanię która nie dowozi, ma underpacing, zero delivery lub problem z wydatkami. Triggery: "kampania nie dowozi", "underpacing", "brak impresji na LI", "delivery problem", "zero spend", "kampania nie wydaje", "dlaczego nie ma impresji", "co blokuje kampanię".
version: 1.0.0
quality_score: 9
---

# A02 — Diagnostyka underpacingu

Głęboka analiza kampanii która niedowozi — identyfikacja przyczyny i gotowe kroki naprawcze.

## Cel

Root cause analysis underpacingu z priorytetowaną listą działań naprawczych — konkretne wartości do zmiany, nie ogólne wskazówki.

## Kroki wykonania

### 1. Pobierz dane wielowymiarowe (5 raportów równolegle)

**Raport 1 — Line item level:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_STATUS`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `ECPM_USD` — last_7_days

**Raport 2 — Supply source:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `SUPPLY_SOURCE`, `ENVIRONMENT` + metrics: `IMPRESSIONS`, `ECPM_USD` — last_7_days

**Raport 3 — Domain breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `TOP_LEVEL_DOMAIN` + metrics: `IMPRESSIONS`, `ECPM_USD`, `VIEWABILITY` — last_7_days

**Raport 4 — Device breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `ECPM_USD` — last_7_days

**Raport 5 — Creative breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE` + metrics: `IMPRESSIONS`, `CTR` — last_7_days

**Edge case:** Jeśli wszystkie raporty zwracają 0 wierszy (brak danych) — zatrzymaj się: `⛔ Brak jakichkolwiek danych za ostatnie 7 dni. Kampania mogła być pauzowana lub LI ma błędne daty. Sprawdź CAMPAIGN_STATUS i LINE_ITEM_STATUS w panelu.`

### 2. Oblicz baseline i zidentyfikuj kategorię problemu

Agent oblicza samodzielnie:

```
tempo_oczekiwane_$/dz  = CAMPAIGN_BUDGET / dni_całkowite
tempo_rzeczywiste_$/dz = TOTAL_SPEND_USD / dni_od_startu
niedobór_dzienny       = tempo_oczekiwane − tempo_rzeczywiste
delta_pacing%          = (pacing_rzeczywisty − pacing_oczekiwany)
```

Następnie sprawdź każdą kategorię i przypisz wagę problemu:

| Kategoria | Sygnał diagnozy | Waga |
|---|---|---|
| 🔴 BID za niski | eCPM_USD < $1,00 (display) lub < $4,00 (video) | Wysoka |
| 🔴 KREACJE zablokowane | IMPRESSIONS = 0 dla ≥1 kreacji przy ACTIVE statusie | Wysoka |
| 🟡 SUPPLY wąskie | 1 SSP odpowiada za >80% impresji, reszta <5% każdy | Średnia |
| 🟡 TARGETING za wąski | Impresje tylko na 1–2 device_type lub brak mobile | Średnia |
| 🟡 FREQUENCY CAP | Reach rośnie wolno, eCPM rośnie — ten sam user vidziany wiele razy | Średnia |
| 🟠 BRAK DANYCH | Raport 1 zwraca wiersze, ale impressions = 0 | Niska — sprawdź status kampanii |

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🔍 DIAGNOSTYKA UNDERPACINGU — Nike Air Max › LI: Prospecting_Mobile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAN (last 7 dni):
  Wydano:            $2 100  (oczekiwane: $6 440 przy on-pace)
  Delta pacing:      −67%  🔴  (krytyczny underpacing)
  Impresji/dz avg:   42 000  (cel: ~185 000/dz)

ROOT CAUSE ANALYSIS:

  🔴 #1 — BID ZA NISKI (pewna przyczyna)
     eCPM_USD: $0,72 — poniżej typowego floor price dla mobile display ($1,20–$1,80)
     Supply sources: Google AdX (0 impresji), Index Exchange (0 impresji), Xandr (42k/dz ✓)
     Diagnosis: bid nie wygrywa aukcji na dwóch głównych SSP
     Działanie: zwiększ bid floor do $1,50 lub przejdź na bidding CPM zamiast CPC

  🟡 #2 — SUPPLY WĄSKIE (prawdopodobna przyczyna dodatkowa)
     Xandr: 98% impresji | Google AdX: 0% | Index Exchange: 0% | Magnite: 2%
     Tylko 1 SSP aktywny — kampania traci ~70% dostępnego inventory
     Działanie: sprawdź czy private deals na Google AdX są aktywne; usuń ewentualne exclusiony

  🟠 #3 — MOBILE TARGETING (do monitorowania)
     Device breakdown: Mobile 41k/dz | Desktop 1k/dz | Tablet 0/dz
     Mobile działa, ale zbyt niski CPM — może targetowanie geo jest zbyt wąskie
     Działanie: sprawdź czy geo nie jest ograniczone do konkretnych miast

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LISTA DZIAŁAŃ (kolejność wdrożenia):

  □ 1. [DZIŚ] Zwiększ bid floor z $0,72 do $1,50 (priorytet: odblokowanie Google AdX)
  □ 2. [DZIŚ] Sprawdź status private deals na Google AdX — czy są aktywne i mają budget
  □ 3. [JUTRO] Jeśli po 24h nadal 0 impresji na AdX — usuń AdX exclusion list i sprawdź kreacje
  □ 4. [JUTRO] Monitoruj eCPM po zmianie bidu — cel: $1,20–1,80
```

**Jeśli ZERO DELIVERY (impressions = 0 całkowicie):**
```
⛔ ZERO DELIVERY — Nike Air Max › LI: Prospecting_Mobile

  Last 7 dni: 0 impresji, $0 spend
  LINE_ITEM_STATUS: ACTIVE ← status OK, ale brak delivery

  Sprawdź w kolejności:
  □ 1. Kreacje — czy są zaapprove'owane? (IMPRESSIONS per kreacja = 0 dla wszystkich?)
  □ 2. Daty — czy LINE_ITEM_START_DATE ≤ dziś ≤ LINE_ITEM_END_DATE?
  □ 3. Bid — eCPM w raporcie = $0? → bid może być poniżej absolutnego floor
  □ 4. Frequency cap — czy nie ustawiono cap = 1 imp/użytkownik/lifetime?
  □ 5. Targeting — czy geo/audience nie wyklucza 100% dostępnego inventory?
```

## Zasady

- Zawsze podawaj konkretne liczby: "eCPM $0,72 — poniżej floor $1,20" zamiast "eCPM za niski"
- Maksymalnie 3 przyczyny — priorytetowane od najpewniejszej do najmniej pewnej
- Każde działanie ma deadline: DZIŚ / JUTRO / W TYM TYGODNIU
- Jeśli tylko 1 SSP ma impresje — to zawsze warto sprawdzić jako drugi priorytet po bidzie
- Nie pisz "może" ani "prawdopodobnie" przy głównej przyczynie — bądź konkretny
