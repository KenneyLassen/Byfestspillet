# Testresultater — forgrund, hoppeborg og sponsorbilleder

Dato: 27. oktober 2026. Spillets fysikversion 4 er bevaret.

## Ændringen

- Enkelte eksisterende træer står nu foran figuren på lange, lave puder efter
  indledningen. De følger banen og kan kort skjule figuren. Flyvende farer og
  skadebeskeden AV! tegnes foran træerne.
- Hoppeborgens synlige bund står på en græsplet med skygge. Transparent
  billedmargen skæres fra ved indlæsning, uden at billedfilen ændres.
- Sponsorbilleder vises på pudernes forsider under landingskanten. De følger
  sammenpresningen, bevarer proportionerne og tegnes på dækkende kort foran
  træerne. Interne betegnelser vises aldrig i stedet for billeder.
- En separat lokal editor kan tilføje billeder, ændre rækkefølge, importere
  og hente sponsorfilen. Hvert element kræver et billede. Den medfølgende
  `sponsorer.json` er tom, og en tom liste viser ingen reklamer.

Fysik, styring, kollisionsfelter, score og lagringsversion er uændrede.
De korte passager bag træer ændrer synligheden af figuren som aftalt.
[Brugsgang til sponsorbilleder](SPONSORER.md).

## Udgangspunkt og testmetode

Mappen har ingen Git-historik. Alle 55 eksisterende filer under `game` blev
kopieret til `/private/tmp/aulum-forgrund-sponsor-20261027-before` før arbejdet,
og SHA-256 blev registreret. Alle 99 eksisterende tests bestod ved udgangspunktet.

TDD og de eksisterende testgrænser er brugt: RunnerArt-grænsefladen og
browseradapteren mod canvas/DOM/lagring. Sponsorformatets nye offentlige
grænse er `SponsorConfig.parse` og `serialize`. Editorens tests afvikler den
faktiske editor med DOM, billedindlæsning, filindlæsning, hentning og download
erstattet ved browsergrænsen. De tester handlinger og eksporteret indhold.

Dokumenterede røde/grønne forløb omfatter:

- Sponsorformatets første test fejlede, mens modulet manglede. Validering af
  identiteter, billeder og størrelsesgrænser blev tilføjet efter relevante
  fejlede tests. Testene bestod efter implementeringen.
- Efter kravet om billeder fejlede en test, fordi en sponsor uden billede
  blev accepteret. Både indlæsning og eksport afviser nu sådanne elementer;
  den tomme liste er stadig gyldig.
- En editorregression fejlede, fordi redigering var mulig under den første
  indlæsning. Det kunne erstatte den eksisterende liste med en ny kladde.
  Redigering og eksport er nu låst under indlæsningen, og den grønne test
  bekræfter, at eksisterende og nye billeder begge er med i eksporten.
- Automatisk intern betegnelse fra filnavnet fejlede først med et tomt felt.
  Efter rettelsen består den sammen med kontrollen af, at et fejlramt
  forhåndsvisningsbillede ikke erstattes af betegnelsen.

## Automatiske resultater

**114 af 114 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.

| Område | Antal |
| --- | ---: |
| Uændret fysikversion 4 | 31 |
| Browseradapter, input, lagring og grafik | 33 |
| Billeddata, placering og vindlayout | 14 |
| Bevaret Hoppeborg Challenge | 28 |
| Sponsorformat og validering | 5 |
| Sponsoreditor | 3 |

De 15 nye vedvarende tests dækker:

- To billedlayouttests: sparsomme, stabile træplaceringer efter indledningen
  samt bannerplacering inden for pudefronten under sammenpresning.
- Fem renderer-/adaptertests: hoppeborgens synlige bund, lagrækkefølge og
  billedproportioner, utilgængelige billeder, interne betegnelser uden tekst
  på bannere samt AV! foran træerne. Kontrollerne bevarer tur og gemte data.
- Fem sponsorformattests: obligatoriske billeder, rundtur med stabile id'er
  og rækkefølge, gyldige betegnelser/versioner, tilladte rasterkilder samt
  grænser på 24 elementer, 3 MB pr. billede og 8 MB samlet.
