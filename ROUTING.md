# Macierz routingu skillów — Adlook DSP

Dokument dla agenta: jak wybrać właściwy skill gdy pytanie pasuje do kilku.

---

## Krok 1 — Kto pyta?

| Sygnał | Audience |
|--------|----------|
| "napisz do klienta", "co powiedzieć klientowi", "wyślij maila" | 🟢 Klient |
| "sprawdź", "zdiagnozuj", "audit", "co zmienić", "bid", "LI", "SSP" | 🟣 AdOps |
| Brak kontekstu | → zapytaj lub domyślnie 🟠 oba warianty |

---

## Krok 2 — Co chcą wiedzieć?

### "Jak idzie kampania?" — spektrum szczegółowości

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Jak leci?" / "Szybki status"        → W01  (1–2 zdania, jedna liczba)
"Czy kampania jest OK?"              → K02  (tak/nie + krótki powód)
"Daj mi raport z kampanii"           → K01  (pełny raport dla klienta)
"Poranny przegląd wszystkich"        → A01  (health check, AdOps)
"Lista aktywnych kampanii"           → W03  (lista z parametrami)
```

**Decydujący czynnik:** długość oczekiwanej odpowiedzi.
- Jedna liczba / emoji → W01
- Jeden sygnał (OK / nie OK) → K02
- Pełny raport → K01 (klient) lub A01 (AdOps dzienny przegląd)

---

### "Gdzie wyświetlała się reklama?" — bezpieczeństwo vs. transparentność

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Na jakich stronach?" (klient)       → K08  (lista serwisów, prosta)
"Brand safety audit" (AdOps)         → A06  (EXCLUDE/WATCH/SAFE + blacklista)
```

**Decydujący czynnik:** cel.
- Klient chce wiedzieć gdzie był → K08
- AdOps sprawdza ryzyko marki → A06 (wywołuje też K08 jako warstwa danych)

---

### "Która reklama działa lepiej?" — klient vs. optymalizacja

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Porównaj kreacje" (klient)          → K11  (ranking z rekomendacją wstrzymania)
"Wydajność kreatywów" (AdOps)        → A05  (score formula, SKALUJ/WSTRZYMAJ z $)
```

**Decydujący czynnik:** audience.
- K11 = gotowe zdanie do wklejenia w maila do klienta
- A05 = priorytetowana lista z formulą score i konkretnymi wartościami do zmiany

---

### "Gdzie są wydatki?" — geografia

```
Pytanie                              → Skill
─────────────────────────────────────────────
"W jakich miastach?" (klient)        → K10  (zasięg geo, czytelna mapa)
"Które geo przynosi wyniki?" (AdOps) → A14  (efficiency_ratio, % budżetu do przesunięcia)
```

**Decydujący czynnik:** czy chodzi o opis rozkładu (K10) czy o optymalizację alokacji (A14).

---

### "Co z metryką X?" — poziom głębokości

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Jaki mamy CTR?"                     → W02  (jedna liczba + benchmark)
"CTR dziwnie wzrósł/spadł"           → A03  (analiza anomalii CTR, mean ± 2σ)
"Co to jest CTR?" (klient nie wie)   → W04  (wyjaśnienie metryki, po polsku)
```

---

### "Czy kampania dowiezie do końca?"

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Czy zdążymy wydać budżet?"          → K13  (prognoza realizacji)
"Kampania nie dowozi"                → A02  (diagnostyka underpacingu)
"Kampania wydaje za szybko"          → A16  (overpacing alert)
"Jaki budżet wydaliśmy?"             → K03  (realizacja budżetu, historycznie)
```

---

### "Podsumuj kampanię"

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Raport końcowy" / "End of campaign" → K12  (pełne podsumowanie, gotowe do wysłania)
"Dane do prezentacji / deck"         → W05  (bullet points executive summary)
"Wyniki za miesiąc" (AdOps)         → A11  (tygodniowy/miesięczny raport AdOps)
"Porównaj ten miesiąc z poprzednim"  → A15  (porównanie okresów, WoW/MoM)
```

---

### "Kto ogląda reklamę?"

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Na jakich urządzeniach?"            → K09  (mobile/desktop/CTV, dla klienta)
"Które segmenty konwertują?"         → A17  (analiza odbiorców, AdOps)
"Gdzie geograficznie?" (klient)      → K10
"Które geo przynosi wyniki?" (AdOps) → A14
```

---

### Optymalizacja

```
Pytanie                              → Skill
─────────────────────────────────────────────
"Co poprawić w kampanii?"            → A18  (optymalizacja budżetu — rekomendacje zbiorcze)
"Viewability niska"                  → A04  (audit viewability)
"CTR anomalia"                       → A03
"Underpacing"                        → A02
"Overpacing"                         → A16
"Złe domeny"                         → A06  (brand safety)
"Budget między line itemami"         → A18
"Kreacje do wymiany"                 → A05  (AdOps) lub K11 (klient)
```

---

## Szybka tabela — nakładające się skille

| Skill A | Skill B | Kiedy A | Kiedy B |
|---------|---------|---------|---------|
| W01 | K02 | Chcą **jedną liczbę** | Chcą odpowiedź tak/nie |
| W01 | K01 | 1–2 zdania wystarczą | Potrzebny pełny raport |
| K11 | A05 | Pytanie od klienta | Pytanie od AdOps do optymalizacji |
| K08 | A06 | "Gdzie była reklama?" (transparency) | "Brand safety check" (risk) |
| K10 | A14 | "Jakie miasta?" (opis) | "Które geo optymalizować?" (alokacja) |
| W02 | A03 | Pytanie o wartość metryki | Wykryto anomalię / spike |
| K12 | W05 | Raport końcowy do klienta/zarządu | Dane do slajdów / prezentacji |
| A01 | W03 | Poranny health check AdOps | Lista aktywnych kampanii (ktokolwiek) |
| K03 | K13 | Ile wydaliśmy (historycznie) | Ile wydamy do końca (prognoza) |

---

## Reguły kaskadowe

1. Jeśli skill produkuje alert (🔴) → zaproponuj odpowiedni skill diagnostyczny:
   - Underpacing → A02
   - Overpacing → A16
   - CTR anomalia → A03
   - Viewability <50% → A04
   - Brand safety issue → A06

2. Jeśli klient pyta a pytanie wymaga AdOps-owego skilla → wywołaj AdOps skill, ale **formatuj output jako wariant kliencki** (bez żargonu technicznego).

3. Zawsze zakończ odpowiedź propozycją kolejnego kroku — które skill użyć jeśli chcą więcej.
