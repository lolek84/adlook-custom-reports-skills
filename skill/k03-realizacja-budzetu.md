---
name: k03-realizacja-budzetu
description: Użyj tego skilla gdy klient pyta o budżet kampanii — ile zostało, ile wydano, czy wystarczy do końca. Triggery: "ile budżetu zostało", "czy budżet wystarczy do końca", "ile wydaliśmy", "pacing budżetu", "realizacja budżetu", "ile pieniędzy zostało", "kiedy skończy się budżet".
version: 1.0.0
quality_score: 9
---

# K03 — Realizacja budżetu

Ile z budżetu kampanii zostało wydane, ile zostało, czy wystarczy do końca.

## Cel

Jasna odpowiedź na pytanie o pieniądze — ile wydano, ile zostało, kiedy się skończy.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `CAMPAIGN_BUDGET`
- `CAMPAIGN_START_DATE`
- `CAMPAIGN_END_DATE`

**Metrics:**
- `TOTAL_SPEND_USD`

**Date range:** campaign_to_date.

Jeśli chcesz zobaczyć trend wydatków, pobierz też z `DATE` w dims za ostatnie 7–14 dni.

**Edge case:** Jeśli kampania jeszcze się nie rozpoczęła — odpowiedz: *"Kampania [NAZWA] startuje [DATA]. Do tej pory nie wydano żadnych środków."*
Jeśli brak danych budżetu — odpowiedz: *"Nie mam dostępu do budżetu tej kampanii. Sprawdź u swojego opiekuna."*

### 2. Obliczenia

Agent oblicza samodzielnie wszystkie poniższe wartości:

```
wydano         = TOTAL_SPEND_USD
budżet         = CAMPAIGN_BUDGET
pozostało      = budżet − wydano
procent        = (wydano / budżet) × 100

dni_od_startu  = dziś − CAMPAIGN_START_DATE
dni_całkowite  = CAMPAIGN_END_DATE − CAMPAIGN_START_DATE
dni_pozostałe  = CAMPAIGN_END_DATE − dziś
tempo_dzienne  = wydano / dni_od_startu        (ile $ na dzień średnio)
prognoza       = wydano + (tempo_dzienne × dni_pozostałe)
```

### 3. Ocena prognozy

| Prognoza vs budżet | Status | Co to znaczy |
|---|---|---|
| 90–110% budżetu | 🟢 W porządku | Kampania wyda budżet zgodnie z planem |
| Powyżej 110% | 🟡 Ryzyko nadwyżki | Kampania wydaje za szybko — budżet może skończyć się przed terminem |
| Poniżej 90% | 🟡 Ryzyko niedowydania | Kampania wydaje za wolno — część budżetu może pozostać niewykorzystana |
| Poniżej 70% | 🔴 Wymaga działania | Znaczna część budżetu zagrożona — konieczna interwencja |

### 4. Przygotuj output

Użyj poniższego szablonu dosłownie — podstaw wartości i wybierz właściwy wariant prognozy:

```
💰 Realizacja budżetu — Nike Air Max

Wydano:         $18 400 z $25 000  (74% budżetu)
Pozostało:      $6 600
Dni do końca:   8 dni

📈 Prognoza przy obecnym tempie ($920/dzień):
→ Kampania wyda łącznie ok. $25 760 — nieznacznie powyżej budżetu.
   Jeśli chcesz, możemy lekko zwolnić tempo w ostatnich dniach.

🟢 Podsumowanie: Kampania realizuje budżet zgodnie z planem.
```

**Warianty podsumowania (wybierz odpowiedni):**

🟢 Bezpiecznie:
> *"Kampania realizuje budżet zgodnie z planem. Do końca zostało $[X] i [N] dni — wszystko gra."*

🟡 Ryzyko nadwyżki:
> *"Kampania wydaje budżet nieco szybciej niż planowano. Przy obecnym tempie skończy się [DATA] — [N] dni przed terminem. Czy chcesz, żebyśmy dostosowali tempo?"*

🟡 Ryzyko niedowydania:
> *"Kampania wydaje budżet wolniej niż planowano. Przy obecnym tempie zostanie niewykorzystane ok. $[X]. Nasz zespół może przyspieszyć tempo — daj znać czy chcesz zmian."*

🔴 Krytyczne:
> *"Kampania jest znacznie poniżej tempa — bez interwencji zostanie niewydane ok. $[X] ([Y]% budżetu). Nasz zespół już analizuje przyczynę."*
→ Przy statusie 🔴 lub prognoza < 70% budżetu: uruchom skill A02 (diagnostyka underpacingu).

**Specjalny komunikat przy <7 dniach do końca:**
> *"⏰ Uwaga: do końca kampanii zostało tylko [N] dni. Przy obecnym tempie [wyda całość / zostanie $X]."*

## Zasady komunikacji

- Zamiast "on-track" pisz "zgodnie z planem" lub "w porządku"
- Zamiast "pacing" pisz "tempo wydatków"
- Podawaj kwoty zaokrąglone do pełnych dolarów ($18 400, nie $18 423,51)
- Prognozę podawaj pewnie, nie jako hipotezę — "kampania wyda", nie "kampania może wydać"
- Zawsze na końcu: co klient może zrobić jeśli wynik nie jest zielony (pytanie lub deklaracja działania)
- Jeśli zostało <7 dni — wyróżnij to osobno i wyraźnie
