---
name: k04-zasieg-i-czestotliwosc
description: Użyj tego skilla gdy klient pyta o zasięg kampanii, ile osób zobaczyło reklamę, jak często ktoś widział reklamę, frequency. Triggery: "ile osób zobaczyło reklamę", "jaki mamy zasięg", "ile razy ktoś widział naszą reklamę", "frequency", "zasięg kampanii", "reach", "ile unikalnych użytkowników".
version: 1.0.0
quality_score: 9
---

# K04 — Zasięg i częstotliwość

Ile unikalnych osób dotknęła kampania i jak często widziały reklamę.

## Cel

Pokazać realne dotarcie kampanii — ilu różnych ludzi widziało reklamę i ile razy.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `DATE`

**Metrics:**
- `REACH`
- `FREQUENCY`
- `IMPRESSIONS`

**Date range:** zakres podany przez użytkownika lub last_30_days.

**Edge case:** Jeśli brak danych REACH (niektóre kampanie nie mierzą unikalnych użytkowników) — odpowiedz: *"Dla tej kampanii nie mierzono unikalnych odbiorców. Mogę pokazać liczbę wyświetleń — każde wyświetlenie to jeden kontakt z reklamą, ale ta sama osoba mogła widzieć ją wielokrotnie."*
**Edge case:** Jeśli kampania jeszcze nie wystartowała — odpowiedz: *"Kampania [NAZWA] nie emitowała jeszcze reklam — brak danych o zasięgu. Dane będą dostępne po pierwszym dniu emisji."*

### 2. Obliczenia

Agent oblicza samodzielnie:

```
łączne_wyświetlenia = suma IMPRESSIONS za cały okres
łączny_zasięg       = REACH za cały okres (nie sumuj dziennych wartości — to unikalni użytkownicy)
średnia_częstotliwość = łączne_wyświetlenia / łączny_zasięg
trend_tygodniowy    = grupuj DATE po tygodniach → REACH + IMPRESSIONS per tydzień
```

### 3. Oceń częstotliwość kontaktu

Progi oparte na standardzie branżowym (rekomendacja IAB dla kampanii awareness).

| Średnia częstotliwość | Ocena | Co to znaczy dla klienta |
|---|---|---|
| 1–3 kontakty | 🟢 Optymalna | Reklama dociera do szerokiej grupy, każda osoba widzi ją kilka razy |
| 4–7 kontaktów | 🟡 Wysoka | Niektórzy odbiorcy mogą widzieć reklamę za często |
| 8+ kontaktów | 🔴 Za wysoka | Ryzyko znużenia — ta sama grupa osób widzi reklamę wielokrotnie, warto rozszerzyć grupę docelową |

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i wybierz właściwy wariant oceny:

```
👥 Zasięg kampanii — Nike Air Max (kwiecień 2026)

Reklama dotarła do:   1 800 000 unikalnych osób
                      (tyle różnych ludzi zobaczyło reklamę co najmniej raz)
Łączne wyświetlenia:  5 400 000
                      (tyle razy łącznie pojawiła się reklama)
Średnio każda osoba
widziała reklamę:     3× w ciągu miesiąca  🟢

📅 Trend tygodniowy:
  Tydzień 1 (1–7 kwi):   620 000 osób · 2,8× średnio
  Tydzień 2 (8–14 kwi):  710 000 osób · 3,1× średnio
  Tydzień 3 (15–21 kwi): 680 000 osób · 3,2× średnio
  Tydzień 4 (22–30 kwi): 540 000 osób · 3,0× średnio

✅ Zasięg rośnie stabilnie. Reklama jest wyświetlana w zdrowym rytmie —
   każda osoba widzi ją średnio 3 razy, co jest optymalnym wynikiem.
```

**Warianty oceny końcowej (wybierz odpowiedni):**

🟢 Optymalna częstotliwość:
> *"Kampania osiąga szeroki zasięg przy zdrowej częstotliwości. Każda osoba widziała reklamę średnio [N]× — to dobry balans między dotarciem a unikaniem znużenia."*

🟡 Wysoka częstotliwość:
> *"Kampania ma stosunkowo wysoką częstotliwość ([N]× na osobę). Część odbiorców mogła widzieć reklamę zbyt często. Możemy rozszerzyć grupę docelową, żeby docierać do nowych osób zamiast pokazywać reklamę tym samym."*

🔴 Za wysoka częstotliwość:
> *"Kampania wielokrotnie trafia do tych samych osób ([N]× na osobę). Zalecamy rozszerzenie grupy docelowej lub dodanie limitu wyświetleń na osobę — w tej chwili budżet prawdopodobnie nie jest optymalnie wykorzystywany."*

## Zasady komunikacji

- Zamiast "reach" pisz "liczba unikalnych osób" lub "zasięg (liczba różnych ludzi)"
- Zamiast "frequency" pisz "częstotliwość kontaktu" lub "ile razy każda osoba widziała reklamę"
- Zamiast "audience" pisz "grupa docelowa" lub "odbiorcy"
- Wyjaśnij różnicę między wyświetleniami a zasięgiem jeśli klient może jej nie znać
- Jeśli częstotliwość jest wysoka — zaproponuj konkretne rozwiązanie, nie tylko diagnozę
- Liczby zaokrąglaj do tysięcy dla czytelności
