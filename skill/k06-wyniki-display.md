---
name: k06-wyniki-display
description: Użyj tego skilla gdy klient pyta o kliknięcia w banner, CTR, klikalność reklamy display. Triggery: "ile kliknięć", "CTR", "klikalność", "ktoś klikał w reklamę", "ile osób weszło na stronę", "kliknięcia w baner", "jak idzie display", "wyniki banera".
version: 1.0.0
quality_score: 9
---

# K06 — Wyniki display (klikalność)

Ile osób kliknęło w baner i jaka jest jakość tego ruchu kierowanego na stronę.

## Cel

Pokazać skuteczność kreacji display — kliknięcia i jakość ruchu na stronę klienta.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_SIZE`
- `CREATIVE_TYPE`

**Metrics:**
- `IMPRESSIONS`
- `CLICKS`
- `CTR`
- `LANDING_PAGE_VIEWS`
- `LANDING_RATE`

**Date range:** zakres podany przez użytkownika lub last_30_days.

Filtruj kreacje display (nie video).

**Edge case:** Jeśli brak danych o wejściach na stronę (LANDING_PAGE_VIEWS = 0 lub brak) — podaj tylko kliknięcia z adnotacją: *"Dane o wejściach na stronę są niedostępne dla tej kampanii — pokazuję tylko kliknięcia."*

### 2. Oceń klikalność

Agent oblicza samodzielnie benchmark dla każdego formatu:

Benchmarki oparte na normie branżowej DoubleVerify / IAB dla reklam display programmatic.

| Format kreacji | Typowa klikalność | Poniżej średniej | Dobry wynik | Świetny wynik |
|---|---|---|---|---|
| Baner standardowy | 0,08% | <0,05% 🔴 | 0,08–0,12% 🟢 | >0,12% 🟢🟢 |
| Rich media / interaktywny | 0,15% | <0,10% 🔴 | 0,15–0,25% 🟢 | >0,25% 🟢🟢 |

Jakość ruchu (ile z kliknięć dotarło na stronę):
- >80% — 🟢 dobra jakość ruchu
- 60–80% — 🟡 przeciętna
- <60% — 🔴 podejrzana jakość kliknięć (możliwy ruch automatyczny)

**Alert:** Jeśli CTR >1% przy standardowym banerze — zaznacz jako anomalię wymagającą sprawdzenia.

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i wybierz właściwy wariant oceny:

```
🖱 Klikalność reklam — Nike Air Max (kwiecień 2026)

Łącznie:
  Wyświetlenia:        4 200 000
  Kliknięcia:              5 040   (tyle razy ktoś kliknął w baner)
  Klikalność (CTR):        0,12%  🟢  (bardzo dobry wynik — benchmark to 0,08%)
  Wejść na stronę:         4 284   (85% kliknięć dotarło na stronę — 🟢 dobra jakość)

Wyniki per kreacja:
  ┌─────────────────────────┬──────────┬────────┬──────────┐
  │ Kreacja                 │ Rozmiar  │ CTR    │ Ocena    │
  ├─────────────────────────┼──────────┼────────┼──────────┤
  │ Baner wiosenny          │ 300×250  │ 0,15%  │ 🟢🟢     │
  │ Baner do artykułów      │ 728×90   │ 0,09%  │ 🟢       │
  │ Baner boczny            │ 160×600  │ 0,04%  │ 🔴       │
  └─────────────────────────┴──────────┴────────┴──────────┘

✅ "Baner wiosenny" działa najlepiej — klikalność prawie dwukrotnie powyżej benchmarku.
⚠️  "Baner boczny" jest poniżej średniej — rozważamy zmianę kreacji lub wyłączenie.
```

**Warianty oceny końcowej (wybierz odpowiedni):**

🟢 Dobry wynik:
> *"Kampania osiąga klikalność [X]% — powyżej typowego wyniku dla reklam banerowych (~0,08%). Reklamy skutecznie przyciągają uwagę odbiorców."*

🟡 Przeciętny wynik:
> *"Klikalność ([X]%) jest zbliżona do średniej rynkowej. Wyróżnia się kreacja [NAZWA] ([CTR]%) — warto ją skalować kosztem słabszych."*

🔴 Słaby wynik:
> *"Klikalność ([X]%) jest poniżej typowego wyniku dla banerów ([BENCHMARK]%). Rekomendujemy odświeżenie kreacji lub zmianę grup docelowych."*

🚨 Alert o podejrzanym ruchu:
> *"Klikalność jest wyjątkowo wysoka ([X]%) — to może wskazywać na ruch automatyczny (boty). Nasz zespół analizuje źródła kliknięć."*
→ Przy podejrzeniu botów: uruchom A16 (brand safety / IVT diagnostics).

## Zasady komunikacji

- Zamiast "CTR" pisz "klikalność" lub "odsetek kliknięć" (można dodać CTR w nawiasie)
- Zamiast "landing rate" pisz "procent kliknięć, które dotarły na stronę"
- Zawsze porównaj klikalność do benchmarku formatu — sama liczba nic nie mówi klientowi
- Wyróżnij najlepszą i najsłabszą kreację z konkretną rekomendacją działania
- Jeśli klikalność bardzo wysoka (>1%) — nie chwal, zbadaj najpierw
