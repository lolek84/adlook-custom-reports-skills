# Przewodnik stylu — Adlook DSP Skills

Zasady języka, formatowania i tonu obowiązujące we wszystkich skillach.

---

## 1. Słownik terminologii — polskie odpowiedniki

Każde DSP-owe pojęcie musi być przetłumaczone w odpowiedziach dla klienta.
W odpowiedziach dla AdOps można używać angielskich skrótów (CTR, eCPM, VCR) ale zawsze z progami liczbowymi.

| Termin angielski | Dla klienta (🟢) | Dla AdOps (🟣) |
|-----------------|-----------------|----------------|
| CTR | klikalność | CTR |
| Impressions | wyświetlenia | impr / impressions |
| Viewability | widoczność reklam | viewability |
| Reach | zasięg | reach |
| Frequency | częstotliwość | frequency |
| VCR / Video Completion Rate | obejrzenia do końca | VCR |
| eCPM | koszt za tysiąc wyświetleń | eCPM |
| Pacing | tempo wydatków | pacing |
| ROAS | zwrot z wydatków | ROAS |
| CPA | koszt konwersji | CPA |
| Line Item | część kampanii | LI |
| Supply Source / SSP | serwis reklamowy / platforma | SSP |
| Inventory | miejsca, gdzie pojawiała się reklama | inventory |
| Creative | reklama / baner / spot | creative |
| Budget | budżet | budget |
| Conversion | konwersja / działanie | conversion |
| Bid | stawka aukcyjna | bid |
| Environment | środowisko (strony www / aplikacje / TV) | environment |
| Campaign to date | od początku kampanii | CTD |
| Measurability | mierzalność | measurability |

---

## 2. Formatowanie liczb

| Typ | Format | Przykład |
|-----|--------|---------|
| CTR | 0,XX% (2 miejsca, polska przecinka) | 0,14% |
| Viewability / VCR / inne % | XX% (0 miejsc jeśli ≥1%) | 68% |
| Viewability / VCR <10% | X,X% | 8,4% |
| eCPM | $X,XX | $2,10 |
| Spend (dolary) | $X XXX (spacja jako separator tysięcy) | $18 400 |
| Impressions / Reach | X XXX XXX | 4 200 000 |
| Impressions skrócone (AdOps) | Xk / XM | 420k / 4,2M |
| Pacing delta | ±X% | +2% / −14% |
| ROAS | XXX% | 320% |
| Daty | DD.MM.YYYY lub D miesiąca RRRR | 8.05.2026 lub 8 maja 2026 |
| Dzień tygodnia | pon/wt/śr/czw/pt (AdOps skróty) | czw |

**Zasady ogólne:**
- Polska przecinka (0,14%) — nie angielska kropka (0.14%)
- Spacja jako separator tysięcy (1 800 000) — nie przecinka (1,800,000)
- Waluta zawsze przed liczbą ($25 000) — nie po (25 000 $)
- Procenty zawsze z % bezpośrednio po liczbie (68%) — nie "68 %"

---

## 3. Konwencje emoji

### Sygnały statusu (użyj konsekwentnie z tymi samymi progami)

| Emoji | Znaczenie | Progi |
|-------|-----------|-------|
| 🟢 | OK / dobry / powyżej normy | pacing delta −5% do +5%; CTR display >0,08%; viewability >50% |
| 🟡 | Uwaga / lekki problem | pacing delta −15% do −5% lub >+15%; CTR 0,04–0,08% |
| 🔴 | Problem / wymaga działania | pacing delta <−15%; zero delivery; CTR display <0,04% |
| ✅ | Potwierdzone OK | po weryfikacji — akcja wykonana / wynik spełniony |
| ⚠️ | Alert / deadline | kampania kończy się w ≤7 dni; anomalia wykryta |
| ⛔ | Stop / wyklucz | domena do blacklisty; kreacja do wstrzymania |

### Ikony sekcji (używaj w nagłówkach tabel i raportów)

| Emoji | Zastosowanie |
|-------|-------------|
| 📋 | Lista kampanii / przegląd |
| 📊 | Dane / statystyki / raport |
| 📍 | Zasięg geograficzny |
| 🌐 | Strony internetowe |
| 📱 | Aplikacje mobilne |
| 📺 | Smart TV / CTV |
| 🎨 | Kreacje / reklamy |
| 🛡 | Brand safety |
| 🔍 | Diagnostyka / analiza |
| 💰 | Budżet / wydatki |
| 👥 | Zasięg / odbiorcy |
| 🚀 | Skaluj / zwiększ |

### Oceny kreacji i działania

| Emoji | Znaczenie |
|-------|-----------|
| 🚀 | Skaluj — przenieś tu budżet |
| 👀 | Obserwuj — wyniki w normie |
| ⛔ | Wstrzymaj — słabe wyniki |
| 📊 | Za mało danych (<10 000 imp) |
| 🏆 | Najlepsza kreacja |

---

## 4. Ton per audience

