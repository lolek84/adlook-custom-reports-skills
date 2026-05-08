---
name: k10-zasieg-geograficzny
description: Użyj tego skilla gdy klient pyta o zasięg geograficzny kampanii, w jakich miastach i regionach wyświetlała się reklama. Triggery: "gdzie geograficznie", "jakie miasta", "Warszawa vs reszta", "rozkład regionalny", "które regiony", "geografia kampanii", "rozkład miast", "gdzie w Polsce".
version: 1.0.0
quality_score: 9
---

# K10 — Zasięg geograficzny

W jakich miastach i regionach wyświetlała się kampania.

## Cel

Pokazać klientowi geograficzny rozkład kampanii — czy docieraliśmy do właściwych miejsc.

## Kroki wykonania

### 1. Pobierz dane z MCP

`run_report_preview` z parametrami:

**Dims:**
- `CAMPAIGN_NAME`
- `COUNTRY`
- `REGION`
- `CITY`

**Metrics:**
- `IMPRESSIONS`
- `TOTAL_SPEND_USD`
- `REACH`

**Date range:** zakres podany przez użytkownika lub campaign_to_date.

**Edge case:** Jeśli REACH = 0 lub brak — pokaż tylko wyświetlenia z adnotacją: *"Liczba unikalnych osób per miasto jest niedostępna — pokazuję liczbę wyświetleń."* Nie pokazuj POSTAL_CODE — zbyt szczegółowe dla klienta. Jeśli kampania jeszcze się nie rozpoczęła (0 impresji) — odpowiedz: *"Kampania nie wystartowała — brak danych geograficznych."* Jeśli wykryto ruch spoza zaplanowanego obszaru targetowania — zaznacz i zaproponuj weryfikację ustawień geo → A13 (audit line-itemów).

### 2. Przetwarzanie

Agent oblicza samodzielnie:

```
top_10_miast   = sortuj CITY po IMPRESSIONS malejąco, weź top 10
top_5_regionów = sortuj REGION po IMPRESSIONS malejąco, weź top 5

udział_top3_%  = suma IMPRESSIONS top 3 miast / łączne IMPRESSIONS × 100
```

### 3. Przygotuj output

Użyj poniższego szablonu — podstaw realne wartości:

```
📍 Zasięg geograficzny — Nike Air Max (kwiecień 2026)

TOP 10 MIAST:

  1.  Warszawa         —  38%   (1 596 000 wyświetleń)
  2.  Kraków           —  13%   (  546 000 wyświetleń)
  3.  Wrocław          —  10%   (  420 000 wyświetleń)
  4.  Trójmiasto       —   8%   (  336 000 wyświetleń)
  5.  Poznań           —   6%   (  252 000 wyświetleń)
  6.  Łódź             —   5%   (  210 000 wyświetleń)
  7.  Katowice         —   4%   (  168 000 wyświetleń)
  8.  Lublin           —   3%   (  126 000 wyświetleń)
  9.  Bydgoszcz        —   2%   (   84 000 wyświetleń)
  10. Szczecin         —   2%   (   84 000 wyświetleń)

      Pozostałe        —   9%   (  378 000 wyświetleń)

TOP 5 WOJEWÓDZTW:
  Mazowieckie    38% | Małopolskie 13% | Dolnośląskie 10% | Pomorskie 8% | Wielkopolskie 6%

✅ Reklama dotarła głównie do największych polskich miast.
   Warszawa, Kraków i Wrocław łącznie odpowiadają za 61% wyświetleń —
   co jest typowe dla ogólnopolskich kampanii z targetowaniem miejskim.
```

**Warianty wniosku końcowego:**

Jeśli rozkład zgodny z planowanym geo targetowaniem:
> *"Rozkład geograficzny jest zgodny z założeniami kampanii. Reklama dotarła do zaplanowanych miast i regionów."*

Jeśli jedna lokalizacja dominuje ponad oczekiwania (>50% z jednego miasta):
> *"Warszawa odpowiada za [X]% wyświetleń — kampania jest wyraźnie skoncentrowana na stolicy. Jeśli chcesz równomierniejszego zasięgu ogólnopolskiego, możemy dostosować targetowanie."*

Jeśli pojawił się ruch spoza zaplanowanego obszaru:
> *"Część wyświetleń pojawiła się poza zaplanowanym obszarem targetowania (np. [miasto]). Nasz zespół sprawdzi ustawienia geo i w razie potrzeby dostosuje kampanię."*

## Zasady komunikacji

- Używaj polskich nazw miast i województw (nie kodów)
- Nie pokazuj POSTAL_CODE — zbyt szczegółowe dla klienta
- Zawsze skomentuj czy rozkład jest zgodny z planowanym targetowaniem
- Jeśli kampania ogólnopolska — zaznacz że Warszawa typowo odpowiada za ~30–40% ruchu (norma rynku reklamowego online w Polsce)
- Zaokrąglaj do pełnych % dla czytelności
