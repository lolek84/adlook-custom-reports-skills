---
name: a10-cross-campaign-benchmark
description: Użyj tego skilla gdy AdOps chce porównać wyniki kilku kampanii tego samego advertisera, zrobić benchmark, znaleźć co działa najlepiej strukturalnie. Triggery: "porównaj kampanie", "która kampania daje najlepszy wynik", "benchmark między kampaniami", "co inaczej w kampanii A vs B", "cross-campaign analysis", "porównanie kampanii", "która kampania była lepsza".
version: 1.0.0
quality_score: 9
---

# A10 — Cross-campaign benchmark

Porównanie wyników kilku kampanii tego samego advertisera — co działa najlepiej strukturalnie.

## Cel

Wyciągnąć wnioski strukturalne z porównania kampanii i wskazać najlepsze praktyki na kolejne działania.

## Kroki wykonania

### 1. Pobierz listę kampanii

`list_advertisers` → wybierz advertisera → pobierz kampanie.

Jeśli użytkownik nie wskazał konkretnych — zapytaj które porównać, lub pobierz ostatnie 3–5 zakończonych/aktywnych.

**Edge case:** Jeśli kampanie mają różne cele KPI (jedna awareness, druga performance) — zaznacz to wyraźnie i nie porównuj bezpośrednio CPA/ROAS. Grupuj porównanie per typ celu.

### 2. Pobierz dane dla każdej kampanii

`run_report_preview` dims: `ADVERTISER_NAME`, `CAMPAIGN_NAME`, `CAMPAIGN_OBJECTIVE`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS`, `VIDEO_COMPLETION_RATE` — za pełny okres każdej kampanii (campaign_to_date lub podany zakres).

### 3. Normalizuj do per-1000-impresji

Agent oblicza samodzielnie — eliminuje wpływ różnych budżetów:

```
CTR_per_1k        = CTR × 10           (CTR jest już w %, zostawiamy)
spend_per_1k_imp  = TOTAL_SPEND_USD / (IMPRESSIONS / 1000)   → eCPM efektywny
reach_per_1k_imp  = REACH / (IMPRESSIONS / 1000)
conv_per_1k_imp   = TOTAL_CONVERSIONS / (IMPRESSIONS / 1000)

score_ogólny = (CTR / CTR_benchmark) × 0.3
             + (VIEWABILITY / 70) × 0.3
             + (VCR / 50 jeśli video, else 1.0) × 0.2
             + (conv_per_1k_imp / avg_conv_per_1k) × 0.2
```

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📊 CROSS-CAMPAIGN BENCHMARK — Nike Polska
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kampanie porównywane: 4 | Wszystkie: display | Okres: sty–kwi 2026

TABELA PORÓWNAWCZA (znormalizowana per 1000 impresji):

  Kampania              Okres       Budżet   CTR    Viewab.  Freq  eCPM    Score
  ──────────────────── ─────────── ──────── ────── ──────── ───── ─────── ──────
  Nike Air Max          kwi 2026   $25 000  0,14%   71%     3,1×  $2,40   8,2  🥇
  Nike Running Q1       mar 2026   $18 000  0,11%   68%     3,8×  $2,10   7,1  🥈
  Nike Zimowa           sty 2026   $30 000  0,08%   62%     4,7×  $3,20   5,4  🥉
  Nike Back to School   lut 2026   $12 000  0,06%   55%     5,9×  $2,80   4,0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RANKING:

  🥇 Nike Air Max (kwi 2026) — score 8,2/10
     Najwyższy CTR (0,14%) i viewability (71%) przy przeciętnym eCPM
     Frequency 3,1× — optymalna, bez saturacji

  🥈 Nike Running Q1 (mar 2026) — score 7,1/10
     Dobry CTR i niski eCPM ($2,10 — najtaniej z czterech)
     Nieco wyższa frequency niż Air Max

  🥉 Nike Zimowa (sty 2026) — score 5,4/10
     Najwyższy budżet ale najwyższy eCPM ($3,20) i wysoka frequency (4,7×)
     Prawdopodobna audience saturation w końcówce kampanii

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAJLEPSZE PRAKTYKI (z Air Max — top kampania):

  Inventory:     Google AdX + Xandr jako główne SSP (razem 64% impresji)
  Format:        300×250 kolorowy (CTR 2× wyższy niż 728×90)
  Bidding:       CPC z floor $0,60 (najtańsze kliknięcia wśród kampanii)
  Frequency cap: 3/tydzień — zapobiega saturacji audience

REKOMENDACJE NA KOLEJNĄ KAMPANIĘ:
  □ 1. Replikuj mix SSP z Air Max: AdX 40% + Xandr 25% + Index 15%
  □ 2. Ustaw frequency cap 3/tydzień od startu — nie czekaj na saturację
  □ 3. Unikaj eCPM >$3 — Zimowa przepłaciła przy słabszych wynikach niż tańsze kampanie
  □ 4. Priorytetuj format 300×250 — konsekwentnie najlepszy CTR we wszystkich kampaniach
```

## Zasady

- Porównuj kampanie tego samego formatu (display vs display, video vs video)
- Normalizacja per-1000-impresji jest obowiązkowa — bez niej porównanie jest nierzetelne
- Jeśli kampanie miały różne KPI — zaznacz to i nie porównuj CPA/ROAS bezpośrednio
- Wnioski muszą być strukturalne (co powtarzać) a nie opisowe (co się wydarzyło)
- Jeśli kampanie mają różne długości trwania — znormalizuj przez porównanie do pełnych cykli lub użyj analizy per-tydzień (skill A15) zamiast porównywać sumy
