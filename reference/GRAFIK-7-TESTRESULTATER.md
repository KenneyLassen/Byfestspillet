# Testresultater — jordløb, returhop og flagstolper

Dato: 27. oktober 2026. Den lokale prototype beholder regellabel og lager v4.

## Ændringen

- Banen har tidlige og gentagne jordstrækninger ved y=550. De er 1500
  spilenheder lange, giver længere løb og slutter ved brede puder med top
  ved y=435. På jord springer figuren først ved manuelt HOP.
- Jordløb, jordafsæt og jordlanding bevarer perfektserie, hoppekraft og
  optjente bonuspoint. Første pudelanding bagefter bedømmes normalt.
- Et manglende eller for lavt hop ind i returpudens front giver AV!, ét
  livstab og sikker fremadredning. Fronten mødes ved figurens bredde,
  så kroppen ikke løber gennem pudens væg.
- Snoren bæres af træstolper ved hvert høje ophæng, worldX=1200 × n.
  Stolper, jordbund og græs tegnes i canvas og følger verdenslaget.
  Stolperne står bag puder, jord, figurer og sponsorbannere. Deres bund
  slutter ved y=590, så ingen træspids stikker under den blå pudebund.
- Instruktionen og HOP-hjælpen forklarer returhoppet. Jordhjælpen bruger
  den kommende pudefront og figurens fart; den ændrer ikke simulationen.

Core er ændret: jordkontakt, timingfritagelse ved jord, frontkollision og
banemønstre er nye. Gravitation, hoppehastigheder, pad-kompression og de
eksisterende pudetimingværdier er bevaret. Dette er derfor mere end en
ren grafikændring. Den lokale øveprototype beholder eksisterende profiler,
rekorder og nøglen `aulumHopOgRul_v4`; der er ingen officiel konkurrence i drift.
Før en sådan konkurrence låses bane og regelversion særskilt.

Der er ikke genereret nye AI-billeder til denne opgave. De eksisterende
løbeark genbruges uden ændringer. [Jord, stolper og billedprøver](art/jord-stolper/README.md).

## Udgangspunkt og testmetode

De 77 eksisterende filer under `game` blev gemt før arbejdet i
`/private/tmp/aulum-jord-stolper-20261027-before/game`, og SHA-256 blev registreret.
Alle 120 tidligere tests bestod. Den foregående rapport er bevaret byte for
byte i [reference/GRAFIK-6-TESTRESULTATER.md](reference/GRAFIK-6-TESTRESULTATER.md).
Projektet har ingen Git-historik.

TDD bruger de allerede aftalte grænser: den faktiske Core-simulation via
`createRun`/`step` samt browseradapteren mod canvas, DOM og lager. Ingen ny
fysik er efterlignet i testene. Billedæstetik og menneskelig læsbarhed
kræver særskilt visuel kontrol.

Dokumenterede røde/grønne forløb omfatter:

- Et tidligt ekstra input under et jordhop nulstillede combo fra 5 til 0.
  Efter rettelsen bevares serie, charge og bonus gennem jordløb og -landing.
- Figuren kunne krydse den hævede pudefront uden straks at blive stoppet.
  Den grønne regression bekræfter ét fronttræf, AV! og sikker fremadredning.
- Åbningsbanen havde ingen jord. Den indeholder nu en tidlig løbesektion
  og en bred returpude uden flyvende farer i dette første forløb.
- En for bred timingfritagelse beskyttede også pad-luft over tomme huller.
  Den er indsnævret til jordafsæt eller en forudset jordlanding; den gamle
  mistiming-regel gælder fortsat på padbanen.
- Ved maksimalt perfekt afsæt og fremadfart landede spilleren kun cirka
  98px før fronten efter en 1200px jordstrækning. Et fronttræf kunne ikke
  undgås. Regressionen består efter forlængelse til 1500px.
- En spiller, der holdt venstre ved verdensfart cirka40, kunne hoppe højt
  nok ved hjælpesignalet, men faldt, fordi centerpunktet endnu var uden for
  puden ved landing. Jord→pad-landinger bruger nu figurens overlappende
  bredde, både i selve landingen og i timingforudsigelsen. Regressionen
  dækker korte tryk, hold og et perfekt tryk otte trin før kontakt. Den
  bekræfter også, at almindelige pad→pad-landinger beholder centerreglen.
- Renderer- og HUD-tests verificerer jordens kontaktkant, løbetrin,
  uændrede gemte data, stolpernes placering/lag og returhoppets hjælp.

Rødt/grønt Core-output: `/private/tmp/aulum-ground-core-red.txt` og
`/private/tmp/aulum-ground-core-green.txt`. Målrettet samlet Core-resultat:
`/private/tmp/aulum-ground-core-tests.txt`. Renderer-, HUD- og stolpelogs
ligger i `/private/tmp/aulum-ground-render-*.txt`,
`aulum-ground-hud-*.txt` og `aulum-stolper-*.txt`. Kantlandingsrettelsens
røde/grønne output er `/private/tmp/aulum-ground-edge-red.txt` og
`/private/tmp/aulum-ground-edge-green.txt`. Stolpebundens kosmetiske
regression har rødt/grønt output i `/private/tmp/aulum-stolper-foot-*.txt`.

## Automatiske resultater

**130 af 130 tests består. 0 fejlede, 0 oversprungne.**
Alle 38 Core-tests består også som målrettet kontrol efter kantrettelsen.

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.
Samlet slutoutput: `/private/tmp/aulum-jord-stolper-final-tests.txt`.

