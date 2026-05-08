---
name: k11-porownanie-kreatywow
description: Użyj tego skilla gdy klient pyta która reklama działa lepiej, chce porównać banery lub wersje kreacji, A/B test. Triggery: "która kreacja działa lepiej", "porównaj banery", "A/B test kreacji", "najlepszy format", "która reklama jest lepsza", "porównaj reklamy", "które zdjęcie", "która wersja".
version: 1.0.0
quality_score: 9
---

# K11 — Porównanie kreatywów

Która wersja reklamy działa lepiej — jednoznaczna odpowiedź z rekomendacją.

## Cel

Dać klientowi klarowną odpowiedź która kreacja jest najlepsza i co z tym zrobić — bez technikaliów.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_SIZE`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `VIDEO_COMPLETION_RATE`
- `TOTAL_SPEND_USD`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

**Edge case:** Jeśli kreacja ma <10 000 impresji — zaznacz przy niej: *"(za mało danych do oceny — wynik może być przypadkowy)"* i nie rekomenduj wstrzymania na tej podstawie. Jeśli wszystkie kreacje mają <10 000 impresji — nie generuj rankingu, odpowiedz: *"Za mało danych do wiarygodnej oceny — poczekaj na min. 10 000 wyświetleń per kreacja."* Jeśli kampania ma tylko jedną kreację — nie porównuj, poinformuj: *"Brak kreacji do porównania — kampania ma tylko jedną wersję reklamy."*

### 2. Oceń i uszereguj kreacje

Agent oblicza samodzielnie:

```
dla display:  score = CTR × (VIEWABILITY / 100)
dla video:    score = VIDEO_COMPLETION_RATE × (VIEWABILITY / 100)

mediana_score = mediana score kreacji z ≥10 000 impresji

DECYZJA:
  score > 1,5 × mediana  → 🚀 Skaluj — przenieś budżet tutaj
  score > 0,75 × mediana → 👀 Obserwuj — wyniki w normie
  score < 0,5 × mediana  → ⛔ Wstrzymaj — słabe wyniki
  impresje < 10 000      → 📊 Za mało danych
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🎨 Porównanie reklam — Nike Air Max (kwiecień 2026)

RANKING KREACJI:

  #  Nazwa reklamy          Format    Wyświetlenia  Klikalność  Widoczność  Ocena
  ── ─────────────────────  ────────  ──────────── ──────────  ──────────  ───────────────
  1  Baner wiosenny kolor   300×250    420 000      0,18%        71%        🚀 Najlepsza
  2  Baner mono wiosna      300×250    380 000      0,14%        68%        👀 Dobra
  3  Baner boczny           728×90     280 000      0,09%        62%        👀 Dobra
  4  Baner stary 2025       300×250    340 000      0,04%        58%        ⛔ Słaba
  5  Baner testowy nowy     300×250      7 200      0,11%        61%        📊 Za mało danych

🏆 Najlepsza reklama: "Baner wiosenny kolor"
   Klikalność 0,18% — ponad dwukrotnie wyższa niż norma dla reklam banerowych (0,08%).
   Widoczność 71% — zdecydowanie dobry wynik.

⛔ Najsłabsza reklama: "Baner stary 2025"
   Klikalność 0,04% — poniżej połowy normy branżowej.
   Wstrzymanie tej reklamy pozwoli zaoszczędzić ok. $1 200/miesiąc i przekierować budżet
   na wersję, która działa.

💡 Rekomendacja:
   Wstrzymaj "Baner stary 2025" i przenieś jego budżet na "Baner wiosenny kolor".
   Kolorowa wersja wiosenna wyraźnie lepiej przyciąga uwagę — warto też przetestować
   ją w formacie 728×90 zamiast obecnej monochromatycznej wersji bocznej.
```

**Jeśli za mało danych do porównania (<2 kreacje z ≥10k impresji):**
```
📊 Za mało danych do wiarygodnego porównania.

  Kreacja "Baner testowy nowy" ma dopiero 7 200 wyświetleń
  (potrzeba min. 10 000 żeby wynik był statystycznie wiarygodny).

  Wróćmy do porównania za [N] dni — wtedy dane będą miarodajne.
```

## Zasady komunikacji

- Zamiast "CTR" pisz "klikalność"
- Zamiast "viewability" pisz "widoczność reklam"
- Zamiast "kreacja" pisz "reklama" lub "baner" lub "wersja"
- Jedna konkretna rekomendacja — nie lista opcji do wyboru
- Wyjaśnij prostymi słowami dlaczego dana reklama jest lepsza ("więcej osób w nią kliknęło")
- Zawsze podaj szacowaną kwotę oszczędności przy wstrzymaniu słabej kreacji
- Jeśli za mało danych — zaznacz wprost, nie zgaduj
- Norma branżowa dla display CTR: ~0,08% (benchmark rynkowy); dla video VCR: >50% dobry, <30% słaby
- Jeśli słaba kreacja wykryto → zaproponuj A05 (analiza wydajności kreatyw) dla głębszej analizy
