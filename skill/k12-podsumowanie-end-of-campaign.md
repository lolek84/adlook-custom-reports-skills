---
name: k12-podsumowanie-end-of-campaign
description: Użyj tego skilla gdy klient prosi o kompleksowy raport końcowy kampanii, podsumowanie miesięczne, monthly summary. Triggery: "podsumuj kampanię", "raport końcowy", "monthly summary", "co osiągnęliśmy w tym miesiącu", "końcowy raport", "zamknij kampanię raportem", "end of campaign", "finalne wyniki".
version: 1.0.0
quality_score: 9
---

# K12 — Podsumowanie end-of-campaign

Kompleksowy raport końcowy kampanii — gotowy do wysłania do klienta lub zarządu.

## Cel

Profesjonalny raport który klient może pokazać swojemu zarządowi lub agencji bez dalszej edycji.

## Kroki wykonania

### 1. Pobierz 4 raporty z MCP równolegle

**Raport 1 — Główne KPI:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH`, `FREQUENCY`, `TOTAL_CONVERSIONS`, `ECPA_USD`, `ROAS` — campaign_to_date.

**Raport 2 — Video (jeśli kampania zawierała wideo):**
dims: `CREATIVE_NAME`, `CREATIVE_DURATION` + metrics: `VIDEO_STARTS`, `VIDEO_COMPLETION_RATE`, `VIDEO_COMPLETE_VIEWS` — campaign_to_date.

**Raport 3 — Top inventory:**
dims: `TOP_LEVEL_DOMAIN`, `APP_NAME`, `ENVIRONMENT` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD` — campaign_to_date.

**Raport 4 — Kreacje:**
dims: `CREATIVE_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE` + metrics: `IMPRESSIONS`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE` — campaign_to_date.

**Edge case:** Jeśli kampania jeszcze trwa — zaznacz w tytule: *"Raport częściowy — kampania w toku (do [DATA])"* i dodaj informację ile % kampanii zostało zrealizowane. Jeśli kampania jeszcze się nie rozpoczęła (0 impresji) — odpowiedz: *"Kampania nie wystartowała — brak danych do raportu."* Jeśli budżet = $0 lub CAMPAIGN_BUDGET niedostępny — pomiń sekcję realizacji budżetu i zaznacz: *"Dane budżetowe niedostępne."*

### 2. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RAPORT KOŃCOWY KAMPANII
Nike Air Max | 1–30 kwietnia 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PODSUMOWANIE WYKONAWCZE

Kampania Nike Air Max osiągnęła wszystkie zaplanowane cele. W ciągu miesiąca
reklama dotarła do 1,8 miliona unikalnych osób w Polsce, przy klikalności
(0,14%) znacznie powyżej branżowej normy (0,08%). Budżet ($25 000) został
zrealizowany niemal w całości (98%).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KLUCZOWE WYNIKI

• 👥 Zasięg: 1 800 000 unikalnych osób
  → Reklama dotarła do 1,8 mln różnych użytkowników w Polsce

• 👁 Wyświetlenia: 4 200 000 (średnio każda osoba zobaczyła reklamę 2,3 razy)
  → Zdrowa częstotliwość kontaktu — bez ryzyka znużenia reklamą

• 💰 Realizacja budżetu: $24 500 z $25 000 wydane (98%)
  → Budżet zrealizowany zgodnie z planem

• 🖱 Klikalność: 0,14%
  → 75% powyżej normy dla reklam banerowych (~0,08%) — kreacje dobrze przyciągają uwagę

• 👀 Widoczność reklam: 68%
  → Powyżej minimum (50%) — reklamy były realnie widoczne dla odbiorców

[• 🎯 Konwersje: 342 zakupy | Koszt jednej konwersji: $53,80 | ROAS: 320%
  → Za każdy wydany $1 kampania przyniosła $3,20 przychodu — powyżej celu ($60 CPA)]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WYNIKI WIDEO (jeśli dotyczy)

• 🎬 Reklama wideo "Spot wiosenny 30s":
  Film obejrzało do końca: 480 000 osób (40% z tych którzy zaczęli)
  → Poniżej benchmarku (50%) — rekomendujemy krótszą wersję 15s na kolejną kampanię

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GDZIE WYŚWIETLAŁA SIĘ REKLAMA (top 5)

  1. wp.pl         — 12% wyświetleń
  2. onet.pl       —  9%
  3. gazeta.pl     —  7%
  4. tvn24.pl      —  6%
  5. sport.pl      —  4%

  Reklama pojawiała się głównie na znanych polskich serwisach informacyjnych.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAJLEPSZA I NAJSŁABSZA REKLAMA

  🏆 Najlepsza:  "Baner wiosenny kolor" (300×250) — klikalność 0,18%, widoczność 71%
  ⛔ Najsłabsza: "Baner stary 2025" (300×250) — klikalność 0,04%, widoczność 58%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WNIOSKI I REKOMENDACJE NA KOLEJNĄ KAMPANIĘ

✅ Co działało dobrze:
  1. Kolorowe banery wiosenne — klikalność 2× wyższa niż stare kreacje
  2. Inventory premium (wp.pl, onet.pl) — wysoka widoczność reklam
  3. Targetowanie głównych miast — dobry zasięg przy efektywnych kosztach

💡 Rekomendacje:
  1. Zastąp "Baner stary 2025" nową kreacją — wstrzymanie uwolni ok. $1 200/mies.
  2. Skróć spot wideo do 15 sekund — prognozowany wzrost obejrzeń do końca z 40% do ~60%
  3. Rozważ zwiększenie udziału krakowskiej grupy odbiorców — miasto osiągnęło najlepszą klikalność

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raport wygenerowany: czw 8 maja 2026 | Adlook DSP
```

## Zasady komunikacji

- Raport samowystarczalny — klient wysyła go dalej bez edycji
- Executive summary: max 3 zdania — wynik + ocena + jedna kluczowa liczba
- Zero żargonu DSP (nie: "eCPM", "LI", "SSP") — tylko pojęcia zrozumiałe dla zarządu
- Każda metryka z interpretacją w nawiasie lub w kolejnym zdaniu
- Rekomendacje zawsze konkretne i actionable (nie "warto rozważyć" ale "zastąp X przez Y")
- Konwersje/ROAS tylko jeśli dane dostępne — nie zostawiaj pustej sekcji
- Viewability: "dobry wynik" = >50% (standard MRC), "świetny" = >70%
- VCR: benchmark dla spotu 30s = >40% OK, >60% świetny (norma branżowa)
