---
name: k09-na-jakich-urzadzeniach
description: Użyj tego skilla gdy klient pyta o rozkład wyświetleń między urządzeniami — desktop, mobile, tablet, CTV. Triggery: "na jakich urządzeniach", "ile na mobile", "CTV", "desktop vs mobile", "urządzenia", "smartfon", "telewizor", "tablet", "rozkład urządzeń".
version: 1.0.0
quality_score: 9
---

# K09 — Na jakich urządzeniach?

Rozkład wyświetleń między desktop, mobile, tablet i Smart TV.

## Cel

Pokazać klientowi gdzie docierała kampania pod kątem urządzeń — w prostym języku, z wnioskiem co to oznacza.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `DEVICE_TYPE`
- `OPERATING_SYSTEM`
- `ENVIRONMENT`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `CTR`
- `VIEWABILITY`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

**Edge case:** Jeśli brak danych dla CTV (ENVIRONMENT = "ctv" → 0 impresji) — pomiń sekcję CTV z adnotacją: *"Kampania nie obejmowała reklam na Smart TV."* Jeśli łączne impresje = 0 (kampania nie wystartowała lub pauzowana) — odpowiedz: *"Brak danych o urządzeniach — kampania nie wyświetlała się w podanym okresie."* Jeśli OPERATING_SYSTEM jest niedostępny — pomiń podział OS, zostaw tylko DEVICE_TYPE.

### 2. Grupowanie

Agent grupuje samodzielnie:

```
desktop  = DEVICE_TYPE in ["Desktop"]
mobile   = DEVICE_TYPE in ["Mobile Phone", "Smartphone"]
tablet   = DEVICE_TYPE in ["Tablet"]
ctv      = DEVICE_TYPE in ["Connected TV", "CTV"] lub ENVIRONMENT = "ctv"

dla każdej grupy: % udziału w IMPRESSIONS i TOTAL_SPEND_USD
```

Benchmarki rynkowe (PL, 2026, norma branżowa):
- Mobile: ~55–60% | Desktop: ~30–35% | Tablet: ~5% | CTV: rosnące, ~5–10%

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📱 Urządzenia — Nike Air Max (kwiecień 2026)

Gdzie wyświetlała się reklama:

  🖥  Komputery (desktop):          35%  ($8 750)
      Klikalność: 0,14% | Widoczność: 74%

  📱 Smartfony (mobile):            58%  ($14 500)
      Klikalność: 0,11% | Widoczność: 63%

  📟 Tablety:                        4%  ( $1 000)
      Klikalność: 0,09% | Widoczność: 66%

  📺 Smart TV i telewizory (CTV):    3%  (   $750)
      Klikalność: n/d (format TV)  | Widoczność: 82%

Rozkład jest zbliżony do typowego dla polskiego rynku
(mobile ok. 55–60%, desktop ok. 30–35%).

✅ Komputery mają wyższą klikalność (0,14%) niż smartfony (0,11%)
   — to normalne, ponieważ na małym ekranie przypadkowe kliknięcia są ograniczone.
   Smart TV osiąga najwyższą widoczność reklam (82%) — premium inventory.
```

**Warianty wniosku końcowego:**

Jeśli wynik zbliżony do benchmarku:
> *"Rozkład urządzeń jest typowy dla reklam online w Polsce. Większość odbiorców widziała reklamę na smartfonie."*

Jeśli mobile dominuje ponad benchmarkiem (>70%):
> *"Kampania dotarła głównie do użytkowników smartfonów ([X]%). Jeśli chcesz lepszą klikalność, warto rozważyć dedykowane kreacje do formatu mobile lub większy udział desktop w kolejnej kampanii."*

Jeśli CTV jest znaczący (>10%):
> *"[X]% wyświetleń pojawiło się na Smart TV — to premium inventory z najwyższą widocznością. Warto kontynuować emisję na telewizorach streamingowych."*

## Zasady komunikacji

- Zamiast "CTV" lub "Connected TV" pisz "Smart TV i telewizory streamingowe"
- Zamiast "device type" pisz "urządzenie"
- Jeśli klikalność na mobile <80% desktop — zaznacz że to normalne, nie problem
- Zawsze porównaj do benchmarku rynkowego (czy rozkład jest typowy czy nie)
- Wyróżnij urządzenie z najlepszą widocznością i najlepszą klikalością z wnioskiem na przyszłość
