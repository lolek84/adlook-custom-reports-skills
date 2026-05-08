# Adlook DSP — Katalog Skilii Agentycznych

> Wersja 1.0 · maj 2026  
> Oparty na aktualnym schemacie Adlook MCP (`run_report_preview`, `list_advertisers`, `list_dimensions`)

---

## Spis treści

- [Sekcja 1 — Skille dla klientów](#sekcja-1--skille-dla-klientów) (K01–K12)
- [Sekcja 2 — Skille wewnętrzne AdOps](#sekcja-2--skille-wewnętrzne-adops) (A01–A16)
- [Sekcja 3 — Skille wspólne](#sekcja-3--skille-wspólne) (W01–W05)
- [Mapowanie języka naturalnego → Skill](#mapowanie-języka-naturalnego--skill)

---

## Legenda

| Symbol | Znaczenie |
|--------|-----------|
| 🟢 Klient | Dostępne dla klienta / agencji — prosty język, gotowe wnioski |
| 🟣 AdOps | Wewnętrzny zespół Adlook — diagnostyka, optymalizacja |
| 🟠 Wspólny | Obie grupy, różny poziom szczegółowości odpowiedzi |
| ⚡ Podstawowy | Jedno wywołanie MCP, szybka odpowiedź |
| ⚙️ Średni | 2–3 wywołania MCP, analiza wielowymiarowa |
| 🔬 Zaawansowany | Wiele wywołań, porównania, root cause analysis |

---

## Sekcja 1 — Skille dla klientów

> Zaprojektowane pod użytkownika bez wiedzy technicznej o DSP. Prosty język, gotowe wnioski, zero surowych danych.

---

### K01 — Raport z kampanii

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Podsumowanie wyników kampanii za wybrany okres w czytelnej formie dla klienta lub agencji. |
| **Triggery** | `jak idzie kampania X` · `pokaż wyniki za ostatni miesiąc` · `raport z kampanii` · `co osiągnęliśmy` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CAMPAIGN_STATUS`, `CAMPAIGN_BUDGET`, `LINE_ITEM_NAME` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY`, `REACH` |
| **Output** | Tabela z kluczowymi wynikami + ocena tekstowa: czy kampania jest na dobrej ścieżce, co działa, co nie. |

---

### K02 — Status kampanii — czy wszystko OK?

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Szybka odpowiedź tak/nie: czy kampania realizuje się zgodnie z planem. Pacing + kluczowe metryki. |
| **Triggery** | `czy kampania idzie dobrze` · `sprawdź status kampanii` · `wszystko OK z kampanią X` · `jak nam idzie` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE`, `LINE_ITEM_STATUS` + metryki: `TOTAL_SPEND_USD`, `IMPRESSIONS` |
| **Output** | Prosty status 🟢/🟡/🔴 z jednozdaniowym uzasadnieniem i pacing%. Bez technikaliów. |

---

### K03 — Realizacja budżetu

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Ile z budżetu kampanii zostało wydane, ile zostało, czy jesteśmy on-track. |
| **Triggery** | `ile budżetu zostało` · `czy budżet wystarczy do końca` · `ile wydaliśmy` · `pacing budżetu` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE` + metryki: `TOTAL_SPEND_USD` |
| **Output** | Wydano X$ z Y$ (Z%). Pozostało N dni. Prognoza: kampania wyda budżet [za wcześnie / w terminie / zostanie nadwyżka]. |

---

### K04 — Zasięg i częstotliwość

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Ile unikalnych użytkowników dotknęła kampania i jak często widzieli reklamę. |
| **Triggery** | `ile osób zobaczyło reklamę` · `jaki mamy zasięg` · `ile razy ktoś widział naszą reklamę` · `frequency` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `DATE` + metryki: `REACH`, `FREQUENCY`, `IMPRESSIONS` |
| **Output** | Zasięg: X unikatowych użytkowników. Średnia częstotliwość: Y wyświetleń na osobę. Trend tygodniowy. |

---

### K05 — Wyniki video

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Kompletność obejrzenia reklamy wideo — ile osób obejrzało do końca. |
| **Triggery** | `ile osób obejrzało film do końca` · `wyniki wideo` · `completion rate` · `jak radzi sobie reklama video` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE` + metryki: `VIDEO_COMPLETE_VIEWS`, `VIDEO_COMPLETION_RATE`, `VIDEO_STARTS`, `VIDEO_PLAYS_25`, `VIDEO_PLAYS_50`, `VIDEO_PLAYS_75`, `VIDEO_PLAYS_100` |
| **Output** | Lejek: X% zaczęło → Y% do połowy → Z% do końca. Ocena: dobry/średni/słaby na tle benchmarku 50%. |

---

### K06 — Wyniki display (klikalność)

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Ile osób kliknęło w baner i jaka jest jakość tego ruchu. |
| **Triggery** | `ile kliknięć` · `CTR` · `klikalność` · `ktoś klikał w reklamę` · `ile osób weszło na stronę` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_SIZE` + metryki: `CLICKS`, `CTR`, `LANDING_PAGE_VIEWS`, `LANDING_RATE` |
| **Output** | Kliknięć: X (CTR: Y%). Wejść na stronę: Z. Ocena CTR na tle benchmarku formatu. |

---

### K07 — Konwersje i zwrot z inwestycji

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚙️ Średni |
| **Opis** | Ile konwersji wygenerowała kampania i jaki jest koszt pozyskania. |
| **Triggery** | `ile konwersji` · `jaki ROAS` · `koszt konwersji` · `CPA` · `czy kampania jest opłacalna` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `LINE_ITEM_NAME`, `LINE_ITEM_PRIMARY_GOAL_NAME` + metryki: `TOTAL_CONVERSIONS`, `POST_VIEW_CONVERSIONS`, `POST_CLICK_CONVERSIONS`, `ECPA_USD`, `ROAS`, `CONVERSION_RATE` |
| **Output** | Konwersje: X (view-through: Y, click-through: Z). Koszt/konwersję: $A. ROAS: B. Ocena vs. cel. |

---

### K08 — Gdzie wyświetlała się reklama?

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Lista serwisów i aplikacji, na których pojawiła się reklama klienta — transparentność inventory. |
| **Triggery** | `gdzie była reklama` · `na jakich stronach` · `pokaż placement` · `gdzie się wyświetlaliśmy` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `TOP_LEVEL_DOMAIN`, `APP_NAME`, `SUPPLY_SOURCE`, `ENVIRONMENT` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD` |
| **Output** | Top 10 serwisów z % udziałem impresji i wydatków. Podział web/app. Czytelna lista, nie kody techniczne. |

---

### K09 — Na jakich urządzeniach?

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Rozkład impresji między desktop, mobile, tablet i CTV. |
| **Triggery** | `na jakich urządzeniach` · `ile na mobile` · `CTV` · `desktop vs mobile` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `DEVICE_TYPE`, `OPERATING_SYSTEM`, `ENVIRONMENT` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `CTR`, `VIEWABILITY` |
| **Output** | Desktop X%, Mobile Y%, Tablet Z%, CTV W%. CTR i viewability per urządzenie. |

---

### K10 — Zasięg geograficzny

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | W jakich miastach i regionach wyświetlała się kampania. |
| **Triggery** | `gdzie geograficznie` · `jakie miasta` · `Warszawa vs reszta` · `rozkład regionalny` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `COUNTRY`, `REGION`, `CITY` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD`, `REACH` |
| **Output** | Top 10 miast z % udziałem. Ocena vs. planowane geo targetowanie. |

---

### K11 — Porównanie kreatywów

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | ⚙️ Średni |
| **Opis** | Która wersja reklamy działa lepiej — A/B test lub rotacja kreacji. |
| **Triggery** | `która kreacja działa lepiej` · `porównaj banery` · `A/B test kreacji` · `najlepszy format` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN_NAME`, `CREATIVE_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE` + metryki: `IMPRESSIONS`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE`, `TOTAL_SPEND_USD` |
| **Output** | Ranking kreacji z kluczową metryką. Rekomendacja: wstrzymaj X, skaluj Y. Uzasadnienie w jednym zdaniu. |

---

### K12 — Podsumowanie end-of-campaign

| | |
|---|---|
| **Audience** | 🟢 Klient |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Kompleksowy raport podsumowujący wyniki kampanii — gotowy do wysłania do klienta. |
| **Triggery** | `podsumuj kampanię` · `raport końcowy` · `monthly summary` · `co osiągnęliśmy w tym miesiącu` |
| **MCP tools** | `run_report_preview` × 4 raporty (main, video, inventory, creative) za cały okres kampanii |
| **Output** | Strukturyzowany raport: executive summary → kluczowe wyniki → inventory top 10 → kreacje → wnioski → rekomendacje na następny okres. |

---

## Sekcja 2 — Skille wewnętrzne AdOps

> Skille dla analityków i traderów. Zakładają znajomość DSP, skupiają się na diagnostyce i akcjach optymalizacyjnych.

---

### A01 — Daily health check

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Poranny przegląd wszystkich aktywnych kampanii — pacing, anomalie, alerty. Punkt startowy dnia. |
| **Triggery** | `daily check` · `poranny przegląd` · `co się dzieje z kampaniami` · `alerty na dziś` |
| **MCP tools** | `list_advertisers` → `run_report_preview` (wszystkie kampanie, yesterday + last_7_days) + pełny zestaw metryk |
| **Output** | Lista kampanii ze statusem pacing 🟢/🟡/🔴. Automatyczne alerty: underpacing >15%, zero-delivery, CTR spike, viewability drop. |

---

### A02 — Diagnostyka underpacingu

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Głęboka analiza kampanii która niedowozi — identyfikacja przyczyny i gotowe kroki naprawcze. |
| **Triggery** | `kampania nie dowozi` · `underpacing` · `brak impresji na LI X` · `delivery problem` · `zero spend` |
| **MCP tools** | `run_report_preview` × wiele dims: `CAMPAIGN`, `LINE_ITEM`, `SUPPLY_SOURCE`, `DOMAIN`, `DEVICE_TYPE`, `CREATIVE` + metryki: `IMPRESSIONS`, `ECPM_USD`, `CTR`, `VIEWABILITY` per dim |
| **Output** | Root cause analysis: bid / targeting / kreacja / supply. Priorytetowana lista działań z konkretnymi wartościami do zmiany. |

---

### A03 — Analiza anomalii CTR

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Wykrycie i diagnoza nagłego skoku lub spadku CTR — odróżnienie rzeczywistej zmiany od szumu. |
| **Triggery** | `CTR spike` · `CTR za wysoki` · `CTR spada` · `dziwny CTR na kampanii X` · `fraud CTR` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `LINE_ITEM`, `CREATIVE`, `DOMAIN`, `DEVICE_TYPE`, `DATE` + metryki: `CTR`, `CLICKS`, `IMPRESSIONS`, `LANDING_RATE` za 30 dni |
| **Output** | Trend CTR z oznaczeniem dnia anomalii. Podejrzane domeny/kreacje. Ocena: fraud vs. rzeczywista zmiana. Rekomendacja. |

---

### A04 — Audit viewability

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Pełna analiza viewability po inventory — identyfikacja złego supply i rekomendacje wykluczeń. |
| **Triggery** | `sprawdź viewability` · `niski viewability` · `które domeny mają słaby viewability` · `audit inventory viewability` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `DOMAIN`, `TOP_LEVEL_DOMAIN`, `SUPPLY_SOURCE`, `APP_NAME`, `ENVIRONMENT`, `DEVICE_TYPE` + metryki: `VIEWABILITY`, `MEASURABILITY`, `IMPRESSIONS`, `ECPM_USD` |
| **Output** | Ranking domen: top 20 wg impresji z viewability. Lista do wykluczenia (<40%). Lista premium (>70%). Potencjalna oszczędność w $ po wykluczeniu złego inventory. |

---

### A05 — Analiza wydajności kreacji

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Ranking kreacji wg skuteczności + identyfikacja kreacji do wstrzymania i do skalowania. |
| **Triggery** | `które kreacje działają` · `porównaj kreacje` · `najlepszy banner` · `wstrzymaj słabe kreacje` |
| **MCP tools** | `run_report_preview` z dims: `CREATIVE_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE`, `CREATIVE_DURATION`, `LINE_ITEM_NAME` + metryki: `IMPRESSIONS`, `CTR`, `VIEWABILITY`, `VIDEO_COMPLETION_RATE`, `ECPM_USD`, `TOTAL_SPEND_USD` |
| **Output** | Tabela kreacji z ocenami. Kolumna ACTION: SKALUJ / MONITORUJ / WSTRZYMAJ. Próg: CTR < 50% mediany lub VCR < 50%. |

---

### A06 — Brand safety audit

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Przegląd inventory pod kątem brand safety — wykrycie domen niezgodnych z wymogami klienta. |
| **Triggery** | `brand safety check` · `sprawdź czy reklama nie pojawiła się na złych stronach` · `audit placementów` · `bezpieczeństwo marki` |
| **MCP tools** | `run_report_preview` z dims: `DOMAIN`, `TOP_LEVEL_DOMAIN`, `APP_NAME`, `APP_ID`, `SUPPLY_SOURCE` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD` — filtrowanie po wzorcach nazw |
| **Output** | Lista domen z flagami ryzyka: SAFE / WATCH / EXCLUDE. Rekomendowana blacklista. % budżetu na ryzykownym inventory. |

---

### A07 — Analiza kosztów (eCPM / eCPC / eCPA)

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Efektywność kosztowa kampanii — czy płacimy właściwą cenę za wynik. |
| **Triggery** | `sprawdź koszty` · `eCPM rośnie` · `drogo płacimy za kliknięcia` · `optymalizuj koszty` · `CPA ponad KPI` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `LINE_ITEM`, `LINE_ITEM_BIDDING_MODEL`, `SUPPLY_SOURCE`, `CREATIVE_TYPE`, `DATE` + metryki: `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `ECPCV_USD`, `TOTAL_SPEND_USD` |
| **Output** | Trendy kosztowe z oznaczeniem skoków. Porównanie do celu z `LINE_ITEM_PRIMARY_GOAL_VALUE`. Najdroższa/najtańsza kombinacja supply+kreacja. |

---

### A08 — Raport supply sources

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Porównanie SSP i giełd — gdzie kupujemy inventory, co daje najlepszy wynik. |
| **Triggery** | `który SSP działa najlepiej` · `porównaj supply sources` · `gdzie mamy najlepszy inventory` · `analiza SSP` |
| **MCP tools** | `run_report_preview` z dims: `SUPPLY_SOURCE`, `ENVIRONMENT`, `DEVICE_TYPE`, `CREATIVE_TYPE` + metryki: `IMPRESSIONS`, `VIEWABILITY`, `CTR`, `ECPM_USD`, `TOTAL_SPEND_USD` |
| **Output** | Ranking SSP wg kluczowych metryk. Score: viewability × CTR / eCPM. Rekomendacja alokacji budżetu. |

---

### A09 — Analiza video funnel

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Gdzie użytkownicy porzucają film — optymalizacja długości kreacji i placementów video. |
| **Triggery** | `video nie działa` · `niski completion rate` · `gdzie porzucają film` · `video funnel` · `skip rate` |
| **MCP tools** | `run_report_preview` z dims: `CREATIVE_NAME`, `CREATIVE_DURATION`, `SUPPLY_SOURCE`, `DEVICE_TYPE` + metryki: `VIDEO_STARTS`, `VIDEO_PLAYS_25/50/75/100`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_COMPLETION_RATE`, `VIDEO_SKIPS`, `VIDEO_ERRORS` |
| **Output** | Lejek drop-off per kreacja i supply. Identyfikacja: za długa kreacja / zły placement / błąd techniczny. Rekomendacja przycięcia do optymalnej długości. |

---

### A10 — Cross-campaign benchmark

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Porównanie wyników kilku kampanii tego samego advertisera — co działa najlepiej strukturalnie. |
| **Triggery** | `porównaj kampanie` · `która kampania daje najlepszy wynik` · `benchmark między kampaniami` · `co inaczej w kampanii A vs B` |
| **MCP tools** | `run_report_preview` z dims: `ADVERTISER_NAME`, `CAMPAIGN_NAME`, `CAMPAIGN_OBJECTIVE` × wiele kampanii + pełne metryki |
| **Output** | Tabela porównawcza z normalizacją (wyniki per 1000 impresji). Najlepsze praktyki: inventory, format, model bidowania. |

---

### A11 — Raport tygodniowy AdOps

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Kompletny raport tygodniowy dla team leada — wszystkie kampanie, kluczowe incydenty, działania podjęte. |
| **Triggery** | `raport tygodniowy` · `weekly report` · `podsumowanie tygodnia` · `co się działo w tym tygodniu` |
| **MCP tools** | `run_report_preview` (ALL, last_7_days) × raporty: pacing, anomalie, kreacje, inventory + porównanie z poprzednim tygodniem |
| **Output** | Kampanie OK / na obserwacji / wymagające działania. Lista incydentów z rozwiązaniami. Top 3 wnioski na następny tydzień. |

---

### A12 — Analiza frequency i zasięgu

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Czy nie bombardujemy tych samych użytkowników — optymalizacja frequency cappingu. |
| **Triggery** | `sprawdź frequency` · `czy nie za dużo odsłon na osobę` · `reach vs frequency` · `frequency capping` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `LINE_ITEM`, `DEVICE_TYPE`, `DATE` + metryki: `REACH`, `FREQUENCY`, `IMPRESSIONS` — trend dzienny |
| **Output** | Trend frequency w czasie. Jeśli rośnie przy stałych impresjach: zawężony zasięg. Rekomendacja: zwiększ zasięg targetowania lub wdroź/zmień frequency cap. |

---

### A13 — Audit line itemów — anomalie statusów

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Wykrycie line itemów aktywnych bez delivery, pauzowanych przez omyłkę, lub z niespójnymi datami. |
| **Triggery** | `sprawdź LI` · `które line itemy nie działają` · `audit line itemów` · `status LI` · `zero delivery` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `LINE_ITEM_NAME`, `LINE_ITEM_STATUS`, `LINE_ITEM_START_DATE`, `LINE_ITEM_END_DATE`, `LINE_ITEM_BUDGET` + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD` |
| **Output** | Lista LI: ACTIVE+zero_impresji (krytyczne), PAUSED+duże niewydane (podejrzane), zakończone+niedowiezione (do raportowania). |

---

### A14 — Analiza geo performance

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Które regiony i miasta dają najlepszy wynik — optymalizacja targetowania geograficznego. |
| **Triggery** | `które miasto najlepiej konwertuje` · `geo performance` · `optymalizacja regionów` · `gdzie warto inwestować` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `COUNTRY`, `REGION`, `CITY` + metryki: `IMPRESSIONS`, `CTR`, `VIEWABILITY`, `TOTAL_SPEND_USD`, `ECPA_USD`, `TOTAL_CONVERSIONS` |
| **Output** | Top 10 miast wg efektywności (CTR × viewability / eCPM). Rekomendacja: zwiększ budżet w X, ogranicz w Y. |

---

### A15 — Porównanie periody (MoM / WoW)

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Jak zmieniły się wyniki między tygodniami lub miesiącami — wykrycie trendów i regresji. |
| **Triggery** | `porównaj z poprzednim tygodniem` · `MoM` · `WoW` · `trend wyników` · `czy jest poprawa` · `co się zmieniło` |
| **MCP tools** | `run_report_preview` × 2 okresy (current vs previous) + pełne metryki + delta obliczona przez agenta |
| **Output** | Tabela delta: metryka \| poprzedni okres \| bieżący \| zmiana % \| ocena. Highlight: największe pozytywne i negatywne zmiany. |

---

### A16 — Overpacing alert i kontrola wydatków

| | |
|---|---|
| **Audience** | 🟣 AdOps |
| **Poziom** | ⚙️ Średni |
| **Opis** | Wykrycie kampanii które wydają za szybko — działania zanim skończy się budżet za wcześnie. |
| **Triggery** | `kampania wydaje za szybko` · `overpacing` · `budżet się skończy za wcześnie` · `kontrola wydatków` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, `LINE_ITEM`, `DATE` + metryki: `TOTAL_SPEND_USD`, `CAMPAIGN_BUDGET`, `CAMPAIGN_END_DATE` — obliczenie projected spend |
| **Output** | Lista kampanii overpacing z prognozą: budżet skończy się za N dni przy obecnym tempie. Rekomendacja: daily cap = remaining_budget / remaining_days. |

---

## Sekcja 3 — Skille wspólne

> Użyteczne dla obu grup — agent dostosowuje poziom szczegółowości do rozmówcy.

---

### W01 — Szybki status — jedna liczba

| | |
|---|---|
| **Audience** | 🟠 Klient + AdOps |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Odpowiedź na "jak idzie?" w jednym zdaniu z kluczową liczbą. Zero szczegółów, maksymalny sygnał. |
| **Triggery** | `jak idzie kampania` · `wszystko OK` · `quick check` · `daj mi jedną liczbę` |
| **MCP tools** | `run_report_preview` z dims: `CAMPAIGN`, yesterday + metryki: `IMPRESSIONS`, `TOTAL_SPEND_USD` — minimum wywołań API |
| **Output** | Klient: "✅ Kampania dobrze — 2,1M impresji, 68% budżetu wydane, 4 dni do końca." AdOps: + pacing delta i anomalie. |

---

### W02 — Pytanie o konkretną metrykę

| | |
|---|---|
| **Audience** | 🟠 Klient + AdOps |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Odpowiedź na pytanie o jedną metrykę — bez niepotrzebnego kontekstu. |
| **Triggery** | `jaki mamy CTR` · `ile impresji` · `jaki viewability` · `ile wydaliśmy` · `jaki reach` |
| **MCP tools** | `run_report_preview` z minimalnym zestawem dims + 1–3 metryki powiązane z pytaniem |
| **Output** | Bezpośrednia odpowiedź: "CTR: 0,12%. To powyżej benchmarku dla display (0,08%). [Krótki kontekst]." |

---

### W03 — Lista aktywnych kampanii

| | |
|---|---|
| **Audience** | 🟠 Klient + AdOps |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Które kampanie danego advertisera są teraz aktywne, z podstawowymi parametrami. |
| **Triggery** | `które kampanie są aktywne` · `co teraz robimy` · `lista kampanii` · `pokaż moje kampanie` |
| **MCP tools** | `list_advertisers` → `run_report_preview` z dims: `CAMPAIGN_NAME`, `CAMPAIGN_STATUS`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE` + metryki: `TOTAL_SPEND_USD` |
| **Output** | Klient: nazwa, budżet, % wydany, dni do końca. AdOps: + pacing delta, ostatnia data z impresjami. |

---

### W04 — Wyjaśnienie metryki

| | |
|---|---|
| **Audience** | 🟠 Klient + AdOps |
| **Poziom** | ⚡ Podstawowy |
| **Opis** | Co znaczy dana metryka i jak ją interpretować w kontekście kampanii Adlook. |
| **Triggery** | `co to jest CTR` · `co znaczy viewability` · `wyjaśnij mi eCPM` · `co to VCR` |
| **MCP tools** | Brak wywołań MCP — wiedza domenowa agenta |
| **Output** | Definicja + przykład z kontekstem DSP + czy wysoka/niska wartość jest dobra. AdOps: + jak wpływa na optymalizację. |

---

### W05 — Podsumowanie dla prezentacji

| | |
|---|---|
| **Audience** | 🟠 Klient + AdOps |
| **Poziom** | 🔬 Zaawansowany |
| **Opis** | Dane gotowe do wklejenia w deck/raport — sformatowane, z kluczowymi wnioskami. |
| **Triggery** | `przygotuj dane do prezentacji` · `podsumowanie do decku` · `key takeaways` · `bullet points z wynikami` |
| **MCP tools** | `run_report_preview` (pełny zestaw) + agregacja przez agenta |
| **Output** | 5–7 bullet points. Format: metryka + wartość + kontekst + wniosek. Styl executive summary, bez technikaliów. AdOps: + rekomendacje operacyjne. |

---

## Mapowanie języka naturalnego → Skill

| Co mówi użytkownik | Skill | Dla |
|---|---|---|
| jak idzie kampania / sprawdź kampanię | K01 Raport z kampanii | Klient |
| czy wszystko OK / status kampanii | K02 Status kampanii | Klient |
| ile budżetu zostało / pacing budżetu | K03 Realizacja budżetu | Klient |
| zasięg / ile osób widziało / reach | K04 Zasięg i częstotliwość | Klient |
| wyniki video / completion rate | K05 Wyniki video | Klient |
| CTR / kliki / klikalność banera | K06 Wyniki display | Klient |
| konwersje / ROAS / CPA / zwrot | K07 Konwersje i ROI | Klient |
| gdzie była reklama / placement / domeny | K08 Gdzie reklama? | Klient |
| mobile / desktop / CTV / urządzenia | K09 Na jakich urządzeniach? | Klient |
| geografia / miasta / regiony | K10 Zasięg geograficzny | Klient |
| która kreacja / porównaj banery / A/B | K11 Porównanie kreatywów | Klient |
| raport końcowy / podsumuj kampanię | K12 Podsumowanie end-of-campaign | Klient |
| daily check / poranny przegląd | A01 Daily health check | AdOps |
| nie dowozi / underpacing / brak impresji | A02 Diagnostyka underpacingu | AdOps |
| CTR spike / CTR anomalia / dziwny CTR | A03 Analiza anomalii CTR | AdOps |
| viewability spada / słaby viewability | A04 Audit viewability | AdOps |
| która kreacja działa / wstrzymaj słabe | A05 Wydajność kreacji | AdOps |
| brand safety / złe strony / audit | A06 Brand safety audit | AdOps |
| eCPM rośnie / drogo / koszt za wysoki | A07 Analiza kosztów | AdOps |
| który SSP / supply sources | A08 Raport supply sources | AdOps |
| video funnel / completion / porzucenia | A09 Analiza video funnel | AdOps |
| porównaj kampanie / benchmark | A10 Cross-campaign benchmark | AdOps |
| raport tygodniowy / weekly | A11 Raport tygodniowy | AdOps |
| frequency cap / za dużo odsłon | A12 Analiza frequency | AdOps |
| audit LI / zero delivery / status LI | A13 Audit line itemów | AdOps |
| geo performance / które miasto | A14 Analiza geo | AdOps |
| MoM / WoW / porównaj z poprzednim | A15 Porównanie periody | AdOps |
| wydaje za szybko / overpacing | A16 Overpacing alert | AdOps |
| quick check / jedna liczba / jak idzie | W01 Szybki status | Oba |
| jaki CTR / ile impresji / jaki reach | W02 Pytanie o metrykę | Oba |
| lista kampanii / co teraz robimy | W03 Lista kampanii | Oba |
| co to jest / wyjaśnij / co znaczy | W04 Wyjaśnienie metryki | Oba |
| dane do prezentacji / do decku / bullets | W05 Podsumowanie | Oba |

---

## Dostępne wymiary MCP (dims) — skrócona mapa

| Grupa | Kluczowe wymiary |
|---|---|
| **TIME** | `DATE`, `WEEK`, `MONTH`, `YEAR` |
| **ADVERTISER** | `ADVERTISER_NAME`, `CLIENT_NAME`, `BRAND`, `VERTICAL`, `BUSINESS_GROUP` |
| **CAMPAIGN** | `CAMPAIGN_NAME`, `CAMPAIGN_STATUS`, `CAMPAIGN_BUDGET`, `CAMPAIGN_START_DATE`, `CAMPAIGN_END_DATE`, `CAMPAIGN_OBJECTIVE` |
| **LINE_ITEM** | `LINE_ITEM_NAME`, `LINE_ITEM_STATUS`, `LINE_ITEM_BUDGET`, `LINE_ITEM_BIDDING_MODEL`, `LINE_ITEM_START_DATE`, `LINE_ITEM_END_DATE`, `LINE_ITEM_PRIMARY_GOAL_NAME`, `LINE_ITEM_PRIMARY_GOAL_VALUE` |
| **CREATIVE** | `CREATIVE_NAME`, `CREATIVE_TYPE`, `CREATIVE_SIZE`, `CREATIVE_DURATION` |
| **INVENTORY** | `DOMAIN`, `TOP_LEVEL_DOMAIN`, `APP_NAME`, `APP_ID`, `SUPPLY_SOURCE` |
| **DEVICE** | `DEVICE_TYPE`, `BROWSER`, `OPERATING_SYSTEM`, `ENVIRONMENT` |
| **GEO** | `CITY`, `REGION`, `COUNTRY`, `POSTAL_CODE` |

## Kluczowe metryki MCP — skrócona mapa

| Kategoria | Metryki |
|---|---|
| **Delivery** | `IMPRESSIONS`, `CLICKS`, `REACH`, `FREQUENCY` |
| **Jakość** | `VIEWABILITY`, `VIEWABLE_IMPRESSIONS`, `MEASURABILITY` |
| **Klikalność** | `CLICK_THROUGH_RATE`, `LANDING_PAGE_VIEWS`, `LANDING_RATE` |
| **Video** | `VIDEO_STARTS`, `VIDEO_PLAYS_25/50/75/100`, `VIDEO_COMPLETE_VIEWS`, `VIDEO_COMPLETION_RATE`, `VIDEO_SKIPS`, `VIDEO_ERRORS` |
| **Konwersje** | `TOTAL_CONVERSIONS`, `POST_VIEW_CONVERSIONS`, `POST_CLICK_CONVERSIONS`, `CONVERSION_RATE`, `ROAS` |
| **Koszty** | `TOTAL_SPEND_USD`, `ECPM_USD`, `ECPC_USD`, `ECPA_USD`, `ECPCV_USD`, `VCPM_USD` |

---

*Adlook DSP · Katalog Skilii v1.0 · maj 2026*