### 🟢 Klient — język biznesowy

**Zasady:**
- Gotowe zdania do wklejenia w maila — bez żadnej edycji przez użytkownika
- Żadnych angielskich skrótów bez tłumaczenia (zakaz: CTR, eCPM, VCR, LI, SSP, CPM)
- Każda metryka z interpretacją ("68% — to dobry wynik, powyżej normy 50%")
- Długość: max 2 zdania dla prostych odpowiedzi, max 7 bullet pointów dla raportów
- Ton: pewny, bez "może", "prawdopodobnie", "wydaje się" — albo wiesz albo nie
- Zakończ wnioskiem lub rekomendacją — klient nigdy nie kończy z samą liczbą

**Przykład dobry:**
> "Klikalność wyniosła 0,14% — prawie dwukrotnie powyżej normy (0,08%). Kreacje dobrze przyciągają uwagę."

**Przykład zły:**
> "CTR jest na poziomie 0.14% co może być dobrym wynikiem w porównaniu do industry benchmark wynoszącego około 0.08%."

---

### 🟣 AdOps — precyzja techniczna

**Zasady:**
- Progi liczbowe przy każdej ocenie (nie "za wysoki" ale "eCPM $3,80 — 80% powyżej benchmarku display $2,10")
- Delta i trend przy każdej metryce (↑ +27% WoW; ↓ −14% MoM)
- Konkretne wartości do zmiany ("zwiększ bid floor z $0,72 do $1,50")
- Deadline przy każdej akcji (DZIŚ / JUTRO / W TYM TYGODNIU)
- Format: jedna linia z pełnym obrazem → szczegóły poniżej
- Odesłanie do właściwego skilla przy każdym problemie (→ A02, → A03, → A16)

**Przykład dobry:**
> "CTR: 0,14% | last 7d | Nike Air Max — Remarketing_Desktop"
> "Trend: ↑ vs poprzedni tydzień (0,11%, +27%) | Benchmark display: 0,05–0,12% | 🟢"

**Przykład zły:**
> "CTR jest powyżej normy i idzie w górę."

---

### 🟠 Wspólny (klient + AdOps)

Rozdziel warianty nagłówkami:
```
**Dla klienta:**
[wariant kliencki]

**Dla AdOps:**
[wariant techniczny]
```

---

## 5. Limity długości odpowiedzi

| Typ odpowiedzi | Klient | AdOps |
|----------------|--------|-------|
| Szybki status (W01, K02) | max 2 zdania | 1 linia |
| Pytanie o metrykę (W02) | 3–4 zdania | definicja + próg + jak optymalizować |
| Raport kampanii (K01) | 5–7 sekcji, max 1 str. | tabela + lista działań |
| Raport końcowy (K12) | pełny dokument | pełny dokument + delta |
| Alert (A02, A03, A16) | 2 zdania + co robimy | root cause + lista działań z deadlinami |

---

## 6. Frazy zakazane

| Zamiast | Użyj |
|---------|------|
| "może", "być może", "prawdopodobnie" (jako główna teza) | konkretna diagnoza lub "nie mam danych żeby ocenić" |
| "warto rozważyć" | "rekomendujemy [konkretną akcję]" |
| "wskaźnik klikalności CTR" | "klikalność" (klient) lub "CTR" (AdOps) |
| "benchmark branżowy" | "norma dla reklam [typ]: [wartość]%" |
| "poniżej/powyżej oczekiwań" | "poniżej/powyżej [konkretna liczba]%" |
| "nieznacznie" / "trochę" | podaj delta% zamiast słowa |
| "dane są niedostępne" (i nic więcej) | + wyjaśnienie dlaczego + co zrobić żeby były dostępne |
| "inventory" (dla klienta) | "miejsca gdzie pojawiała się reklama" |
| "line item" (dla klienta) | "część kampanii" lub nazwa LI |
| "SSP" (dla klienta) | "platforma reklamowa" lub "serwis" |

---

## 7. Struktura pliku skill

Każdy plik skill musi zawierać:

```yaml
---
name: [kod]-[nazwa-kebab]
description: [kiedy używać, triggery — używane do automatycznego wyboru skilla]
version: 1.0.0
quality_score: [1–10]
---
```

**Sekcje obowiązkowe:**
1. `## Cel` — jedno zdanie
2. `## Kroki wykonania` — numerowane kroki z MCP calls
3. Agent oblicza samodzielnie — blok kodu z formułami (jeśli dotyczy)
4. Przykład output — z realnymi wartościami liczbowymi (nie placeholdery X/Y/Z)
5. Edge case — co gdy brak danych / kampania nieaktywna / metryka niedostępna
6. `## Zasady` / `## Zasady komunikacji` — punkty zamykające

**Zakaz:**
- Placeholdery `[X]`, `[Y]`, `[N]` w przykładach output — zawsze realne liczby
- Puste sekcje "jeśli dostępne" bez treści
- Brak edge case'u dla brakujących danych
