---
name: a06-brand-safety-audit
description: Użyj tego skilla gdy AdOps chce sprawdzić brand safety kampanii, znaleźć podejrzane domeny, zrobić audit placementów pod kątem bezpieczeństwa marki. Triggery: "brand safety check", "sprawdź czy reklama nie pojawiła się na złych stronach", "audit placementów", "bezpieczeństwo marki", "brand safety", "podejrzane strony", "złe domeny", "content safety".
version: 1.0.0
quality_score: 9
---

# A06 — Brand safety audit

Przegląd inventory pod kątem brand safety — wykrycie domen niezgodnych z wymogami klienta.

## Cel

Zidentyfikować domeny problematyczne dla marki klienta, obliczyć % budżetu na ryzykownym inventory i przygotować gotową blacklistę.

## Kroki wykonania

### 1. Pobierz dane z MCP

**Raport domain:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `TOP_LEVEL_DOMAIN`, `APP_NAME`, `APP_ID`, `SUPPLY_SOURCE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD` — campaign_to_date lub last_30_days.

**Edge case:** Jeśli `APP_NAME` = null — użyj `APP_ID` z etykietą `(app, ID: [APP_ID])`. Nieidentyfikowalne aplikacje traktuj jak WATCH, nie EXCLUDE.

### 2. Klasyfikacja domen

Agent przypisuje każdej domenie klasę na podstawie nazwy, rozszerzenia i kontekstu:

**🔴 EXCLUDE — wyklucz natychmiast:**
- Wzorce w nazwie: `xxx`, `porn`, `adult`, `casino`, `bet`, `torrent`, `crack`, `hack`, `warez`
- Kategorie: treści dla dorosłych, hazard, nielegalne oprogramowanie, mowa nienawiści
- Domeny parkowane: losowe ciągi liter + liczby bez rozpoznawalnej nazwy

**🟡 WATCH — wymaga ręcznej weryfikacji:**
- Rozszerzenia wysokiego ryzyka: `.xyz`, `.top`, `.click`, `.loan`, `.pw`, `.tk`
- Mała rozpoznawalność + duży udział budżetu (>1% spend z nieznanej domeny)
- APP_NAME = null (aplikacja bez identyfikacji)
- Domeny z newsami sensacyjnymi lub clickbait (jeśli marka wymaga premium inventory)

**🟢 SAFE — bezpieczne:**
- Znane polskie portale: wp.pl, onet.pl, gazeta.pl, interia.pl, tvn24.pl, polsat.pl itd.
- Premium international: bbc.com, reuters.com, cnn.com, bloomberg.com itd.
- Znane aplikacje z nazwą (Google Play / App Store rozpoznawalne)

### 3. Oblicz impakt

Agent oblicza samodzielnie:

```
spend_EXCLUDE = suma TOTAL_SPEND_USD gdzie klasa = EXCLUDE
spend_WATCH   = suma TOTAL_SPEND_USD gdzie klasa = WATCH
total_spend   = suma TOTAL_SPEND_USD (wszystkie)

risky_%  = (spend_EXCLUDE + spend_WATCH) / total_spend × 100
```

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
🛡 BRAND SAFETY AUDIT — Nike Air Max (kwiecień 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PODSUMOWANIE:
  🟢 SAFE (bezpieczne):   287 domen  — 91% budżetu  ($16 740)
  🟡 WATCH (do sprawdz.):  18 domen  —  6% budżetu  ( $1 100)
  🔴 EXCLUDE (wyklucz):     7 domen  —  3% budżetu  (   $560)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 WYKLUCZYĆ NATYCHMIAST (7 domen):

  Domena                Powód                      Imp.      Budżet
  ──────────────────── ──────────────────────────  ──────── ──────
  free-casino-pl.com   hazard / gambling            48 000  $  240
  xxx-content.net      treści dla dorosłych         32 000  $  160
  crack-soft.xyz       nielegalne oprogramowanie    28 000  $  140
  bet365-free.top      hazard + ryzykowne TLD       19 000  $   95  ← .top
  poker-darmowy.pl     hazard                       14 000  $   70  ← weryfikacja
  … (2 kolejne)

🟡 DO WERYFIKACJI (top 5 po budżecie):

  Domena                Powód flagi                Imp.      Budżet
  ──────────────────── ──────────────────────────  ──────── ──────
  szybkiewiadomosci.xyz  rozszerzenie .xyz         67 000  $  335  — sprawdź treść
  tabloidy24.pl          clickbait / sensacja       54 000  $  270  — czy OK dla marki?
  (app, ID: 1234567)     brak nazwy aplikacji       38 000  $  190  — niezidentyfikowana
  plotki-celebrity.pl    kontekst niezgodny?        31 000  $  155  — decyzja klienta
  info-spam.click        ryzykowne TLD .click       22 000  $  110  — sprawdź

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDOWANA BLACKLISTA (wdrożyć natychmiast):
  free-casino-pl.com, xxx-content.net, crack-soft.xyz,
  bet365-free.top, poker-darmowy.pl [+ 2 kolejne]

Budżet na ryzykownym inventory: $1 660 (9% total)
Po wykluczeniu EXCLUDE: budżet odzysk $560 → przesunąć do premium
```

## Zasady

- Klasyfikacja automatyczna wymaga zatwierdzenia AdOps przed wdrożeniem blacklisty
- Nieznana domena ≠ niebezpieczna — flaga WATCH, nie EXCLUDE (chyba że wyraźny sygnał)
- Zawsze podaj powód flagi — samo "podejrzane" nie wystarczy
- Nie wykluczaj domen tylko po rozszerzeniu TLD — sprawdź kontekst nazwy
- Wyraźnie rozróżnij: co wdrożyć natychmiast (EXCLUDE) vs co wymaga decyzji człowieka (WATCH)
- Podaj % budżetu na ryzykownym inventory — to argument do rozmowy z klientem
