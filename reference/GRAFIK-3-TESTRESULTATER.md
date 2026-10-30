# Testresultater — træer, skyer, sol og flagline

Dato: 27. oktober 2026. Spillets fysikversion 4 er bevaret.

## Ændringen

- Tre træer, tre skyer, en sol og fire farvede flag i den godkendte stil.
- Fire PNG-masterfiler med reel gennemsigtighed, kopieret uændret fra imagegen.
- Billedudsnit bruger målte ulige cellegrænser til træer/skyer; ingen kroner
  eller skyer bliver delt ved en matematisk tredeling. Ens x/y-skala bevares.
- Baggrundslagene tegnes før bane, farer og figur. Træer/skyer bevæger sig
  langsommere end banen, og det eksisterende hoppeborgmotiv er mindre/dæmpet.
- 21 flag på fælles line svinger højst cirka 3,7 grader omkring deres ophæng.
  Vind og skydrift følger simulationstid og fryser ved pause. Reduceret
  bevægelse fjerner blafren og skyernes egen drift.

Ingen ændringer i fysik, styring, kollisionsfelter, score eller lagringsversion.
[Billedfiler og præcise prompts](art/baggrund-saet/README.md).

## Udgangspunkt og testmetode

Mappen har ingen Git-historik. Alle 45 eksisterende filer under game blev
kopieret til /private/tmp/aulum-baggrund-20261027-before før kodearbejdet,
og SHA-256 registreret. Alle 94 eksisterende tests bestod før ændringerne.

Imagegen-, TDD- og code-review-skills blev læst og brugt. De allerede
anvendte testgrænser blev genbrugt: RunnerArt-grænsefladen og browseradapteren
mod canvas/DOM/lagring. Ingen ny testgrænse eller interviewrunde var nødvendig.

Røde tests blev kørt før den relevante implementering: flaglayout fandtes
ikke; nye motiver blev ikke tegnet; nye billedark blev ikke efterspurgt.
Da de faktiske skyark kom, viste en strammet test også konkret beskæring og
blanding af naboskyer ved lige celler. Efter de respektive ændringer blev
hver af disse kontroller kørt grøn.

Supplerende tests kontrollerer pause/reduceret bevægelse og ugyldige opaque
billedark, som skal give reservegrafik og en statusbesked uden at afbryde spil.
Testharnessens indstilling for reduceret bevægelse er skilt fra højformat,
så de to forskellige browserindstillinger ikke længere sammenblandes i tests.

## Automatiske resultater

**99 af 99 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.

| Område | Antal |
| --- | ---: |
| Uændret fysikversion 4 | 31 |
| Browseradapter, input, lagring og grafik | 28 |
| Billeddata, placering og vindlayout | 12 |
| Bevaret Hoppeborg Challenge | 28 |

De fem nye vedvarende tests dækker:

1. Ophængspunkter på den samme buede line, begrænset blafren og ingen blafren
   ved reduceret bevægelse.
2. Alle fire typer baggrund tegnes med bevarede proportioner før banen uden
   at ændre turen, eksisterende lagerdata eller antal lagerskrivninger.
3. Vind bevæger sig under spil og står stille ved pause/reduceret bevægelse.
4. Virkelig indlæsning af alle fire ark, korrekte celleantal, hele silhuetter
   med ulige margener og separate billedudsnit i rendererens output.
5. Ugyldige opaque ark viser status og bruger reservefigurer; rå baggrunds-
   rektangler tegnes ikke, og spillet fortsætter.

Tidligere kontroller af sidekontrol, timing, momentum, bonusser, slisker,
skade, usårlighed, kamera, skærmgrænser, billedhastigheder, touchhændelser,
profiler og rekorder består fortsat. Core er sammenlignet med den gemte
baseline og er byte for byte uændret.

De automatiske adaptertests bruger efterlignet canvas, DOM, lyd og lager.
De erstatter ikke visuel kontrol eller ægte telefoninput.

## Isolering af browserprøven