| Område | Antal |
| --- | ---: |
| Core-simulation, bane, timing og skade | 38 |
| Browseradapter, input, lagring og grafik | 40 |
| Billeddata, kontakttrin og flaglayout | 16 |
| Bevaret Hoppeborg Challenge | 28 |
| Sponsorformat og validering | 5 |
| Sponsoreditor | 3 |

Ti nye tests omfatter syv Core-tests og tre adaptertests. Testene viser,
at combo 4, charge 3 og bonus 200 bevares under jordløb og returhop. Et nyt
korrekt tryk på næste pude giver combo 5, charge 4 og bonus 300. Uden korrekt
pudetiming bagefter brydes serien normalt og charge bliver 2, mens de
allerede optjente 200 bonuspoint beholdes.

Alle tidligere kontroller af input, skærmgrænser, pause, slisker, skade,
usårlighed, profiler, rekorder og sponsorbilleder består fortsat. Alle 29
billedfiler fra udgangspunktet er uændrede, ligesom RunnerArt, CSS,
sponsorformat/editor og det tidligere spil. Forsidens tre scriptadresser
har fået versionsmærket `?v=jord-stolper-1`, så åbne browseres cache ikke
fastholder gamle Core-, Art- og Runner-filer. Lagringsnøglerne er bevaret.

## Kontrolleret simulation af returhop

Korte tryk på to simulationstrin og hold er afprøvet fra jord til pude ved
åbningsfart og ekstrem fremadfart. I en 5px-sampling landede korte tryk
sikkert fra 70–170px før fronten ved åbningsfart 270. Ved startfart 860
(base 400, momentum 230 og fremadstyring 230, med normal dissipation under
forløbet) var det målte sikre interval 175–485px. Hold gav et bredere interval.
Disse mål er kontrolleret simulation, ikke en afprøvning med børn.

Det ekstreme forløb med fuldt perfekt rebound lander på jord med cirka
398px tilbage til returpudens front. Den kontrollerede reference får
22 grounded simulationstrin, cirka 0,183 sekunder, før nyt afsæt og når
returpuden med tre liv. En bredere normal løbeankomst giver længere løb.
Den eksisterende rutesøgning gennem åbnings- og maksimalfartsbanen består
også uden redning eller livstab. Den kender præcis geometri og beviser kun,
at en rute findes; den måler ikke børnevenlig timing.

## Browserkontrol

Hovedagenten har kontrolleret en isoleret scene ved 1280 × 720:

- Græsjorden skiller sig visuelt fra puderne, og træstolpen ved snorens
  top står bag puden. HUD viser combo 4, charge 3 og samlet score 400.
- Tæt på returpuden viser den grønne HOP-hjælp, at der skal hoppes op.
- Et manuelt tryk på to simulationstrin er afspillet gennem den faktiske
  Core. Figuren lander på returpuden med tre liv, combo 4, charge 3 og
  score 416. HOP-hjælpen skifter herefter tilbage til pudens timing.
- [Jordløb og stolper](art/jord-stolper/forhaandsvisning.png) og
  [returhoppet](art/jord-stolper/hop-op-pude.png) er gemt som uændrede
  browserskærmbilleder. De dokumenterer kontrollerede Core-scener og
  erstatter ikke en spiltest med mennesker.

Det første preview brugte en cachet gammel Core-fil og gav en TypeError.
Forsidens versionsmærkede scriptadresser løste problemet; efter rettelsen
var den nye browserfane uden fejl. Rapporten hævder derfor ikke, at hele
QA-forløbet var uden fejl fra begyndelsen. Det almindelige spil åbnes som
`http://127.0.0.1:8765/?v=jord-stolper-1` med en sammenhængende ny Core,
Art og Runner.

Den isolerede prøveside er genkontrolleret efter kant-, cache- og
stolpebundsrettelserne. Den tilgår ikke browserens virkelige profillager;
afslutning af en runde bevarer de oprindelige data byte for byte med nul
virkelige lagerskrivninger. Kontrol:
`/private/tmp/aulum-ground-posts-isolation.cjs`.
Den midlertidige prøveside er fjernet. En ny fane med den versionsmærkede
spilside er åbnet på startmenuen med den eksisterende profil; den tidligere
spilfane er bevaret uden at nulstille dens igangværende tur.

## Review

To uafhængige underagenter har gennemgået ændringen mod det gemte udgangspunkt:

- Standarder: ingen resterende fund efter de endelige rettelser;
  130 tests verificeret uafhængigt.
- Krav: ingen resterende fund efter kantlandings- og stolpebundsrettelserne.

Begge gennemgange er afsluttet. Der er ikke oprettet et Git-commit for
at gennemføre reviewet.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ægte berørings- og flerfingerinput, ydelse på ældre
  mobiler, langsomme netforbindelser og spiltest med børn er ikke afprøvet.
- Nye malede buske, bakker/græs, bonusglæde og skadereaktion er fortsat
  kommende grafikarbejde. Stolpernes og jordens canvasgrafik er integreret.
- Banen er ændret i den lokale øveprototype, mens v4-profiler og rekorder
  bevares. Før en officiel konkurrence skal banen og regelversionen låses.
- Ændringerne ligger lokalt. Ingen Git-branch, PR eller Render-udgivelse er
  oprettet. Der er fortsat ingen fælles rangliste eller konkurrenceserver.

Tidligere rapport: [løbe-/balancetrin og verdensfast flagline](reference/GRAFIK-6-TESTRESULTATER.md).
