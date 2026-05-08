---
name: a18-optymalizacja-budzetu
description: Użyj tego skilla gdy AdOps chce kompleksowych rekomendacji optymalizacji budżetu kampanii — które line itemy skalować, które ograniczać, jak realokować wydatki żeby poprawić wyniki. Triggery: "optymalizuj budżet", "jak poprawić wyniki", "co zmienić w kampanii", "realokacja budżetu", "które LI skalować", "optymalizacja wydatków", "gdzie przenieść budżet", "co wyłączyć a co zwiększyć".
version: 1.0.0
quality_score: 9
---

# A18 — Optymalizacja budżetu

Kompleksowe rekomendacje realokacji budżetu między line itemami, formatami i segmentami — z konkretnymi kwotami.

## Cel

Priorytetowana lista zmian w budżecie z przewidywanym efektem — gotowa do wdrożenia bez dalszej analizy.

## Kroki wykonania

### 1. Pobierz dane (4 raporty równolegle)

**Raport 1 — LI performance:**
`run_report_preview` dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_BIDDING_MODEL` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `ECPM_USD`, `TOTAL_CONVERSIONS`, `ECPA_USD` — last_14_days.

**Raport 2 — Format / creative type:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE` — last_14_days.

**Raport 3 — Device breakdown:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `DEVICE_TYPE` + metrics: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` — last_14_days.

**Raport 4 — Pacing:**
dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE` + metrics: `TOTAL_SPEND_USD` — campaign_to_date.

**Edge case:** Jeśli <14 dni danych — użyj dostępnego okresu i zaznacz: *"Analiza oparta na [N] dniach danych — rekomendacje wstępne, zweryfikuj po 7 dodatkowych dniach."*

### 2. Oblicz efficiency score per LI

Agent oblicza samodzielnie:

```
# Score per LI (bez konwersji):
efficiency = CTR × (VIEWABILITY / 100) / (ECPM_USD / 10)
# Score per LI (z konwersjami):
efficiency = (TOTAL_CONVERSIONS / TOTAL_SPEND_USD) × 100   [konwersje per $100 spend]

mediana_eff = mediana efficiency dla LI z ≥$500 spend

KLASYFIKACJA:
  efficiency > 1,5 × mediana  → 🚀 SKALUJ
  efficiency 0,75–1,5 × med.  → 👀 UTRZYMAJ
  efficiency < 0,75 × mediana → 🔻 OGRANICZ
  spend < $500 lub imp < 50k  → 📊 Za mało danych

# Kwoty realokacji:
do_zabrania   = suma spend × 0,3 dla LI 🔻 (zabierz 30% z każdego słabego)
do_dodania    = do_zabrania × 0,9   [10% bufor bezpieczeństwa]
podział_TOP   = do_dodania / count(LI 🚀)   [równy podział na TOP LI]
```

### 3. Sprawdź pacing per LI

```
dla każdego LI:
  pacing_oczekiwany = (dni_od_startu / dni_całkowite) × 100
  pacing_rzeczywisty = (spend / li_budget) × 100
  delta = pacing_rzeczywisty − pacing_oczekiwany

  delta < −20% → priorytet: zbadaj co blokuje delivery → A02
  delta > +20% → sprawdź czy nie przekroczy budżetu → A16
```

### 4. Przygotuj output

```
💰 OPTYMALIZACJA BUDŻETU — Nike Air Max (last 14 dni)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RANKING LINE ITEMÓW:

LI                        | Spend/14d | CTR    | Viewab. | eCPM   | Score | Akcja
──────────────────────────────────────────────────────────────────────────────────
Prospecting_Mobile_App    | $5 200    | 0,19%  | 74%     | $1,90  | 14,1  | 🚀 SKALUJ +$1 800
Remarketing_Desktop       | $4 100    | 0,16%  | 68%     | $2,10  |  9,8  | 👀 UTRZYMAJ
Prospecting_Desktop_Web   | $7 800    | 0,12%  | 63%     | $2,40  |  7,2  | 👀 UTRZYMAJ
Remarketing_Tablet        | $2 400    | 0,06%  | 54%     | $3,10  |  3,5  | 🔻 OGRANICZ −$700
Prospecting_CTV           |   $900    | 0,02%  | 88%     | $8,40  |  2,1  | 🔻 OGRANICZ −$400
Retargeting_Old_List      |   $600    | 0,03%  | 51%     | $2,90  |  1,8  | 🔻 OGRANICZ −$300

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REKOMENDACJE (w kolejności priorytetu):

  □ [DZIŚ] Przesuń $1 800 do "Prospecting_Mobile_App"
    → Score 2× wyższy niż średnia, ale tylko 24% budżetu — wyraźnie niedofinansowany
    → Zwiększ dzienny cap z $370/dz do $500/dz

  □ [DZIŚ] Ogranicz "Remarketing_Tablet" o $700/14d (−30%)
    → CTR 0,06% przy eCPM $3,10 — najgorszy stosunek kosztu do wyników
    → Zmniejsz dzienny cap z $171/dz do $120/dz

  □ [JUTRO] Ogranicz "Prospecting_CTV" o $400/14d (−44%)
    → CTR 0,02% przy eCPM $8,40 — 4× droższy od display bez proporcjonalnych wyników
    → Utrzymaj tylko testowo $500/14d do zebrania większej próby danych

  □ [JUTRO] Wstrzymaj "Retargeting_Old_List" (−$300/14d)
    → Lista odbiorców prawdopodobnie przestarzała — CTR 0,03%, niższy niż prospecting
    → Odśwież segment lub zamknij LI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PODSUMOWANIE PRZESUNIĘCIA:

  Zabieramy z: Tablet $700 + CTV $400 + Old_List $300 = $1 400
  Dokładamy do: Mobile_App +$1 400 (bufor: $400 jako rezerwa dzienna)

  Prognozowany efekt po 14 dniach:
  • CTR kampanii: 0,13% → ~0,16% (+23%)
  • Przy tym samym budżecie całkowitym ($21 000/14d)

PACING ALERTS:
  ⚠️ Prospecting_Mobile_App: pacing −18% → kandydat do zwiększenia daily cap (A02 jeśli utrzyma się po podwyżce)
  ✅ Remarketing_Desktop: pacing +1% → OK
```

**Edge case — wszystkie LI mają podobny score:**

```
📊 Wszystkie line itemy mają podobną efektywność (score w zakresie 0,85–1,15× mediany).
   Brak wyraźnego kandydata do realokacji.

   Rekomendacja: sprawdź optymalizację na poziomie kreacji (A05) lub segmentów geo (A14) —
   różnica wydajności może być ukryta na niższym poziomie granulacji.
```

## Zasady

- Minimum $500 spend lub 50 000 imp per LI żeby oceniać — mniej = "za mało danych"
- Realokacja max 30% budżetu jednego LI w jednej iteracji — większe zmiany = ryzyko pacing collapse
- Zawsze podaj konkretny $ i konkretny dzienny cap do ustawienia
- Deadline: DZIŚ = priorytet >1,5× mediany różnicy; JUTRO = 0,75–1,5×; W TYM TYGODNIU = <0,75×
- Jeśli underpacing >20% na TOP LI → najpierw A02 (diagnostyka), potem realokacja
- Zakończ prognozowanym efektem w % poprawy CTR lub ROAS
