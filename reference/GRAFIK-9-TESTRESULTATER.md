# Testresultater — korrigeret løbeserie

28. oktober 2026. Lokal prototype. Rettelsen vedrører løbebilleder og
kontaktankre; fysik, point, lager og afspilningstakt er bevaret.

## Reproduktion og årsag

Arrangørens vedhæftede skærmoptagelse varer 4,435 sekunder. Løbedelen blev
udtrukket i trin på 0,1 sekund og sammenholdt med begge oprindelige PNG-ark.
Figuren gentog næsten samme brede skridt, afbrudt af en dyb sammenkrøbning.
Billederne udgjorde ikke en sammenhængende vekslende løbeserie. En ændring
af hastigheden eller en ren omrokering kunne ikke skabe manglende poser.

Den visuelle reproduktion ligger i
`/private/tmp/aulum-loeb-video/tidsforloeb.png`. Den er manuelt vurderet:
en meningsfuld automatisk kontrol af PNG-billeders anatomiske naturlighed
findes ikke ved de nuværende testgrænser. Derfor bruges visuel før/efter-
kontrol til selve symptomet, og automatiske tests til afspilningskontrakten.
Det er en konkret begrænsning ved fejlsøgningsforløbets automatiske signal.

## Ændring

Runneren bruger to nye uændrede RGBA-masters fra indbygget imagegen, tegnet
med en konkret poseguide. De gamle masters er bevaret byte for byte.
To tydeligere passagefaser erstatter den gamle sammenkrøbning og de mange
næsten identiske udstrakte skridt. Fodankre og neutralens fælles skala er
målt i de nye billeder. Alle figurer vender mod højre.

De faktiske produktionsændringer er kun:

- Nye løbe-assetstier og målte ankre i runner.js.
- Versionsmærket scriptadresse i index.html, så browseren henter rettelsen.
- To nye billedfiler og tilhørende dokumentation/prøver.

Art.runPoseIndex og løbeklokken er uændrede: fase 1–8 og tilbage til 1,
ni billeder i sekundet ved normal fart og højst tolv ved høj fart.
Core, Art, skade, hop, superhelt, profiler, lokale rekorder, sponsorer og
det tidligere hoppeborgspil er uændrede byte for byte.

[Valgte billeder, mål, ankre og prompts](art/loeb-saet-v2/README.md).

## Automatiske kontroller

**143 af 143 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1:

```text
node --test game/tests/*.test.cjs
```

Samlet log: `/private/tmp/aulum-loeb-final-tests.txt`.
Udgangspunktets 142 tests bestod før ændringerne. Der er tilføjet én test,
og den eksisterende loader-/ankertest er opdateret til de nye mål.

Den nye regression ved den allerede aftalte browseradaptergrænse kræver
begge præcise nye billedstier og observerer canvas-output gennem et helt
loop med overgangen 8→1. Den kontrollerer fælles skala, kontakt og uændret
komplet simulation/lager. Den fejlede før rettelsen med “dreng requests
the reviewed running artwork” og består efter rettelsen:

- `/private/tmp/aulum-loeb-sekvens-red.txt`: 0/1 bestået.
- `/private/tmp/aulum-loeb-sekvens-green.txt`: 1/1 bestået.
- `/private/tmp/aulum-loeb-ui-green.txt`: 3/3 relevante tests bestået,
  inklusive faktisk indlæsning, nye ankre, takt, pause og lufttid.

Dette er ikke en påstand om, at syntetiske testbilleder beviser anatomien.
Den kontrollerede sekvenskontrakt fastholder de visuelt udvalgte kilder.

## Visuel kontrol og dataisolering

I den indbyggede browser ved 1280 × 720 er begge figurer gennemgået i alle
otte faser og ved overgangen 8→1. Både enkelttrin og afspilning er anvendt.
Den gamle dybe sammenkrøbning er væk, og begge benpassager er tydeligere.
Fodkontakt og kropshøjde er stabile i spilstørrelse; figurerne vender højre.

Prøven brugte det aktuelle renderingsprogram med syntetiske profildata,
fast jord og et inaktivt prøvelager. En afsluttet prøverunde bevarede de
virkelige profildata byte for byte med nul lagerskrivninger. Kontrollen
ligger i `/private/tmp/aulum-loeb-isolation.cjs`. Den midlertidige HTML-prøve
er fjernet efter kontrollen. Ingen spillerrunde er gemt fra prøven.

Gemte resultater:

- [Browserbillede](art/loeb-saet-v2/browserproeve.png).
- [Alle før/efter-trin](art/loeb-saet-v2/sekvenskontrol.png).
- [Animeret sammenligning](art/loeb-saet-v2/loeb-foer-efter.gif), sammensat af
  browserbilleder, 110 ms pr. billede. Venstre er før, højre er nu.

## To uafhængige reviewakser

**Standards: 0 fund.** Snapshotdiff, gennemsigtighed, cellegrænser,
fodankre og testkvalitet er kontrolleret. Alle 18 celler har fri margen;
ankrenes y matcher faktisk synlig bund. Masters matcher værktøjets valgte
output byte for byte. Reviewer genkørte hele samlingen: 143/143 bestået.
Log: `/private/tmp/aulum-loeb-standards-tests.txt`.

**Spec: ingen blokerende fund.** Reviewer gennemgik videoens tidsforløb,
begge masters og alle før/efter-browsertrin. To tydeligere benpassager,
roligere wrap og bortfald af dyb sammenkrøbning er bekræftet. Fire relevante
Art-/UI-tests blev genkørt: 4/4 bestået.

Der er ingen Git i projektet. Review bruger det gemte udgangspunkt
`/private/tmp/aulum-loeb-20261028-before/game` med manifest af 90 filer.

## Begrænsninger og levering

- Dette er et forbedret stiliseret løb. Armsvinget er stadig beskedent,
  og enkelte faser har beslægtet silhuet; det er ikke anatomisk perfekt.
- Nye figurer har en lidt tydeligere sideprofil. Neutralens 70 spilenheder
  og den fælles skala gennem hvert ark bevares.
- Prøven er en grafikprøve på fast jord, ikke en fuld menneskelig spiltest.
  Fysiske telefoner, ægte berøring og afprøvning med børn mangler.
- De to nye masterfiler fylder cirka 2,22 MB og er endnu ikke optimeret.
- Ingen branch, PR, fælles rangliste eller Render-udgivelse er oprettet.

Forrige samlede rapport om superhelt, projektiler og forgrund er bevaret
[byte-identisk som historik](reference/GRAFIK-8-TESTRESULTATER.md).
