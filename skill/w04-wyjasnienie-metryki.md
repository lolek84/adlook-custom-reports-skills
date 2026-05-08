---
name: w04-wyjasnienie-metryki
description: Użyj tego skilla gdy użytkownik pyta co znaczy dana metryka, chce wyjaśnienia pojęcia DSP lub reklamowego. Triggery: "co to jest CTR", "co znaczy viewability", "wyjaśnij mi eCPM", "co to VCR", "co to jest", "wyjaśnij", "co znaczy", "nie rozumiem", "co to ROAS", "co to pacing", "co to frequency".
version: 1.0.0
quality_score: 9
---

# W04 — Wyjaśnienie metryki

Co znaczy dana metryka i jak ją interpretować w kontekście kampanii Adlook.

## Cel

Jasne, proste wyjaśnienie metryki dostosowane do rozmówcy — bez żargonu dla klienta, z głębią techniczną dla AdOps.

## Kroki wykonania

### 1. Brak wywołań MCP

Ten skill nie wymaga danych — opiera się na wiedzy domenowej agenta.
Jeśli użytkownik podał konkretną wartość z kampanii — odnieś się do niej bezpośrednio w odpowiedzi.

### 2. Słownik kluczowych metryk

**CTR (Click-Through Rate / klikalność)**
- Klient: Procent osób które kliknęły w reklamę po jej zobaczeniu. CTR 0,14% = na 1000 wyświetleń kliknęło 1,4 osoby. Norma branżowa dla bannerów to ok. 0,08% — powyżej tej wartości kampania dobrze angażuje.
- AdOps: benchmark display 0,05–0,12%; video 0,3–0,8%. CTR >2% bez korelacji z landing rate → sygnał fraud. Monitoruj per domain. Anomalia CTR → A03.

**Viewability (widoczność reklam)**
- Klient: Procent reklam które były naprawdę widoczne na ekranie (nie scrollowano obok zanim się załadowały). Viewability 68% = 68 na 100 wyświetleń było realnie widocznych. Dobry wynik to >50%, świetny >70%.
- AdOps: standard MRC = min. 50% pikseli przez ≥1 sekundę (display) lub ≥2 sekundy (video). Measurability <70% obniża wiarygodność danych — sprawdź SSP. Niski viewability → A04 (audit viewability).

**VCR (Video Completion Rate / obejrzenia do końca)**
- Klient: Procent osób które obejrzały reklamę wideo do końca. VCR 55% = ponad połowa odbiorców obejrzała spot w całości — to dobry wynik. Poniżej 30% to sygnał że spot jest za długi lub mało angażujący.
- AdOps: benchmark: 30s spot >40% OK, >60% świetny. Niski VCR przy Q1_drop >50% → skróć wstęp; przy Q3_drop → skróć outro.

**eCPM (efektywny koszt tysiąca wyświetleń)**
- Klient: Ile kosztuje dotarcie do 1000 osób z reklamą. eCPM $2,40 = za każde 1000 wyświetleń zapłacono $2,40. Dla reklam banerowych typowy koszt to $1–3 za tysiąc.
- AdOps: benchmarki: display $1–3, video $5–15, CTV $15–30. Wysoki eCPM akceptowalny jeśli viewability >70% i CTR >0,12% — sprawdź efficiency = CTR×viewability/eCPM.

**Reach (zasięg)**
- Klient: Ile różnych (unikalnych) osób zobaczyło reklamę — każda liczona raz, niezależnie ile razy widziała reklamę. Reach 1 800 000 = reklama dotarła do 1,8 miliona różnych ludzi w Polsce.
- AdOps: reach = deduplikowane ciasteczka/ID. Przy frequency >7 nowe osoby są trudniejsze do pozyskania — sprawdź czy budżet nie trafia do tych samych użytkowników.

**Frequency (częstotliwość)**
- Klient: Ile razy średnio każda osoba zobaczyła reklamę. Frequency 3,2 = każdy odbiorca widział reklamę średnio 3 razy. Optymalne to 3–5 razy — więcej może być irytujące.
- AdOps: frequency >7 w tygodniu → audience saturation, spadek CTR nieuchronny. Ustaw frequency cap lub rozszerz targetowanie.

**Pacing (tempo wydatków)**
- Klient: Czy kampania wydaje budżet we właściwym tempie — nie za szybko i nie za wolno. Kampania 10-dniowa która po 5 dniach wydała 50% budżetu idzie idealnie.
- AdOps: delta_pacing = (spend%) − (time%). Norma ±10%. Delta < −15% → underpacing (A02). Delta > +15% → overpacing (A16). Sprawdź daily cap i bid.

**ROAS (Return on Ad Spend / zwrot z wydatków)**
- Klient: Za każdy wydany złoty ile złotych przychodu wygenerowała kampania. ROAS 320% = za $1 wydany kampania przyniosła $3,20 przychodu. Powyżej 200% kampania zazwyczaj jest opłacalna.
- AdOps: wymaga piksela konwersji. Rozróżnij view-through ROAS (użytkownik widział reklamę) i click-through ROAS (kliknął) — oba są mierzone przez Adlook osobno.

**CPA (Cost Per Action / koszt konwersji)**
- Klient: Ile kosztuje pozyskanie jednej konwersji — zakupu, rejestracji lub wypełnienia formularza. CPA $53 = każdy zakup kosztował $53 w wydatkach reklamowych.
- AdOps: cel CPA ustawiany przez klienta. Gdy CPA > celu → sprawdź jakość audience i landing page. Wymaga piksela śledzącego.

### 3. Format odpowiedzi

**Dla klienta — 3–4 zdania, bez skrótów angielskich:**

```
Klikalność (CTR) to procent osób, które kliknęły w reklamę po jej wyświetleniu.

Na przykład: CTR 0,14% oznacza że na każde 1000 wyświetleń kliknęło ok. 1–2 osoby.

Dobry wynik dla reklam banerowych to ok. 0,08% — Twoja kampania osiąga 0,14%, czyli
prawie dwukrotnie powyżej normy. To oznacza że kreacje dobrze przyciągają uwagę.
```

**Dla AdOps — definicja + benchmark + jak optymalizować:**

```
CTR: (kliknięcia / wyświetlenia) × 100
Benchmark: display 0,05–0,12% | video 0,3–0,8%
Optymalizacja: CTR <0,05% → zmień kreację lub targetowanie
               CTR >2% bez landing_rate → sprawdź fraud (A03)
               Porównaj per-domain — wyklucz outlier'y (A04)
```

**Edge case — metryka niedostępna:**

```
Dane o [metryce] są niedostępne dla tej kampanii.
[Viewability] wymaga załadowania skryptu pomiaru — sprawdź czy tag jest wdrożony.
[ROAS/CPA] wymaga piksela śledzącego konwersje — skontaktuj się z zespołem implementacji.
```

## Zasady

- Nigdy nie używaj angielskiego żargonu bez polskiego tłumaczenia w odpowiedzi dla klienta
- Jeśli użytkownik podał konkretną wartość — oceń ją natychmiast (dobry/przeciętny/słaby) bez pytania
- Klient: max 3–4 zdania, analogia lub liczba, ocena vs. benchmark
- AdOps: dodaj próg optymalizacji i odesłanie do właściwego skilla (A02–A16)
- Zakończ odpowiedź wnioskiem: co ta wartość oznacza dla tej konkretnej kampanii
