---
name: w03-lista-aktywnych-kampanii
description: Użyj tego skilla gdy użytkownik pyta które kampanie są teraz aktywne, chce listę kampanii advertisera. Triggery: "które kampanie są aktywne", "co teraz robimy", "lista kampanii", "pokaż moje kampanie", "jakie mamy kampanie", "aktywne kampanie", "co jest włączone", "lista aktywnych".
version: 1.0.0
quality_score: 9
---

# W03 — Lista aktywnych kampanii

Które kampanie danego advertisera są teraz aktywne, z podstawowymi parametrami.

## Cel

Przegląd aktywnych kampanii w jednym miejscu — dla klienta w prostej formie, dla AdOps z pełnym statusem.

## Kroki wykonania

### 1. Pobierz listę advertiserów

`list_advertisers` → jeśli użytkownik nie podał nazwy — zapytaj lub pokaż listę do wyboru.

**Edge case:** Jeśli brak aktywnych kampanii — odpowiedz: *"Brak aktywnych kampanii dla [ADVERTISER] w tej chwili. Ostatnia kampania zakończyła się [DATA]."* — i nie generuj pustej tabeli. Jeśli CAMPAIGN_BUDGET = $0 lub niedostępny — pomiń kolumnę delta pacing i zaznacz: *"Dane budżetowe niedostępne dla [KAMPANIA]."* Jeśli CAMPAIGN_END_DATE jest w przeszłości ale status = ACTIVE — zaznacz anomalię: *"Kampania [NAZWA] ma status ACTIVE ale data końcowa minęła — wymaga weryfikacji."*

### 2. Pobierz dane kampanii

`run_report_preview` z parametrami:

**Dims:**
- `ADVERTISER_NAME`
- `CAMPAIGN_NAME`
- `CAMPAIGN_STATUS`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`

**Metrics:**
- `TOTAL_SPEND_USD`
- `IMPRESSIONS`

**Date range:** campaign_to_date (dla pacing) + yesterday (dla sprawdzenia aktywności).

Filtruj: `CAMPAIGN_STATUS = ACTIVE`.

### 3. Oblicz dla każdej kampanii

Agent oblicza samodzielnie:

```
procent_wydany    = TOTAL_SPEND_USD / CAMPAIGN_BUDGET × 100
dni_całkowite     = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
dni_od_startu     = dziś − CAMPAIGN_START_DATE
dni_pozostałe     = CAMPAIGN_END_DATE − dziś
pacing_oczekiwany = (dni_od_startu / dni_całkowite) × 100
delta_pacing      = procent_wydany − pacing_oczekiwany

STATUS:
  delta > −5 i < +5    → 🟢 OK
  delta −15 do −5      → 🟡 lekkie spowolnienie
  delta < −15          → 🔴 problem
  delta > +15          → 🟡 za szybko

ALERT końcowy:
  dni_pozostałe < 7    → ⚠️ Kończy się wkrótce
  IMPRESSIONS_yesterday = 0 → 🔴 Zero delivery — wymaga sprawdzenia
```

### 4. Przygotuj output

**Dla klienta:**

```
📋 Twoje aktywne kampanie (3):

1. Nike Air Max — Zasięgowa
   Budżet: $18 400 z $25 000 wydane (74%)
   Czas: 8 dni do końca (30 maja 2026)
   Status: 🟢 Idzie zgodnie z planem

2. Nike Air Max — Remarketing
   Budżet: $5 100 z $12 000 wydane (43%)
   Czas: 21 dni do końca (12 czerwca 2026)
   Status: 🟡 Lekko poniżej planu — nasz zespół monitoruje

3. Nike Running Summer ⚠️ Kończy się za 4 dni
   Budżet: $9 800 z $10 000 wydane (98%)
   Czas: 4 dni do końca (12 maja 2026)
   Status: 🟢 Budżet prawie wyczerpany — kampania zrealizowana
```

**Dla AdOps:**

```
📋 AKTYWNE KAMPANIE — Nike Poland (3 kampanie) | 2026-05-08

Kampania                    | Budżet  | Wydano |  Oczek. | Δ pacing | Dni | Wczoraj
─────────────────────────────────────────────────────────────────────────────────────
Nike Air Max — Zasięgowa    | $25 000 |   74%  |   72%   |   +2%    |  8  | ✅ 142k
Nike Air Max — Remarketing  | $12 000 |   43%  |   57%   |  −14%    | 21  | ✅  38k
Nike Running Summer ⚠️      | $10 000 |   98%  |   96%   |   +2%    |  4  | ✅  12k

🟡 UWAGA: Nike Air Max — Remarketing underpacing −14% → sprawdź bid/targetowanie → A02
⚠️  Nike Running Summer kończy się za 4 dni — budżet $200 pozostały, delivery OK
```

**Edge case — zero delivery:**

```
🔴 ALERT: [NAZWA KAMPANII] — zero wyświetleń wczoraj
   Kampania aktywna ale nie wyświetla. Przejdź do A02 (diagnostyka underpacingu).
```

## Zasady

- Sortuj: najpierw kampanie z 🔴 alertami, potem 🟡, potem 🟢 po dacie końca rosnąco
- Nie pokazuj zakończonych ani zaplanowanych kampanii (tylko ACTIVE)
- AdOps widzi delta pacing i wczorajsze impresje, klient widzi prosty status emoji
- Kampanie kończące się w ≤7 dni zawsze wyróżnij ⚠️ — nawet jeśli pacing OK
- Dla klienta: zamiast "delta pacing" pisz "zgodnie z planem" / "lekko poniżej planu"
