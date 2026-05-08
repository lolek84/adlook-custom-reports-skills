---
name: a05-analiza-wydajnosci-kreatyw
description: Użyj tego skilla gdy AdOps analizuje wydajność kreacji, chce wiedzieć które kreacje działają i co wstrzymać. Triggery: "które kreacje działają", "porównaj kreacje", "najlepszy banner", "wstrzymaj słabe kreacje", "analiza kreacji", "ranking kreacji", "które kreacje są efektywne", "optymalizuj kreacje".
version: 1.0.0
quality_score: 9
---

# A05 — Analiza wydajności kreacji

Ranking kreacji wg skuteczności + identyfikacja kreacji do wstrzymania i do skalowania.

## Cel

Dostarczyć ranking kreacji z konkretnymi rekomendacjami: SKALUJ / MONITORUJ / WSTRZYMAJ — i kwotową oszczędnością po wstrzymaniu słabych.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `LINE_ITEM_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_SIZE`
- `CREATIVE_DURATION`

**Metrics:**
- `IMPRESSIONS`
- `CTR`
- `VIEWABILITY`
- `VIDEO_COMPLETION_RATE`
- `ECPM_USD`
- `TOTAL_SPEND_USD`
- `CLICKS`

**Date range:** last_14_days lub podany zakres.

**Edge case:** Jeśli wszystkie kreacje mają <10 000 impresji — zaraportuj: `⚠️ Za mała próba danych dla wiarygodnej oceny. Potrzeba minimum 10 000 impresji na kreację. Wróć za [X] dni lub rozszerz zakres dat.`

### 2. Oblicz score i przypisz akcje

Agent oblicza samodzielnie:

```
dla display:
  score = CTR × (VIEWABILITY / 100)

dla video:
  score = VIDEO_COMPLETION_RATE × (VIEWABILITY / 100)

# Wyklucz z rankingu kreacje z <10 000 impresji (niestatystyczne)
kreacje_do_oceny = [k for k in kreacje if IMPRESSIONS >= 10 000]

mediana_score = mediana(score for k in kreacje_do_oceny)

AKCJA:
  score > 1.5 × mediana  → 🚀 SKALUJ
  score > 0.75 × mediana → 👀 MONITORUJ
  score < 0.5 × mediana  → ⛔ WSTRZYMAJ
  IMPRESSIONS < 10 000   → 📊 ZA MAŁO DANYCH
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🎨 ANALIZA KREACJI — Nike Air Max › LI: Remarketing_Desktop (14 dni)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  #  Kreacja                    Typ      Rozmiar   Impresje   CTR    Viewab.  Score  AKCJA
  ── ─────────────────────────  ───────  ────────  ─────────  ─────  ───────  ─────  ──────────────
  1  Baner_wiosna_v2_kol        display  300×250    420 000   0,18%   71%     0,128  🚀 SKALUJ
  2  Baner_wiosna_v1_mono       display  300×250    390 000   0,14%   68%     0,095  👀 MONITORUJ
  3  Baner_boczny_728           display  728×90     280 000   0,09%   62%     0,056  👀 MONITORUJ
  4  Baner_stary_2025           display  300×250    340 000   0,04%   58%     0,023  ⛔ WSTRZYMAJ
  5  Video_30s_spot             video    –          210 000   –       65%     0,091  👀 MONITORUJ
  6  Baner_nowy_test            display  160×600      7 200   0,11%   61%     –      📊 ZA MAŁO DANYCH

  Mediana score:  0,075
  Próg SKALUJ:    0,113  (1,5× mediana)
  Próg WSTRZYMAJ: 0,038  (0,5× mediana)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJE:

  🚀 SKALUJ budżet:
     Baner_wiosna_v2_kol — CTR 0,18%, viewab. 71% (najlepsza kreacja, 70% powyżej mediany)
     Działanie: przenieś budżet z "Baner_stary_2025" tutaj

  ⛔ WSTRZYMAJ:
     Baner_stary_2025 — CTR 0,04%, score 0,023 (69% poniżej mediany)
     Oszczędność: ~$680/tydzień przy obecnym tempie wydatków
     Działanie: pauzuj LI lub wyklucz kreację z rotacji

  👀 MONITORUJ przez 7 dni:
     Baner_boczny_728, Baner_wiosna_v1_mono, Video_30s_spot

  📊 ZA MAŁO DANYCH:
     Baner_nowy_test (7 200 imp.) — oceń ponownie po osiągnięciu 10 000 imp.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERWACJA: Format 300×250 kolorowy (Baner_wiosna_v2_kol) bije monochromatyczny 2×
            — warto przetestować kolory na pozostałych formatach.
```

## Zasady

- Score jest względny (ranking w obrębie kampanii) — nie porównuj score między kampaniami
- Kreacje z <10k impresji: nie rekomenduj wstrzymania, oznacz jako "za mało danych"
- Sprawdź czy "słaba" kreacja nie jest na gorszym inventory — niska viewability może zaniżać score niezależnie od kreacji
- Zawsze podaj kwotę tygodniowej oszczędności przy wstrzymaniu słabych kreacji
- Obserwacja ogólna na końcu (np. "format X bije Y") — to najcenniejszy wniosek dla klienta
