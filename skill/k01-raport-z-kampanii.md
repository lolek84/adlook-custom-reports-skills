---
name: k01-raport-z-kampanii
description: Użyj tego skilla gdy klient lub agencja pyta o wyniki kampanii reklamowej w prostym języku. Triggery: "jak idzie kampania", "pokaż wyniki za ostatni miesiąc", "raport z kampanii", "co osiągnęliśmy", "jak wyglądają wyniki", "pokaż mi kampanię". Przeznaczony dla użytkowników bez wiedzy technicznej o DSP.
version: 1.0.0
quality_score: 9
---

# K01 — Raport z kampanii

Podsumowanie wyników kampanii za wybrany okres w czytelnej formie dla klienta lub agencji.

## Cel

Dostarczyć prosty, czytelny raport wyników kampanii — zero surowych danych, gotowe wnioski.

## Kroki wykonania

### 1. Ustal zakres

Jeśli użytkownik nie podał okresu, zapytaj za jaki czas ma być raport (np. ostatni miesiąc, ostatni tydzień, cały czas trwania kampanii). Jeśli nie podał nazwy kampanii — zapytaj lub pobierz listę aktywnych.

**Edge case:** Jeśli kampania jest nieaktywna lub brak danych za podany okres, poinformuj: *"Kampania [NAZWA] nie emitowała reklam w wybranym okresie. Chcesz zobaczyć wyniki z ostatniego aktywnego okresu?"*

### 2. Pobierz dane z MCP

Wywołaj `run_report_preview` z następującymi parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_STATUS`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`
- `LINE_ITEM_NAME`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `CTR`
- `VIEWABILITY`
- `REACH`

**Date range:** zakres podany przez użytkownika lub domyślnie last_30_days.

### 3. Przygotuj output

Agent oblicza samodzielnie:
- **pacing%** = (wydany budżet / całkowity budżet) / (dni od startu / łączna długość kampanii) × 100
- **ocenę pacing**: idealny = 85–115%, wolny = <85%, za szybki = >115%

Użyj poniższego szablonu dosłownie — podstaw wartości i wybierz właściwy wariant oceny:

```
📊 Raport kampanii: Nike Air Max — kwiecień 2026
Okres: 1–30 kwietnia 2026

── WYNIKI KAMPANII ─────────────────────────────

👁 Wyświetlenia:     4 200 000   (tyle razy pojawiła się reklama)
👥 Zasięg:           1 800 000   (tyle unikalnych osób ją zobaczyło)
💰 Budżet:           $18 400 z $25 000 wydane (74%)
   Pacing:           🟡 nieco wolny — powinno być ok. 80% na tym etapie kampanii
🖱 Klikalność:       0,14%       (na 100 wyświetleń kliknęły 0,14 osoby — dobry wynik dla banerów)
👀 Widoczność:       68%         (68 na 100 wyświetleń było widoczne dla użytkownika)

── OCENA ──────────────────────────────────────

🟢 Kampania jest na dobrej ścieżce.
Reklama dociera do szerokiego grona odbiorców i jest dobrze widoczna.
Klikalność (0,14%) jest powyżej typowego wyniku dla reklam banerowych (ok. 0,08%),
co oznacza, że kreacja skutecznie przyciąga uwagę.
Budżet wydawany jest nieco wolniej niż planowano — warto monitorować w kolejnych dniach.

── LINE ITEMY ─────────────────────────────────

| Line item              | Wyświetlenia | Klikalność | Widoczność |
|------------------------|-------------|------------|------------|
| Remarketing – desktop  | 2 100 000   | 0,18%      | 72%        |
| Prospecting – mobile   | 2 100 000   | 0,10%      | 64%        |
```

**Warianty oceny pacing (wybierz jeden):**
- 🟢 `Budżet wydawany zgodnie z planem — kampania na dobrej ścieżce.`
- 🟡 `Budżet wydawany nieco wolniej niż planowano (pacing: X%) — warto obserwować.`
- 🔴 `Kampania wydaje budżet za wolno (pacing: X%) — istnieje ryzyko, że nie wyda całości do końca. Zalecamy kontakt z opiekunem kampanii.` → jeśli delta < −15%, uruchom skill A02.

**Warianty oceny widoczności:**
- 🟢 `Widoczność [X]% — reklamy są dobrze widoczne dla odbiorców (norma MRC: powyżej 50%).`
- 🟡 `Widoczność [X]% — część reklam mogła nie być zauważona. Pracujemy nad optymalizacją.`
- 🔴 `Widoczność [X]% — znaczna część reklam nie była widoczna. Rekomendujemy pilną optymalizację inventory.` → użyj A16 do diagnostyki inventory.

### 4. Zamknij raportem jednym zdaniem

Ostatnie zdanie raportu powinno być gotowe do wklejenia w maila do klienta:

> *"Kampania realizuje się zgodnie z założeniami — reklamy dotarły do 1,8 mln unikalnych osób, klikalność jest powyżej benchmarku, a budżet wydawany jest w odpowiednim tempie."*

Jeśli coś wymaga uwagi:

> *"Kampania osiąga dobre wyniki zasięgowe, jednak widoczność reklam (42%) jest poniżej oczekiwań — pracujemy nad poprawą i poinformujemy o efektach."*

## Zasady komunikacji

- Zamiast "CTR" pisz "klikalność" lub "odsetek kliknięć"
- Zamiast "viewability" pisz "widoczność reklam"
- Zamiast "impressions" pisz "wyświetlenia"
- Zamiast "line item" pisz "wariant kampanii" lub zostaw nazwę własną bez tłumaczenia
- Każdą liczbę opatrz nawiasem z wyjaśnieniem co ona oznacza dla klienta
- Zaokrąglaj do pełnych tysięcy (1 800 000, nie 1 823 471) — czytelność > precyzja
- Nigdy nie pokazuj danych surowych bez kontekstu — zawsze dodaj: "to oznacza..." lub "to [dobry/przeciętny/słaby] wynik, bo..."
- Raport kończy się zawsze zdaniem gotowym do wklejenia w komunikację z klientem