- Tre editortests: forsinket førstegangsindlæsning uden tab af eksisterende
  billeder, upload/filnavn/fejlvisning samt afvist lagring uden billede og
  mulighed for at fortsætte efter en indlæsningsfejl.

Alle tidligere tests af styring, timing, momentum, bonus, slisker, skade,
usårlighed, skærmgrænser, pause, profiler og rekorder består fortsat.
`runner-core.js` og alle 21 eksisterende billedfiler er sammenlignet med
SHA-256 fra udgangspunktet og er byte for byte uændrede. Ingen nye
spilbilleder er produceret til denne ændring.

Adapter- og editortests bruger efterlignet canvas, DOM, lyd, lager og
browserfiler. De erstatter ikke visuel kontrol eller ægte telefoninput.

## Afprøvet i browser

- Isoleret baneprøve med et eksisterende hoppepudebillede som testbanner.
  Figuren er set delvist skjult af et træ; det dækkende bannerkort ligger
  foran træet. Testbilledet er ikke lagt i den fælles sponsorliste.
- Hoppeborgens placering på græs og den samlede scene er visuelt kontrolleret.
- Den faktiske editor er prøvet med PNG-upload fra projektet, import, eksport
  og genimport. Billeddata fra den seneste eksport blev afkodet til 659.695
  bytes og matchede uploadfilen byte for byte.
- Fjern billede og Gem gav “Vælg et sponsorbillede, før du gemmer.” Annuller
  redigering bevarede det eksisterende billede.
- Bekræftet desktop-viewport: 1536 × 864. Et forsøg på at indstille en mindre
  viewport slog ikke igennem i browseren; mobilvisning er derfor ikke
  bekræftet i denne runde.
- [Forhåndsvisning af den isolerede baneprøve](art/forgrund-sponsor/forhaandsvisning.png).

Editoren bruger en kladde i hukommelsen, henter kun sponsorfilen og udløser
en lokal download. Den skriver ikke til serveren eller til profil-/rekordlager.
Den fælles `sponsorer.json` er fortsat tom. Prøven er ikke en udgivelse.
Den midlertidige prøveside er fjernet; det almindelige spil og editoren er
genåbnet, og editoren viser den tomme liste.

## Review

To uafhængige underagenter har gennemgået ændringerne mod samme gemte
udgangspunkt, inklusive nye filer:

- Standarder: ingen resterende fund efter rettelserne.
- Krav: ingen resterende fund efter rettelserne.

Under gennemgangen blev blandt andet risikoen for tab af eksisterende
sponsorliste under første indlæsning og behovet for at vise AV! foran træerne
identificeret; begge er rettet og regressionstestet.

Brugerens billedkrav er indarbejdet: billeder er obligatoriske, betegnelser
er interne, og en tom liste giver ingen reklamer. Begge reviewakser er
afsluttet. Der er ikke oprettet et Git-commit for at gennemføre reviewet.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ægte flerfingerinput, ydelse på ældre mobiler, langsomme
  netforbindelser og spiltest med børn er ikke afprøvet i denne runde.
- Den nye scene er ikke verificeret ved en bekræftet mobilbredde i browseren.
  Tidligere grafikrapporter beskriver deres egne kontroller og er ikke
  genbrugte måleresultater for denne ændring.
- Der er endnu ingen faktiske sponsorbilleder i den fælles fil. Valg og
  udgivelse af dem mangler. Editorens lokale download udgiver ikke automatisk.
- Nye buske, bakke-/græsbilleder, farer, bonusglæde, skadereaktion og
  løbe-/balanceposer er stadig kommende grafikarbejde.
- Ændringerne ligger lokalt. Ingen Git-branch, PR eller Render-udgivelse er
  oprettet. Der er fortsat ingen fælles rangliste eller konkurrenceserver.

Tidligere rapport: [træer, skyer, sol og flagline](reference/GRAFIK-3-TESTRESULTATER.md).
