---
name: w05-podsumowanie-do-prezentacji
description: Użyj tego skilla gdy użytkownik chce dane gotowe do prezentacji, bullet points z wynikami, key takeaways, podsumowanie do decku. Triggery: "przygotuj dane do prezentacji", "podsumowanie do decku", "key takeaways", "bullet points z wynikami", "dane do slajdów", "zrób mi podsumowanie", "wnioski z kampanii", "executive summary".
version: 1.0.0
quality_score: 9
---

# W05 — Podsumowanie dla prezentacji

Dane gotowe do wklejenia w deck/raport — sformatowane, z kluczowymi wnioskami.

## Cel

5–7 bullet pointów w formacie executive summary — gotowe do wklejenia bez edycji.

## Kroki wykonania

### 1. Pobierz pełny zestaw danych

`run_report_preview` z parametrami:

**Dims:** `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_TYPE`

**Metrics:** `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE`

**Date range:** pełny okres kampanii lub podany zakres.

**Edge case:** Jeśli kampania jeszcze trwa — zaznacz w tytule: *"Dane częściowe — kampania w toku (do [DATA], zrealizowano [%]% czasu)"*. Nie twórz raportu końcowego dla kampanii aktywnej bez tej adnotacji. Jeśli kampania nie wystartowała (0 impresji) — odpowiedz: *"Brak danych — kampania jeszcze się nie rozpoczęła."* Jeśli CAMPAIGN_BUDGET = $0 lub niedostępny — pomiń sekcję budżetową i zaznacz brak danych.

### 2. Oblicz i oceń

Agent oblicza samodzielnie:

```
pacing% = TOTAL_SPEND_USD / CAMPAIGN_BUDGET × 100
czas%   = dni_od_startu / dni_całkowite × 100
delta   = pacing% − czas%

OCENA BUDŻETU:
  delta > −5 i < +5  → "zrealizowany zgodnie z planem"
  delta < −15        → "poniżej planu — [X]% wydane przy [Y]% czasu"
  delta > +15        → "powyżej planu — tempo wyższe niż oczekiwane"

OCENA CTR:
  display > 0,12%    → "powyżej normy branżowej (0,08%)"
  display 0,05–0,12% → "w normie dla reklam banerowych"
  display < 0,05%    → "poniżej normy — warto przeanalizować kreacje"

OCENA VIEWABILITY:
  > 70%              → "wysoka widoczność"
  50–70%             → "widoczność w normie (standard MRC: 50%)"
  < 50%              → "widoczność poniżej normy — wymaga optymalizacji inventory"

OCENA VCR (video):
  > 60%              → "doskonałe zaangażowanie"
  40–60%             → "dobry wynik dla spotu [X]s"
  < 40%              → "niskie ukończenia — rozważ skrócenie spotu"
```

### 3. Przygotuj output

**Dla klienta (executive summary — gotowe do wklejenia):**

```
📊 KLUCZOWE WYNIKI — Nike Air Max
Okres: 1–30 kwietnia 2026

• Zasięg: Reklama dotarła do 1 800 000 unikalnych osób w Polsce w ciągu miesiąca.
  → Każda osoba zobaczyła ją średnio 2,3 razy — zdrowa częstotliwość kontaktu.

• Realizacja budżetu: Wydano $24 500 z $25 000 (98%) — zrealizowany zgodnie z planem.
  → Pełne wykorzystanie budżetu przy równomiernym tempie przez cały miesiąc.

• Widoczność: 68% wyświetleń było naprawdę widocznych dla odbiorcy.
  → Dobry wynik — powyżej branżowego minimum (50%), reklamy docierały tam gdzie trzeba.

• Zaangażowanie: Klikalność 0,14% — prawie dwukrotnie powyżej normy dla banerów (0,08%).
  → Kolorowe kreacje wiosenne wyraźnie przyciągały uwagę skuteczniej niż standardowe.

• Efektywność: Dotarcie do 1000 osób kosztowało $2,10 — typowy koszt dla premium inventory.

• Konwersje: 342 zakupy po średnio $53 za sztukę | Za każdy wydany $1 kampania
  przyniosła $3,20 przychodu (ROAS 320%) — powyżej zakładanego celu ($60 CPA).

→ WNIOSEK: Kampania osiągnęła wszystkie zaplanowane cele. Kolorowe kreacje wiosenne
  działały dwukrotnie lepiej niż poprzednie — rekomendujemy powtórzenie tego podejścia
  w kolejnej kampanii z rozszerzonym formatem wideo.
```

**Dla AdOps — wersja rozszerzona z deltami:**

```
📊 EXECUTIVE SUMMARY — Nike Air Max | kwiecień 2026

• Zasięg: 1 800 000 UU | Frequency: 2,3× (norma 2–5×) | Impr: 4,2M
  WoW trend: reach +8% (ostatni tydzień) — audience wciąż nienasycona

• Pacing: $24 500 / $25 000 (98%) | delta +2% vs. oczekiwany — ✅ OK
  Dzienny average: $817/dz | Peak week 3: $1 100/dz

• Viewability: 68% | Measurability: 84% | Benchmark: 50% MRC ✅ OK
  Słabsze domeny: [domain1] 41%, [domain2] 44% → kandydaci do wykluczenia

• CTR: 0,14% display ✅ | Benchmark: 0,08% | Best creative: "Baner wiosenny" 0,18%
  Najsłabsza: "Baner stary 2025" 0,04% → rekomendacja: wstrzymać

• eCPM: $2,10 | Zakres: $1,40–$3,80 | Najdroższe SSP: [SSP] $3,80 — sprawdź efektywność

• Konwersje: 342 | CPA: $53,80 (cel: $60) ✅ | ROAS: 320% (cel: >200%) ✅
  Click-through: 280 | View-through: 62

→ AKCJE NA KOLEJNĄ KAMPANIĘ:
  1. Wstrzymaj "Baner stary 2025" → oszczędność ~$1 200/mies.
  2. Wyklucz domeny z viewability <50% → poprawa jakości inventory
  3. Testuj spot 15s (obecny 30s ma VCR 40% — poniżej benchmarku)
```

## Zasady

- Każdy bullet: metryka + liczba + benchmark/norma + wniosek (4 elementy)
- Styl executive: pewny, konkretny — "Kampania osiągnęła" nie "Kampania wydaje się osiągnąć"
- Ostatni punkt (→ WNIOSEK) zawsze to rekomendacja na kolejną kampanię, nie kolejna liczba
- Unikaj Markdown table — bullet points działają w PowerPoint, Google Slides i mailu
- Sekcja konwersji tylko jeśli piksel aktywny — nie zostawiaj pustego miejsca z "brak danych"
- Klient: zero skrótów DSP (nie "eCPM", "VCR", "LI") — pisz "koszt za tysiąc", "obejrzenia do końca"
- AdOps: dodaj WoW deltę i konkretną akcję przy każdym wymagającym obszarze
