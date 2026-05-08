---
name: a09-analiza-video-funnel
description: Użyj tego skilla gdy AdOps diagnozuje problem z wideo — niski completion rate, gdzie użytkownicy porzucają film, video funnel drop-off. Triggery: "video nie działa", "niski completion rate", "gdzie porzucają film", "video funnel", "skip rate", "VCR problem", "video drop-off", "film nie jest oglądany", "analiza wideo kampanii".
version: 1.0.0
quality_score: 9
---

# A09 — Analiza video funnel

Gdzie użytkownicy porzucają film — optymalizacja długości kreacji i placementów video.

## Cel

Zidentyfikować dokładny moment drop-off i wskazać czy problem to kreacja, placement czy błąd techniczny — z konkretną rekomendacją.

## Kroki wykonania

### 1. Pobierz dane z MCP

**Raport funnel:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_DURATION`, `SUPPLY_SOURCE`, `DEVICE_TYPE` + metrics: `VIDEO_STARTS`, `VIDEO_PLAYS_25`, `VIDEO_PLAYS_50`, `VIDEO_PLAYS_75`, `VIDEO_PLAYS_100`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_COMPLETION_RATE`, `VIDEO_SKIPS`, `VIDEO_ERRORS` — last_14_days.

**Edge case:** Jeśli `VIDEO_STARTS` = 0 dla kreacji video — zatrzymaj się: `⛔ Kreacja [NAZWA] nie ma żadnych wyświetleń wideo. Sprawdź czy kreacja jest zaapprove'owana i czy format jest kompatybilny z targetowanym supply.`
Jeśli `VIDEO_ERRORS` / `VIDEO_STARTS` > 10% — flaguj problem techniczny przed analizą jakościową.

### 2. Oblicz drop-off

Agent oblicza dla każdej kreacji:

```
start = VIDEO_STARTS          → 100%
q1%   = VIDEO_PLAYS_25 / VIDEO_STARTS × 100
q2%   = VIDEO_PLAYS_50 / VIDEO_STARTS × 100
q3%   = VIDEO_PLAYS_75 / VIDEO_STARTS × 100
end%  = VIDEO_COMPLETE_VIEWS  / VIDEO_STARTS × 100   (= VIDEO_COMPLETION_RATE)

drop_intro     = 100 − q1%          (porzucili przed 25% filmu)
drop_middle    = q1% − q2%          (porzucili między 25–50%)
drop_late      = q2% − q3%          (porzucili między 50–75%)
drop_ending    = q3% − end%         (porzucili między 75–100%)

największy_drop = max(drop_intro, drop_middle, drop_late, drop_ending)
skip_rate      = VIDEO_SKIPS / VIDEO_STARTS × 100
error_rate     = VIDEO_ERRORS / VIDEO_STARTS × 100
```

### 3. Diagnozuj przyczynę drop-off

| Sygnał | Próg | Diagnoza | Rekomendacja |
|---|---|---|---|
| drop_intro > 40% | Porzuca >40% przed 25% | Za długie intro lub zły placement (non-skippable pre-roll) | Skróć intro lub przytnij do 15s |
| drop_middle > 30% | Duży drop w środku | Film traci relevance po zachęceniu | Skróć całość lub przepisz środkową część |
| skip_rate > 70% | Większość pomija | Format skippable — film nie zatrzymuje w pierwszych 5s | Przepisz intro (pierwsze 5s kluczowe) |
| error_rate > 5% | Błędy techniczne | Problem z kodowaniem kreacji lub playerem | Sprawdź format kreacji z creative team |
| Tylko 1 SSP ma dużo błędów | Błędy skumulowane | Kompatybilność z playerem konkretnego SSP | Wyklucz problematyczny SSP lub napraw format |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🎬 ANALIZA VIDEO FUNNEL — Nike Air Max (14 dni)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KREACJA: "Spot wiosenny 2026" (30 sekund)
Łącznie wyświetleń: 1 200 000 | Skip rate: 42% | Error rate: 1,2% 🟢

LEJEK DROP-OFF:
  ▶️  Start:              100%  (1 200 000 wyświetleń)
  ■   Do 7,5s  (25%):      62%  (−38%) ← NAJWIĘKSZY DROP ⚠️
  ■   Do 15s   (50%):      51%  (−11%)
  ■   Do 22,5s (75%):      45%  (−6%)
  ✅  Do końca (30s):       40%  (−5%)   VCR: 40% 🟠 (benchmark: ~50%)

DIAGNOZA: ⚠️ PROBLEM Z INTRO (drop_intro 38%)

  38% odbiorców porzuca film przed 7,5 sekundą.
  Skip rate 42% sugeruje część to świadome pomijanie.
  Treść po 7,5s trzyma — drop w środku i na końcu normalny.

  Porównanie per SSP:
    Google AdX:  VCR 48%  — dobry wynik
    Magnite:     VCR 28%  — poniżej oczekiwań (sprawdź placement typ)
    Xandr:       VCR 44%  — OK

REKOMENDACJE:
  □ 1. [PRIORYTET] Przytnij film do 15s — większość porzuceń przed 7,5s
                   Prognoza: VCR 15s wersja → szacowane 55–65% (vs 40% teraz)
  □ 2. Sprawdź Magnite VCR 28% — czy to in-banner video zamiast pre-roll?
        Jeśli tak: wyklucz Magnite z kampanii video lub zmień na outstream
  □ 3. Przepisz intro — pierwsze 5–7s powinno natychmiast pokazywać produkt/benefit
```

**Jeśli error_rate > 5%:**
```
🔴 PROBLEM TECHNICZNY — [KREACJA]

  Error rate: 8,4% (norma: <5%)
  Błędy skumulowane na: Magnite 71%, Index Exchange 18%

  Działanie: sprawdź format kreacji (VAST wersja, bitrate, rozdzielczość)
             z creative team przed dalszą analizą jakościową.
             Nie optymalizuj treści przy błędach technicznych — to false signal.
```

**Zestawienie wielu kreacji:**
```
RANKING KREACJI:

  Kreacja              Czas  VCR    Skip%  Drop_intro  Ocena
  ───────────────────  ────  ─────  ─────  ──────────  ──────────
  Spot_wiosna_30s      30s   40%    42%    38%         🟠 Skróć do 15s
  Spot_wiosna_15s      15s   61%    38%    22%         🟢 Najlepsza
  Spot_teaserowy_6s     6s   84%    12%    10%         🟢🟢 Bumper ad
```

## Zasady

- VCR benchmark: >50% = dobry, 30–50% = do optymalizacji, <30% = poważny problem
- Error rate >5% = problem techniczny — rozwiąż najpierw, potem analizuj jakość
- Drop_intro >40% = niemal zawsze sygnał do skrócenia lub przepisania pierwszych 5s
- Porównaj VCR per SSP — różnice >15 pp między SSP wskazują problem z placement typem
- Rekomendację skrócenia zawsze poprzyj prognozą VCR dla krótszej wersji
