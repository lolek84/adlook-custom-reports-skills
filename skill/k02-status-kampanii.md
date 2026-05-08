---
name: k02-status-kampanii
description: Użyj tego skilla gdy klient pyta czy kampania jest OK, czy idzie zgodnie z planem, chce szybki status. Triggery: "czy kampania idzie dobrze", "sprawdź status kampanii", "wszystko OK z kampanią", "jak nam idzie", "czy kampania jest na dobrej ścieżce", "status kampanii X". Daje prostą odpowiedź tak/nie z pacing%.
version: 1.0.0
quality_score: 9
---

# K02 — Status kampanii — czy wszystko OK?

Szybka odpowiedź tak/nie: czy kampania realizuje się zgodnie z planem. Tempo wydatków + kluczowe metryki.

## Cel

Maksymalnie szybka odpowiedź na pytanie "czy wszystko gra?" — jeden rzut oka na status.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`
- `LINE_ITEM_STATUS`

**Metrics:**
- `TOTAL_SPEND_USD`
- `IMPRESSIONS`

**Date range:** campaign_to_date (od startu kampanii do dziś).

**Edge case:** Jeśli kampania nie istnieje lub brak danych — odpowiedz: *"Nie znalazłem kampanii o tej nazwie. Podaj pełną nazwę lub wybierz z listy aktywnych kampanii."*
**Edge case:** Jeśli kampania jeszcze nie wystartowała (CAMPAIGN_START_DATE > dziś) — odpowiedz: *"Kampania [NAZWA] nie wystartowała jeszcze — start zaplanowany na [DATA]. Status będzie dostępny po uruchomieniu."*

### 2. Oblicz tempo wydatków

Agent oblicza samodzielnie:

```
dni_upłynęło   = dziś − CAMPAIGN_START_DATE
dni_całkowite  = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
oczekiwany_%   = (dni_upłynęło / dni_całkowite) × 100
rzeczywisty_%  = (TOTAL_SPEND_USD / CAMPAIGN_BUDGET) × 100
delta          = rzeczywisty_% − oczekiwany_%
```

### 3. Przypisz status na podstawie delty

| Delta tempa wydatków | Status | Co to znaczy dla klienta |
|---|---|---|
| od −5% do +5% | 🟢 Wszystko OK | Kampania wydaje budżet dokładnie zgodnie z planem |
| od −15% do −5% | 🟡 Lekkie spowolnienie | Kampania wydaje nieco mniej niż powinna na tym etapie |
| poniżej −15% | 🔴 Wymaga uwagi | Kampania wydaje znacznie za mało — ryzyko że nie wyda całości budżetu |
| powyżej +5% | 🟡 Przyspieszone tempo | Kampania wydaje szybciej niż planowano — budżet może skończyć się wcześniej |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i wybierz właściwy wariant zdania zamykającego:

```
🟢 Kampania Nike Air Max — wszystko gra!

📅 Czas trwania:  15 z 30 dni (połowa kampanii za nami)
💰 Wydano:        $12 300 z $25 000 — 49% budżetu ✓
📣 Wyświetlenia:  2 100 000 (tyle razy pojawiła się reklama)

Kampania wydaje budżet dokładnie w zaplanowanym tempie.
Do końca kampanii pozostało 15 dni i $12 700 budżetu.
```

**Warianty zdania zamykającego (wybierz odpowiedni):**

🟢 Na dobrej ścieżce:
> *"Kampania realizuje się zgodnie z planem. Nie wymaga żadnych działań."*

🟡 Lekkie spowolnienie:
> *"Kampania jest lekko spowolniona (wydano [X]% budżetu przy [Y]% czasu). Warto obserwować w kolejnych dniach — jeśli nie przyspieszy, skontaktujemy się z Tobą."*

🟡 Przyspieszone tempo:
> *"Kampania wydaje budżet szybciej niż planowano (wydano [X]% przy [Y]% czasu). Istnieje ryzyko wcześniejszego zakończenia — możemy dostosować tempo, jeśli chcesz."*

🔴 Wymaga uwagi:
> *"Kampania jest znacznie poniżej planu (wydano [X]% budżetu przy [Y]% czasu). Nasz zespół analizuje przyczynę i wróci do Ciebie z planem działania."*
→ Przy statusie 🔴 uruchom skill A02 (diagnostyka underpacingu).

### 5. Alert: reklamy aktywne bez emisji

Jeśli jakiś wariant kampanii ma status ACTIVE ale 0 wyświetleń — dołącz alert:

> *"⚠️ Uwaga: wariant '[NAZWA]' jest aktywny, ale nie wyemitował żadnych reklam. Nasz zespół sprawdza przyczynę."*

## Zasady komunikacji

- Zamiast "pacing" pisz "tempo wydatków" lub "postęp budżetu"
- Zamiast "line item" pisz "wariant kampanii"
- Zamiast "impressions" pisz "wyświetlenia"
- Odpowiedź maksymalnie 6 linii — to szybki status, nie raport
- Jeden emoji na początku — od razu wiadomo czy jest dobrze czy nie
- Każda liczba ma kontekst w nawiasie lub w kolejnym zdaniu
- Przy statusie żółtym/czerwonym: zawsze konkretne następne kroki lub deklaracja działania