Grafikprøven starter med et bogstaveligt testdataobjekt. Hver forekomst af
localStorage i den afledte prøvekode er erstattet af previewStorage, et
inert objekt i hukommelsen. Der er således ingen adgang til rigtige profiler.
Inden browserbrug blev den faktiske prøvekode kørt gennem den eksisterende
adapterharness og en afsluttet tur: den oprindelige lagertekst var uændret,
og antallet af skrivninger til browserlageret var 0. Denne ekstra kontrol
består ud over de 99 vedvarende tests. Prøven havde ingen adgang til at læse
eller skrive eksisterende profiler/rekorder.

## Visuelt afprøvet i browser

- Alle motiver er set i den faktiske renderer med malede træer, forskellige
  skyer, synlig sol, fire flagfarver og fælles line. Solen blev flyttet lidt
  mod venstre, så den valgte startsky ikke dækker solskiven.
- Kontrolleret grafikprøve ved 1280 × 720 samt 556 × 312 og 666 × 375 CSS-punkter.
  Browserens eksisterende zoom påvirkede viewportværktøjets inputmål;
  de faktiske dokumentmål blev aflæst og er tallene angivet her.
- En figur højt i luften ved flaglinen og en frisbee foran en hvid sky blev
  vist for at kontrollere, at baggrunden ikke skjuler figuren eller faren.
- En isoleret rigtig tur blev startet i bredformat. Tre kontroller og HUD
  var synlige, figuren hoppede, og omgivelser/flag bevægede sig.
- Pauseknappen gav pausevisning ved 4,4 sekunder. Den automatiske kontrol
  bekræfter, at både tid og flagvinkler bliver stående under pause.
- Den afsluttende prøve havde ingen reservegrafikbesked. Browserens seneste
  log viste ingen JavaScript-fejl eller advarsler.
- [Forhåndsvisning](art/baggrund-saet/forhaandsvisning.png) gemt direkte fra
  browseren uden billedredigering. Det er en kontrolleret baneprøve.
- Midlertidig prøveside fjernes efter QA; browseren sættes tilbage til normal
  skærmstørrelse og den almindelige spilside ved aflevering.

Alle fire masters er sammenlignet med deres dokumenterede imagegen-originaler
og matcher byte for byte. Pixel- og metadataanalyse var udelukkende aflæsning.
Ingen billedfiler er manuelt redigeret.

## Review

To uafhængige underagenter gennemgik ændringerne fra samme gemte udgangspunkt:

- Standarder: ingen dokumenterede regelbrud. Én valgfri bemærkning om,
  at linens konstante geometri står både i matematikhjælperen og tegningen.
  De stemmer overens; ingen bred refaktorering blev indført.
- Krav: ingen mangler, forkerte kravimplementeringer eller scope creep fundet.

Begge kørte selv art/UI-testene: 40 bestod. De visuelle vurderinger blev
suppleret af browserkontrollen ovenfor. Skillens Git-/issue-tracker-fremgang
blev tilpasset den lokale mappe; brugerens bestilling, grafiklisten og
stilprøven er kravgrundlaget.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ydelse på ældre mobiler, langsomme netforbindelser,
  ægte flerfingerinput og spiltest med børn er ikke verificeret her.
- Sol- og skyark har enkelte løse pixels i fuld opløsning. Et afgrænset
  imagegen-forsøg på oprydning af solen var dårligere og blev kasseret.
  Ved afprøvet spilskala ses ingen forstyrrende farveprikker. De præcise
  kilder og begrænsninger står i HIMMEL-PROMPTS.md.
- Buske, nye bakke-/græsbilleder, farer, bonusglæde, skadereaktion og
  løbe-/balanceposer er stadig kommende grafikarbejde.
- Filerne er ændret lokalt. Ingen Git-branch, PR eller Render-udgivelse er
  oprettet, og en fælles rangliste er ikke implementeret.

Tidligere rapport: [sliske og glideposer](reference/GRAFIK-2-TESTRESULTATER.md).
