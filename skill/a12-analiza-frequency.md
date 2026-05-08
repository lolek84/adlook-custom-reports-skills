---
name: a12-analiza-frequency
description: Użyj tego skilla gdy AdOps chce sprawdzić frequency kampanii, czy nie bombardujemy tych samych użytkowników, optymalizację frequency cappingu. Triggery: "sprawdź frequency", "czy nie za dużo odsłon na osobę", "reach vs frequency", "frequency capping", "frequency rośnie", "ci sami użytkownicy", "audience saturation", "za duża częstotliwość".
version: 1.0.0
quality_score: 9
---

# A12 — Analiza frequency i zasięgu

Czy nie bombardujemy tych samych użytkowników — diagnoza audience saturation i optymalizacja frequency cappingu.

## Cel

Wykryć audience saturation z konkretną diagnozą i rekomendacją zmiany frequency cappa lub rozszerzenia targetowania.

## Kroki wykonania

### 1. Pobierz dane z MCP

**Raport dzienny trend:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE`, `DATE` + metrics: `REACH`, `FREQUENCY`, `IMPRESSIONS` — last_30_days.

**Edge case:** Jeśli REACH = 0 lub brak danych dla całego okresu — zaraportuj: `⚠️ Metryka REACH nie jest dostępna dla tej kampanii. Analiza frequency cappingu niemożliwa bez danych o unikalnych użytkownikach.`

### 2. Diagnozuj trend

Agent oblicza samodzielnie:

```
# Grupuj dane po tygodniach
tydzień_1 = pierwsze 7 dni kampanii
tydzień_N = ostatnie 7 dni

avg_freq_tydzień_1 = avg(FREQUENCY) w tygodniu 1
avg_freq_tydzień_N = avg(FREQUENCY) w ostatnim tygodniu
saturation_score   = avg_freq_tydzień_N / avg_freq_tydzień_1

reach_delta_%      = (reach_ostatni_tydzień − reach_pierwszy_tydzień) / reach_pierwszy_tydzień × 100
freq_delta_%       = (freq_ostatni_tydzień − freq_pierwszy_tydzień) / freq_pierwszy_tydzień × 100
```

**Interpretacja kombinacji:**
| Reach | Frequency | Diagnoza |
|---|---|---|
| ↑ rośnie | ↑ rośnie | 🟢 Zdrowa ekspansja — nowi użytkownicy + powtórzenia |
| → stabilny | ↑ rośnie | 🔴 Audience saturation — ci sami użytkownicy widzą coraz więcej |
| → stabilny | → stabilny | 🟢 Dojrzała kampania — equilibrium |
| ↓ spada | ↑ rośnie | 🔴 Krytyczna saturacja — zasięg się kurczy |
| → stabilny (nowy reach ≈ 0/dzień) | → stabilny | 🟡 Ukryta saturacja — pula wyczerpana, algorytm recyrkuluje tych samych; zweryfikuj dzienny przyrost reach |

### 3. Benchmarki frequency cappa

| Format | Optymalny cap | Alarm |
|---|---|---|
| Display awareness | 3–5 imp/tydzień | >7/tydzień |
| Display performance | 5–10 imp/tydzień | >15/tydzień |
| Video | 2–3 imp/tydzień | >5/tydzień |
| CTV | 3–5 imp/tydzień | >8/tydzień |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📊 ANALIZA FREQUENCY — Nike Air Max (kwiecień 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBECNY STAN:
  Średnia frequency (tydzień 4):  4,7 wyświetleń/osobę/tydzień  🟡
  Optymalny cap (display aware.): 3–5/tydzień  ← jesteśmy blisko górnej granicy
  Audience saturation score:      1,92  (tydzień 4 vs tydzień 1)

TREND 4 TYGODNIE:

  Tydzień  Reach         Δ Reach   Frequency   Δ Freq   Diagnoza
  ───────  ───────────── ─────────  ─────────   ──────  ─────────────────────
  Tydz. 1  680 000       —          2,4×         —      🟢 start kampanii
  Tydz. 2  720 000       +6%        2,9×        +21%    🟢 zdrowy wzrost
  Tydz. 3  710 000       −1%        3,8×        +31%    🟡 reach się zatrzymał
  Tydz. 4  695 000       −2%        4,7×        +24%    🔴 saturacja — reach spada, freq rośnie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAGNOZA: 🔴 AUDIENCE SATURATION (tygodnie 3–4)

  Od tygodnia 3: reach przestał rosnąć (−1%, −2%), a frequency rośnie (+31%, +24%).
  Kampania dociera do coraz węższej grupy tych samych osób.
  Przy obecnym trendzie: frequency może osiągnąć 7× w tygodniu 5 → przekroczenie benchmarku.

REKOMENDACJE (wybierz jedną lub połącz):

  □ 1. [NATYCHMIAST] Zmień frequency cap na 3/tydzień (z obecnego: brak cappa lub >5)
       Efekt: zatrzymasz wzrost frequency, część budżetu może się nieco zwolnić

  □ 2. [TYDZIEŃ] Rozszerz targetowanie audience
       Opcje: dodaj lookalike 5% → 10%, rozszerz zasięg geo, włącz nowe segmenty interest
       Efekt: nowi użytkownicy wejdą do puli → reach znów zacznie rosnąć

  □ 3. [OPCJONALNIE] Wstaw "cooldown" 3–5 dni bez emisji
       Efekt: audience "resetuje się" — po wznowieniu kampania znów trafia do świeżych odbiorców
       Ryzyko: przerwa w pacing — sprawdź czy budżet na to pozwala
```

## Zasady

- Stabilny reach + rosnący frequency = ZAWSZE problem — nie ignoruj tego sygnału
- Rosnący reach + rosnący frequency = zdrowe (nowi użytkownicy + retencja) — nie alarmuj
- Saturation score >2,0 = pilna interwencja; 1,5–2,0 = obserwacja; <1,5 = OK
- Rekomenduj frequency cap zanim zostanie przekroczony benchmark — profilaktycznie
- Zawsze podaj konkretną wartość cappa do ustawienia (np. "3/tydzień"), nie zakres
- Flaga ukrytej saturacji: jeśli dzienny przyrost reach <1% przez ≥3 kolejne dni — traktuj jak saturację nawet gdy łączny reach pozornie rośnie
