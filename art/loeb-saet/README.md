# Løbe-/balancetrin og flagline

Integreret 27. oktober 2026. Begge figurer beholder deres farver og identitet
fra den [godkendte stilprøve](../stilproeve/stilproeve-01.png) og de eksisterende
hoppeark. Alle poser vender fremad mod højre, også ved styring til venstre.

## Billeder og rækkefølge

| Fil | Indhold | Format |
| --- | --- | --- |
| [dreng-loeb.png](dreng-loeb.png) | Neutral kalibrering + otte kontakttrin | 1254 × 1254, RGBA |
| [pige-loeb.png](pige-loeb.png) | Neutral kalibrering + otte kontakttrin | 1254 × 1254, RGBA |
| [kontakt-proeve.png](kontakt-proeve.png) | Browserprøve af begge figurer ved pudekontakt | PNG |
| [hop-over-flagline.png](hop-over-flagline.png) | Højt hop over den verdensfaste snor | PNG |

De to masters er fremstillet med separate kald til indbygget imagegen og
kopieret uændret. De har reel alpha fra 0 til 255 og bruger ingen
baggrundsmaskering. Ingen CLI/API-fallback. [Prompts og kildefilnavne](PROMPTS.md).

Rækkefølgen er fra venstre mod højre, række for række: neutral i celle 0,
derefter løb 1–8. Billederne er korte løbe-/balancetrin til pudekontakten,
ikke et løbeloop i luften. Fasen følger figurens vandrette verdensposition:
én fase pr. 10 tilbagelagte spilenheder, otte faser i alt. Ved vandret fart
under én spilenhed/sekund bruges neutral. Pause flytter ikke fasen.

Trinene bruges kun ved fysisk jordkontakt, uden skade eller glidning.
De sidste to afsætstrin bruger fortsat den eksisterende hoppegrafik; hop,
fald og slisker beholder deres egne poser. Pudernes samlede kontaktfase er
fortsat ni simulationstrin, 75 ms. Denne pakke forlænger ikke kontakten og
ændrer ikke fysik, kollisionsfelter, timing, momentum, point eller rekorder.
Et kontinuerligt loop i en grafikprøve viser posesættet, ikke rundens fysik.

## Skala, cellegrænser og kontaktankre

Kolonner: 0/418/836/1254. Rækker: 0/432/830/1254. De ulige rækkemargener
holder de øverste posers sko inde i deres egen celle. Hver celle beskæres
efter alpha ≥64, mens den oprindelige PNG bevares.

Hvert ark bruger én fælles skala fra sin neutrale pose: 70/376 for drengen
og 70/387 for pigen. Den fælles skala bevarer hoved- og kropsstørrelsen;
knæbøjning og kropshældning ændrer kun silhuettens form og højde.
Hoftecentret styrer vandret placering, og den plantede skos bund styrer
kontakt med pudens fysiske overflade og sammenpresning.

Alle ankre nedenfor er lokale i cellen, før celleoprindelsen lægges til:

| Celle | Pose | Dreng (x, y) | Pige (x, y) |
| ---: | --- | --- | --- |
| 0 | Neutral | 249, 420 | 252, 417 |
| 1 | Løb 1 | 189, 418 | 205, 418 |
| 2 | Løb 2 | 167, 424 | 220, 416 |
| 3 | Løb 3 | 248, 379 | 215, 387 |
| 4 | Løb 4 | 205, 379 | 210, 387 |
| 5 | Løb 5 | 186, 382 | 215, 388 |
| 6 | Løb 6 | 243, 389 | 224, 392 |
| 7 | Løb 7 | 207, 380 | 197, 392 |
| 8 | Løb 8 | 188, 383 | 229, 396 |

Der er enkelte løse kildepixels i arkene ved fuld opløsning. De ses ikke
som forstyrrende mærker i den afprøvede spilstørrelse; masters er bevaret.
Ved et manglende eller ugyldigt ark bruges den eksisterende figurgrafik.

SHA-256:

- Dreng: `f56d247d1339ee5db4783aa787b4fc2c73b717b215aed7893d5594d9ed8e7b2c`
- Pige: `477d5fb55f94db2914352c62128d46cd50addfb268d9dfb2154d43e3afaa35df`

## Flaglinen

Snoren er flyttet fra skærmbaggrunden til et verdenslag før bane og figur.
Den gentages i faste sektioner på 1200 spilenheder. Ophængenes højde er
worldY=170 og snorens midte worldY=205. Samme kameraoffset som banen gælder
både vandret og lodret, så linen ikke følger figurens hop op og ned.
Flagets variant og vindfase hører til samme verdensflag. Den rolige vind
fryser fortsat ved pause; reduceret bevægelse fjerner blafren.

Høje hop fra højere puder med opbygget hoppekraft kan passere over snoren.
Et kontrolleret Core-forløb på en pude ved y=355 med hoppekraft 5 nåede
føddernes højde cirka 178,4, uden ændring af fysikken. Flaglinen er pynt og
er hverken en platform, en ny forhindring eller en kilde til point.

## Kontrol

120 automatiske tests består. Kontaktprøven viser begge figurer i samme
spilstørrelse med fødder på pudekanten, og et højt hop over linen er set
ved desktopvisning 1280 × 720. Prøven bruger isoleret lager; afslutning af
en runde bevarer virkelige profiler byte for byte med nul lagerskrivninger.
Fysiske telefoner, berøringsinput, ydelse på ældre mobiler og afprøvning
med børn mangler. [Samlede resultater og begrænsninger](../../TESTRESULTATER-RUNNER.md).
