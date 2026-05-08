---
name: k05-wyniki-video
description: Użyj tego skilla gdy klient pyta o wyniki reklamy wideo, ile osób obejrzało film do końca, completion rate. Triggery: "ile osób obejrzało film do końca", "wyniki wideo", "completion rate", "jak radzi sobie reklama video", "video", "VCR", "obejrzenia do końca", "wyniki spotu".
version: 1.0.0
quality_score: 9
---

# K05 — Wyniki video

Kompletność obejrzenia reklamy wideo — ile osób obejrzało do końca.

## Cel

Pokazać lejek obejrzeń — gdzie użytkownicy porzucają film i jaka jest ogólna skuteczność wideo.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CREATIVE_NAME`
- `CREATIVE_TYPE`
- `CREATIVE_DURATION`

**Metrics:**
- `VIDEO_STARTS`
- `VIDEO_PLAYS_25`
- `VIDEO_PLAYS_50`
- `VIDEO_PLAYS_75`
- `VIDEO_PLAYS_100`
- `VIDEO_COMPLETE_VIEWS`
- `VIDEO_COMPLETION_RATE`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

Filtruj tylko kreacje gdzie `CREATIVE_TYPE` = video.

**Edge case:** Jeśli brak danych video (kampania display-only lub metryki video = 0) — odpowiedz: *"Ta kampania nie zawiera reklam wideo lub wideo nie było emitowane w wybranym okresie. Chcesz zobaczyć wyniki reklam banerowych zamiast?"*

### 2. Zbuduj lejek

Agent oblicza dla każdej kreacji samodzielnie:

```
start_100% = VIDEO_STARTS (punkt bazowy = 100%)
do_25%     = VIDEO_PLAYS_25 / VIDEO_STARTS × 100
do_50%     = VIDEO_PLAYS_50 / VIDEO_STARTS × 100
do_75%     = VIDEO_PLAYS_75 / VIDEO_STARTS × 100
do_końca%  = VIDEO_COMPLETE_VIEWS / VIDEO_STARTS × 100   (= VIDEO_COMPLETION_RATE)
```

### 3. Oceń skuteczność wideo

Progi oparte na normie rynkowej IAB dla reklam wideo in-stream (benchmark: ~50% VCR).

| Procent obejrzeń do końca | Ocena | Komunikat dla klienta |
|---|---|---|
| >70% | 🟢 Doskonały | Reklama angażuje — zdecydowana większość odbiorców ogląda do końca |
| 50–70% | 🟡 Dobry | Powyżej średniej rynkowej (~50%) — reklama skutecznie utrzymuje uwagę |
| 30–50% | 🟠 Przeciętny | Część odbiorców rezygnuje przed końcem — warto rozważyć krótszą wersję |
| <30% | 🔴 Wymaga poprawy | Większość odbiorców nie ogląda do końca — prawdopodobna przyczyna: zbyt długa kreacja lub nieodpowiedni placement → uruchom A03 (diagnostyka kreacji) |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i wybierz właściwy wariant oceny:

```
🎬 Wyniki wideo — Nike Air Max (kwiecień 2026)

Kreacja: "Spot wiosenny 2026" (30 sekund)
Wyświetleń wideo: 1 200 000

Jak daleko odbiorcy oglądali reklamę:
  ▶️  Zaczęło oglądać:     1 200 000 osób  (100%)
  ◼️  Do ¼ filmu (7,5s):     960 000 osób  ( 80%)
  ◼️  Do połowy (15s):        780 000 osób  ( 65%)
  ◼️  Do ¾ (22,5s):           600 000 osób  ( 50%)
  ✅  Do końca (30s):         480 000 osób  ( 40%) 🟠

Benchmark rynkowy: ~50% obejrzeń do końca.
Nasza reklama: 40% — nieco poniżej średniej.

👉 Rekomendacja: Rozważ skrócenie spotu do 15 sekund.
   Wersja 15s prawdopodobnie osiągnie wyższy wskaźnik obejrzeń do końca,
   bo większość porzuceń następuje między 15 a 22 sekundą.
```

**Warianty rekomendacji końcowej (wybierz odpowiedni):**

🟢 Świetny wynik:
> *"Reklama wideo osiąga doskonałe wyniki — [X]% odbiorców ogląda do końca. To znacznie powyżej średniej rynkowej. Kreacja skutecznie angażuje."*

🟡 Dobry wynik:
> *"Reklama osiąga dobry wynik ([X]% do końca, średnia rynkowa ~50%). Możemy sprawdzić czy skrócona wersja utrzymałaby podobny poziom przy niższym koszcie."*

🟠/🔴 Słaby wynik:
> *"[X]% odbiorców ogląda reklamę do końca — poniżej średniej rynkowej (~50%). Największy spadek następuje w [momencie]s. Rekomendujemy skróconą wersję lub nowe kreacje."*

**Jeśli jest wiele kreacji:** Pokaż zestawienie wszystkich i wyróżnij najlepszą i najsłabszą.

## Zasady komunikacji

- Zamiast "VCR" lub "completion rate" pisz "procent osób, które obejrzały do końca"
- Zamiast "kreacja" (jeśli klient może nie znać) pisz "spot" lub "wideo" lub użyj nazwy własnej
- Lejek tekstowy (▶️ → ✅) jest czytelniejszy niż sama tabela z procentami
- Zawsze odnieś wynik do benchmarku — sama liczba nic nie mówi klientowi
- Jeśli wynik słaby — daj konkretną rekomendację, nie tylko diagnozę
- Wskaż dokładnie moment największego porzucenia (np. "między 15 a 22 sekundą")
