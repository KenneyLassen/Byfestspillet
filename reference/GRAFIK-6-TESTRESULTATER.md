# Testresultater — løbe-/balancetrin og verdensfast flagline

Dato: 27. oktober 2026. Fysikversion 4 er bevaret.

## Ændringen

- Begge figurer får neutral kalibrering og otte højrevendte løbe-/balancetrin
  ved fysisk pudekontakt. Hver figur bruger én fælles kropsskala og målte
  hofte-/skoankre. Luft, afsæt, fald, skade og slisker prioriterer deres egne poser.
- Fasen følger tilbagelagt vandret afstand og ændres ikke ved pause. Pudens
  ni simulationstrin, 75 ms kontakt, er bevaret. Der er intet løbeloop i luften.
- Flaglinen er flyttet til verdenslaget bag bane og figur. Sektionerne er
  1200 spilenheder brede med ophæng ved y=170 og midte ved y=205. Kameraet
  flytter linen sammen med banen; høje hop kan passere over den.
- Vindfase og farve følger det enkelte verdensflag. Pause og reduceret
  bevægelse virker fortsat. Linen er pynt uden kollision eller point.

To separate kald til indbygget imagegen producerede løbearkene. De nye
1254 × 1254 RGBA-masters har reel alpha og er kopieret uændret.
[Billeder, skala, ankre, prompts og browserprøver](art/loeb-saet/README.md).

## Udgangspunkt og testmetode

De 70 eksisterende filer under `game` blev kopieret før arbejdet til
`/private/tmp/aulum-loeb-flag-20261027-before/game`, og SHA-256 blev registreret.
Alle 116 eksisterende tests bestod. Den foregående rapport er bevaret byte
for byte i [reference/GRAFIK-5-TESTRESULTATER.md](reference/GRAFIK-5-TESTRESULTATER.md).
Projektet har ingen Git-historik.

TDD er brugt ved de allerede aftalte grænser: RunnerArt og den faktiske
browseradapter mod canvas, billedindlæsning, DOM og lager. Simulationen og
billedlayoutet er projektets rigtige kode; browsergrænserne efterlignes.

Dokumenterede røde/grønne forløb:

- Kontaktposernes valg fejlede før `runPoseIndex` fandtes og består efter
  implementeringen. Luft, skade og glidning må ikke vælge løbetrin.
- Indlæsning og tegning af begge løbeark fejlede før integrationen. Den grønne
  test kontrollerer fælles skala, plantefod, fremdriftsfase og prioriteringen
  af eksisterende hoppe-/skadeposer uden at ændre tur eller lager.
- Flagsektionstesten fejlede med 600 i stedet for worldX=1800. Den består
  med faste verdensankre og stabil flagidentitet mellem sektioner.
- Rendererprøven fejlede, fordi flaget ikke fulgte kameraet. Den består nu
  for vandret og lodret kameraflytning, lagrækkefølge og figur over snoren.
  Canvasgrænsen registrerer transformationer, så skærmplaceringen kan måles.

Logfilerne ligger i `/private/tmp`: `aulum-loeb-red.txt`, `aulum-loeb-green.txt`,
`aulum-loeb-render-red.txt`, `aulum-loeb-render-green.txt`,
`aulum-world-flags-red.txt` og `aulum-world-flags-green.txt`.

## Automatiske resultater

**120 af 120 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.
Samlet output: `/private/tmp/aulum-loeb-flag-current-tests.txt`.

| Område | Antal |
| --- | ---: |
| Uændret fysikversion 4 | 31 |
| Browseradapter, input, lagring og grafik | 37 |
| Billeddata, placering, kontakttrin og flaglayout | 16 |
| Bevaret Hoppeborg Challenge | 28 |
| Sponsorformat og validering | 5 |
| Sponsoreditor | 3 |

Alle tidligere kontroller af styring, timing, momentum, bonus, skade,
usårlighed, slisker, skærmgrænser, pause, profiler, rekorder, forgrund,
sponsor- og farebilleder består fortsat. `runner-core.js` og alle 25
eksisterende billedfiler er sammenlignet med udgangspunktet og er byte for
byte uændrede. Fysik, kollisionsfelter, point og lagringsversion er bevaret.

Adaptertests bruger efterlignet canvas og browsergrænser. De erstatter
ikke ægte berøringsinput, telefonlayout eller ydelsesmålinger.

## Afprøvet i browser og kontrolleret i simulationen

- Desktopvisning 1280 × 720: begge figurer er set vendt mod højre, i samme
  spilstørrelse og med fødderne på pudekanten i en isoleret kontaktprøve.
  [Kontaktprøve](art/loeb-saet/kontakt-proeve.png).
- Posesættet er også set i en kontinuerlig grafikprøve. Dette loop viser
  billederne og er ikke en påstand om længere pudekontakt i selve spillet.
- Et kontrolleret forløb med den faktiske Core-fysik på en pude ved y=355 og
  hoppekraft 5 er brugt til et højt hop. Fødderne når cirka 178,4, og hele
  figuren er set over den verdensfaste line. Et normalt afsæt fra samme
  kontrollerede udgangspunkt når cirka 249,1. Fysikken er ikke ændret.
  [Hop over flaglinen](art/loeb-saet/hop-over-flagline.png).
- En separat isolationskontrol af prøvesiden bestod: afslutning af en runde
  bevarede oprindelige spillerdata byte for byte med nul virkelige
  lagerskrivninger. Prøven tilgår ikke browserens virkelige `localStorage`.
  Kontrol: `/private/tmp/aulum-run-flags-isolation.cjs`.

Den midlertidige prøveside er fjernet, og det almindelige spil er genåbnet
på startmenuen med den eksisterende profil. Browserloggen viste ingen fejl
eller advarsler under kontrollen.

Den fulde prøve af mobilmenu og berøring er ikke udført i denne runde.
Masterarkenes enkelte løse kildepixels ses ikke som forstyrrende mærker i
den afprøvede spilstørrelse. De oprindelige masterfiler er bevaret.

## Review

To uafhængige underagenter gennemgik ændringen mod samme gemte udgangspunkt,
inklusive nye filer:

- Standarder: ingen resterende fund.
- Krav: ingen resterende fund.

Begge reviewakser bekræftede 120 beståede tests. Der er ikke oprettet et
Git-commit for at gennemføre reviewet.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ægte berørings- og flerfingerinput, ydelse på ældre
  mobiler, langsomme netforbindelser og spiltest med børn er ikke afprøvet.
- Bonusglæde, skadereaktion, nye buske og bakke-/græsbilleder er fortsat
  kommende grafikarbejde. Løb i luften eller længere pudekontakt er ikke tilføjet.
- Ændringerne ligger lokalt. Ingen Git-branch, PR eller Render-udgivelse er
  oprettet. Der er fortsat ingen fælles rangliste eller konkurrenceserver.

Tidligere rapport: [pølser og frisbees](reference/GRAFIK-5-TESTRESULTATER.md).
