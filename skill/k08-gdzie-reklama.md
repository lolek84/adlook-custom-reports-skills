---
name: k08-gdzie-reklama
description: Użyj tego skilla gdy klient pyta gdzie wyświetlała się jego reklama, na jakich stronach lub w aplikacjach, transparentność placementów. Triggery: "gdzie była reklama", "na jakich stronach", "pokaż placement", "gdzie się wyświetlaliśmy", "które strony", "jakie serwisy", "lista stron", "gdzie pojawiła się reklama".
version: 1.0.0
quality_score: 9
---

# K08 — Gdzie wyświetlała się reklama?

Lista serwisów i aplikacji, na których pojawiła się reklama klienta — transparentność placementów.

## Cel

Pokazać klientowi gdzie faktycznie była jego reklama — w prostej formie, bez kodów technicznych.

## Kroki wykonania

### 1. Pobierz dane z MCP

Wywołaj `run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `TOP_LEVEL_DOMAIN`
- `APP_NAME`
- `SUPPLY_SOURCE`
- `ENVIRONMENT`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

**Edge case:** Jeśli `APP_NAME` jest puste dla wierszy app/CTV — użyj `APP_ID` z adnotacją "(aplikacja mobilna, nazwa niedostępna)". Jeśli `TOP_LEVEL_DOMAIN` zawiera hash lub kod zamiast nazwy — pomijaj te wiersze i wpisz łączny % jako "inne / nierozpoznane". Jeśli kampania jeszcze się nie rozpoczęła (brak impresji) — odpowiedz: *"Kampania nie wystartowała — brak danych o placementach."* Jeśli łączne wyświetlenia = 0 (np. kampania pauzowana) — zaznacz: *"Brak wyświetleń w podanym okresie — sprawdź status kampanii."*

### 2. Przetwarzanie

Agent oblicza samodzielnie:

```
web_impresje   = IMPRESSIONS gdzie ENVIRONMENT = "web"
app_impresje   = IMPRESSIONS gdzie ENVIRONMENT = "app" lub "ctv"
łącznie        = web_impresje + app_impresje

udział_web_%   = web_impresje / łącznie × 100
udział_app_%   = 100 − udział_web_%

top10_web      = sortuj po IMPRESSIONS malejąco, weź top 10 domen (web)
top10_app      = sortuj po IMPRESSIONS malejąco, weź top 10 aplikacji
```

### 3. Sprawdź jakość inventory

Agent flaguje każdą pozycję:
- 🟢 **Znany serwis** — rozpoznawalna marka lub platforma (wp.pl, onet.pl, YouTube itp.)
- 🟡 **Nieznany serwis** — mała domena, brak kontekstu — "warto sprawdzić"
- 🔴 **Podejrzany** — nazwa sugeruje treści nieodpowiednie dla marki klienta

### 4. Przygotuj output

Użyj poniższego szablonu — podstaw wartości i dodaj flagi przy serwisach:

```
🌐 Gdzie wyświetlała się reklama — Nike Air Max (kwiecień 2026)

Podział środowisk:
  🌍 Strony internetowe:    68%   (2 850 000 wyświetleń)
  📱 Aplikacje mobilne:     29%   (1 220 000 wyświetleń)
  📺 Smart TV (CTV):         3%   (  130 000 wyświetleń)

TOP 10 STRON INTERNETOWYCH:
  1. 🟢 wp.pl           — 12%  ($2 200)
  2. 🟢 onet.pl         —  9%  ($1 650)
  3. 🟢 gazeta.pl       —  7%  ($1 280)
  4. 🟢 interia.pl      —  6%  ($1 100)
  5. 🟡 artykuly24.pl   —  4%  ($  740)  — mniejszy serwis, warto sprawdzić
  6. 🟢 sport.pl        —  4%  ($  730)
  7. 🟢 pudelek.pl      —  3%  ($  550)
  8. 🟢 tvn24.pl        —  3%  ($  550)
  9. 🟢 bankier.pl      —  2%  ($  370)
  10. 🟢 fakt.pl        —  2%  ($  370)

TOP 5 APLIKACJI:
  1. 🟢 Onet             —  8%
  2. 🟢 WP Pilot         —  6%
  3. 🟢 Interia Sport    —  5%
  4. 🟡 (aplikacja mobilna, nazwa niedostępna)  —  4%
  5. 🟢 Allegro          —  3%

✅ Reklama pojawiała się głównie na znanych polskich serwisach informacyjnych.
   Jeden serwis (artykuly24.pl) wymaga weryfikacji — sprawdzimy kontekst treści.
```

**Warianty komentarza końcowego:**

🟢 Dobre inventory:
> *"Reklama pojawiała się na sprawdzonych serwisach. Inventory jest zgodne z profilem marki."*

🟡 Mieszane inventory:
> *"Większość wyświetleń przypadła na znane serwisy. [N] pozycji wymaga weryfikacji — sprawdzimy i w razie potrzeby wdrożymy wykluczenia."*

🔴 Problematyczne inventory:
> *"Część wyświetleń pojawiła się na serwisach niezgodnych z profilem marki. Nasz zespół wdroży wykluczenia i poinformuje o korekcie."*

## Zasady komunikacji

- Zamiast "supply source" pisz "serwis" lub "platforma"
- Zamiast "inventory" pisz "miejsca, gdzie pojawiała się reklama"
- Zamiast "environment" pisz "środowisko" lub rozpisz jako "strony www / aplikacje / Smart TV"
- Nie pokazuj surowych ID domen ani hashy — tylko rozpoznawalne nazwy
- Zawsze skomentuj ogólną jakość listy: czy to znane marki zgodne z profilem klienta
- Jeśli klient wcześniej wspominał o konkretnych serwisach które chciał osiągnąć — odnieś się czy się pojawiły
- Jeśli wykryto problematyczne inventory → zaznacz że zespół wdroży wykluczenia (A06 brand safety audit)
