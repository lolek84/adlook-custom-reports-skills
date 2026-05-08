---
name: w02-pytanie-o-metryczne
description: Użyj tego skilla gdy użytkownik pyta o konkretną jedną metrykę kampanii — CTR, impresje, viewability, reach, wydatki. Triggery: "jaki mamy CTR", "ile impresji", "jaki viewability", "ile wydaliśmy", "jaki reach", "ile kliknięć", "jakie wyniki", "podaj mi [metrykę]", "ile wynosi [metryka]".
version: 1.0.0
quality_score: 9
---

# W02 — Pytanie o konkretną metrykę

Bezpośrednia odpowiedź na pytanie o jedną metrykę — wartość + krótki kontekst.

## Cel

Jedna liczba z interpretacją — bez zbędnych danych wokół.

## Kroki wykonania

### 1. Zidentyfikuj metrykę i pobierz minimum danych

Z pytania wyciągnij:
- Jaka metryka? (CTR / impresje / viewability / reach / spend / VCR / CPA / etc.)
- Za jaki okres? (wczoraj / ostatni tydzień / miesiąc / kampania)
- Dla której kampanii?

`run_report_preview` z minimalnym zestawem — tylko potrzebne metryki:

| Pytanie o | Metrics do pobrania |
|---|---|
| CTR / klikalność | `CTR`, `CLICKS`, `IMPRESSIONS` |
| Viewability / widoczność | `VIEWABILITY`, `MEASURABILITY` |
| Reach / zasięg | `REACH`, `FREQUENCY`, `IMPRESSIONS` |
| Spend / wydatki | `TOTAL_SPEND_USD`, `CAMPAIGN_BUDGET` |
| Video / obejrzenia | `VIDEO_COMPLETION_RATE`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_STARTS` |
| Impresje | `IMPRESSIONS` |
| Konwersje | `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS` |

**Dims:** `CAMPAIGN_NAME` (+ `LINE_ITEM_NAME` jeśli pytanie o konkretny LI)
**Date range:** podany przez użytkownika lub last_7_days.

**Edge case:** Jeśli metryka niedostępna (np. konwersje bez piksela) — odpowiedz: *"Dane o [metryce] są niedostępne dla tej kampanii. [Wyjaśnienie dlaczego — np. 'wymaga wdrożonego piksela śledzącego'].'"* Jeśli kampania ma 0 wyświetleń w podanym okresie — zaznacz: *"Brak danych — kampania nie wyświetlała się w tym okresie."* Jeśli użytkownik nie podał okresu — użyj last_7_days i zaznacz to wprost.

### 2. Przygotuj output

**Format dla klienta — krótki, z benchmarkiem:**

```
Klikalność (CTR): 0,14%

To dobry wynik — typowa klikalność dla reklam banerowych to ok. 0,08%,
więc Twoja kampania jest prawie dwukrotnie powyżej normy.
```

```
Widoczność reklam: 68%

Powyżej minimum (50%) — oznacza że 68 na 100 wyświetleń było naprawdę widoczne
dla użytkownika (nie scrollował obok zanim zdążyła się załadować).
```

```
Zasięg: 1 800 000 unikalnych osób

Tyle różnych ludzi zobaczyło Twoją reklamę co najmniej raz w tym miesiącu.
```

```
Wydatki: $18 400 z $25 000 budżetu (74%)

Przy 73% czasu kampanii — wydatki są dokładnie zgodne z planem.
```

**Format dla AdOps — techniczny z trendem:**

```
CTR: 0,14% | last 7d | Nike Air Max — Remarketing_Desktop
Trend: ↑ vs poprzedni tydzień (0,11%, +27%)
Benchmark display: 0,05–0,12% | Status: 🟢 powyżej benchmarku
```

### 3. Benchmarki do kontekstu

| Metryka | Klient: co powiedzieć | AdOps: próg |
|---|---|---|
| CTR display | norma ~0,08% | <0,05% słaby, >0,12% świetny |
| CTR video | norma ~0,3–0,5% | <0,2% słaby, >0,8% świetny |
| Viewability | dobry >50%, świetny >70% | benchmark MRC: 50% |
| VCR | dobry >50%, świetny >70% | <30% wymaga działania |
| Frequency | optymalna 2–5× | >7× to saturacja |
| Spend vs budget | powinno być ±10% od oczekiwanego | delta pacing ±15% = OK |

### 4. Jeśli użytkownik potrzebuje więcej

Zaproponuj odpowiedni skill:
- Pełny raport z kampanii → K01
- Tylko status (OK/nie OK) → K02
- Głębsza analiza konkretnej metryki (CTR anomalia, viewability audit) → A03 / A04

## Zasady

- Odpowiedź: jedna liczba + max 2 zdania kontekstu — nigdy więcej
- Zawsze porównaj do benchmarku — bez benchmarku liczba nic nie znaczy
- Dla klienta: tłumacz metrykę prostym językiem, bez angielskich skrótów
- Dla AdOps: podaj trend (↑/↓/↔) i benchmark procentowy
- Jeśli metryka niedostępna — wyjaśnij dlaczego (piksel, format, etc.), nie zostawiaj pustego miejsca
