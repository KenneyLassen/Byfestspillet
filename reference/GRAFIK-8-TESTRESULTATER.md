# Testresultater — superhelte, flere projektiler og grafiske rettelser

Dato: 27. oktober 2026. Ændringerne ligger i den lokale øveprototype.
Regellabel og lager v4 bevares; der er ingen officiel konkurrence i drift.

## Ændringen

- Træstolperne klippes ved den nærmeste baneflades top, inklusive streg og
  rund fod. Klippet følger pudens sammenpresning. Stolpen ses dermed ikke
  gennem pudegrafikkens transparente bundmargen.
- Forgrundstræerne er 434 spilenheder høje med bund ved y=590,
  svarende til stolpernes fulde højde. Sponsorbannere og flyvende farer
  tegnes fortsat foran træerne; det gør også den nye powerup.
- Løbeanimationen følger aktiv jord-/pudekontakttid frem for tilbagelagt
  afstand: ni billeder i sekundet ved normal fart, højst tolv ved høj fart.
  Pause og lufttid driver ikke benloopet frem.
- Flere egnede puder giver varslede projektiler med mindst 3,2 sekunders
  mellemrum. Første otte aktive sekunder er rolige. Første jord kan derefter
  give én frisbee med ekstra plads til returhoppet. Slisker og direkte
  returpuder er friholdt.
- En sjælden stjerne med kappe giver præcis syv aktive sekunders beskyttet
  superhelteflyvning hurtigt frem på banen. Begge figurer har tre nye
  højrevendte flyveposer med fælles skala fra en neutral kalibrering.
- Flyvningen slutter blødt på en bred, reel flade foran figuren med kort
  beskyttelse og uden timingbedømmelse af den automatiske landing.
  Perfektserie, hoppekraft og optjente bonuspoint bevares.

Core er udvidet med flyvning, sikker landingsplanlægning og tættere farer.
Det er mere end grafik. Pudernes gravitation, afsæt og timingværdier er
bevaret, ligesom profiler og lokale v4-rekorder. Flyvning giver almindelige
tidspoint uden en særskilt bonus. Før en officiel konkurrence låses bane
og regelversion særskilt.

## Udgangspunkt og testmetode

Udgangspunktet med 82 filer ligger i
`/private/tmp/aulum-superhelt-20261027-before/game`. Alle 130 tidligere
tests bestod. Projektet har ingen Git-historik. Den foregående rapport er
arkiveret byte for byte i
[reference/GRAFIK-7-TESTRESULTATER.md](reference/GRAFIK-7-TESTRESULTATER.md)
og sammenlignet med kopien fra udgangspunktet.

De godkendte testgrænser er bevaret: den faktiske Core via `createRun`/`step`,
browseradapteren mod DOM/canvas/lager og Art-funktionernes billeddata og
placering. Testene efterligner ikke fysikken i en separat model.
Visuel stil, naturlige bevægelser og børns reaktionstid kræver også
afprøvning med mennesker.

Dokumenterede røde/grønne forløb omfatter:

- Gentagne kast på lange egnede flader og otte rolige sekunder fra start.
- Én tidlig frisbee på første jord, som kan undviges før returhoppet.
- Deterministisk sjælden fremkomst, fysisk opsamling, præcis varighed,
  usårlighed, ingen pointbonus fra input og sikker landing.
- Sidekontrolens skærmgrænser, blød overgang fra flyvning over et hul til
  en bred flade, ingen baglæns redning og bevaret serie efter landing.
- Oprydning af passerede powerups, frysetilstand ved afsluttet runde og
  nulstilling af flyvning ved genstart.
- Kravreview fandt en fejl: flyvning fra den reelle section-17-pude med
  vedvarende højrestyring nåede ud over de allerede genererede brede
  landingssteder. Det gav en TypeError ved nedflyvningens start.
  Banegeneratoren udvides nu fremad, indtil en egnet reel flade findes.
  Regressionen gennemfører alle 840 trin med tre liv og sikre landingsmargener.
- Renderer/HUD kontrollerer de nye figurark, kontaktankre, langsommere
  løbetakt, pause, stolpeklip, store træer og automatisk flyvning med nedtælling.

Core-logpar ligger i `/private/tmp/aulum-hazard-{red,green}.txt`,
`aulum-hazard-intro-{red,green}.txt`, `aulum-hero-{red,green}.txt`,
`aulum-hero-spawn-{red,green}.txt` og `aulum-hero-horizon-{red,green}.txt`.
Målrettet udgangskontrol: `/private/tmp/aulum-hero-exit-tests.txt`.
Adapterens flyve-, HUD- og pickupforløb har logpar i
`/private/tmp/aulum-hero-render-{red,green}.txt`,
`aulum-hero-hud-{red,green}.txt` og `aulum-hero-pickup-{red,green}.txt`.

## Automatiske resultater

**142 af 142 tests består. 0 fejlede, 0 oversprungne.**

Kørt med Node v24.22.1: `node --test game/tests/*.test.cjs`.
Samlet output efter rettelsen fra review:
`/private/tmp/aulum-superhelt-final-tests.txt`.

| Område | Antal |
| --- | ---: |
| Core-simulation, bane, timing, flyvning og skade | 45 |
| Browseradapter, input, lagring og grafik | 43 |
| Billeddata, kontakttrin og flaglayout | 18 |
| Bevaret Hoppeborg Challenge | 28 |
| Sponsorformat og validering | 5 |
| Sponsoreditor | 3 |

Der er 12 nye tests: syv Core-tests, tre adaptertests og to Art-tests.
Tidligere kontroller af slisker, skærmgrænser, skade, usårlighed,
profiler, rekorder og sponsorbilleder består fortsat. Forsidens scriptadresser
bruger `?v=superhelt-1`, og lagringsnøglerne er bevaret.

## Målt projektiltæthed i kontrolleret simulation

Den samme begrænsede rutesøgning er kørt i 120 aktive sekunder gennem
udgangspunktet og den nye bane. Ruten bruger faktiske Core-regler og
lovlige input; den kender præcis geometri og er ikke en menneskelig spiltest.

| Måling | Før | Nu |
| --- | ---: | ---: |
| Varslede kast på 120 sekunder | 9 | 17 |
| Første varsling | 21,92 sek. | 8,00 sek. |
| Median mellem varslinger | 12,55 sek. | 4,92 sek. |
| Liv efter forløbet | 3 | 3 |
| Tilbagelagt kameradistance | 41.463 | 41.394 |

De nye varslingstider var 8,00; 21,92; 25,56; 29,64; 39,87; 51,93;
55,98; 65,77; 70,69; 73,89; 77,49; 86,70; 97,53; 101,12; 109,98;
114,60 og 117,80 sekunder. Minimumsintervallet betyder ikke et kast hver
3,2 sekunder: der ventes på en egnet flade og tilstrækkelig restbane.
Første jordkast bruger 650 spilenheders varsling og en ekstra margin på
450 før returpuden; almindelige pudekast varsles 860 foran figuren.

Referenceruten samlede ingen powerups, så sammenligningen er uden genveje
fra flyvning. Den nye simulation viste en pickup efter 30,85 sekunder og
den næste efter 87,83 sekunder, på henholdsvis en høj pude og jord.
Disse mål dokumenterer tættere farer og en mulig rute med tre liv.
De dokumenterer ikke, at tempoet passer til alle børn på 6–12 år.

## Superhelteforløb og billeder

Første fremkomst kan tidligst ske efter 30 aktive sekunder og senere mindst
55 aktive sekunder efter forrige fremkomst. Der ventes på en bred flade
uden projektilmærkning, 750 foran figuren. Der er højst én uopsamlet powerup.
De faste simulationstrin giver samme fremkomst ved samme bane og input.

Opsamling giver 840 aktive trin, syv sekunder, med fart 1050 og en blød
stigning. Det sidste sekund fører ned på en pude eller jord med mindst
600 i bredde og sikker margin foran. Ved behov genereres yderligere
virkelige banedele før landingsstedet vælges. Flyvningen bevarer serie,
hoppekraft og optjent bonus og giver kun almindelige tidspoint. HOP kan
ikke bruges til at optjene perfekte hop i luften. Skade er inaktiv under
effekten. Tilbagekomsten giver mindst 1,2 sekunders beskyttelse og tre
sekunder før et nyt projektil; den bruger ikke almindelig redning.

Tre nye uændrede RGBA-masterfiler er tilføjet: to figurark på 1254 × 1254
og en powerup på 1536 × 1024. Hver figur har neutral kalibrering og tre
flyveposer. Målte områder holder de brede kapper i hver deres pose;
samme skala fra neutralens 70 spilenheder bruges i alle fire billeder.
Powerup vises helt inden for 50 × 50 med et fysisk opsamlingsfelt på 42 × 42.
Kilder, SHA-256, prompts og ankre står i
[superheltesættets README](art/superhelt-saet/README.md).

## Browserkontrol

Visuelle prøver er gennemført i den indbyggede browser ved 1280 × 720:

- Stolpernes fod er skjult ved pudetoppen, og forgrundstræets top flugter
  med stolpens top. Billederne beholder deres proportioner.
- Powerup, pølse og frisbee er kontrolleret i deres faktiske viste størrelse.
- Begge superhelte vender mod højre med læseligt ansigt, kappe og samme
  kalibrerede kropsskala. HUD viser 5,0 sekunder tilbage, og HOP er deaktiveret
  med teksten “Flyver automatisk”.
- Et faktisk Core-forløb gennem alle 840 flyvetrin viser genaktiveret HOP,
  tre liv, fem perfekte i træk og 3/5 hoppekraft efter tilbagekomsten.
- Ingen advarsler eller fejl blev registreret i prøvens browserlog.

Prøverne brugte det aktuelle renderingsprogram og den faktiske Core,
med syntetiske profildata og et inaktivt prøvelager. Den samlede grafikprøve
placerer selv de viste projektiler og powerup; den er ikke dokumentation
for fremkomsthyppighed. Flyve- og slutprøven bruger ægte opsamling og
simulationstrin. Isolationskontrollen bekræftede, at afslutning af en
prøverunde giver nul skrivninger til det rigtige lager og bevarer de
oprindelige profildata byte for byte. Den midlertidige prøveside er fjernet.

Gemte browserbilleder: [samlet grafikprøve](art/superhelt-saet/forhaandsvisning.png)
og [superhelteflyvning](art/superhelt-saet/flyvning.png).
Løbetaktens 9/12 billeder pr. sekund er kontrolleret automatisk, inklusive
pause og lufttid. En menneskelig vurdering af løbets naturlighed under en
hel runde samt kontrol på en fysisk telefon mangler stadig.

## Review

To uafhængige underagenter har gennemgået standarder og krav mod det gemte
udgangspunkt. Der er ingen åbne fund i nogen af akserne efter rettelsen.
Kravreview fandt fejlen i flyvningens landingshorisont; rettelsen har en
dokumenteret rød/grøn regression. Standardreview genkørte den konkrete
regression, og kravreview genkørte hele samlingen med 142 beståede tests.

Kravreview afprøvede desuden 1.632 flyvninger fra lovlige opsamlingssteder
på den reelle bane med neutral, venstre og højre styring: ingen nedbrud,
ingen figur uden for skærmen og bevarede liv, serie og hoppekraft.
De 117 jordreturer havde mindst 823 spilenheder til næste kant og ingen
redning eller livstab i det efterfølgende sekund med neutral styring.
Denne maskinelle kontrol erstatter ikke afprøvning med børn.

## Begrænsninger og leveringsstatus

- Fysiske telefoner, ægte berørings- og flerfingerinput, ydelse på ældre
  mobiler, langsomt net og spiltest med børn er ikke afprøvet.
- De nye tre masterfiler fylder samlet cirka 3,55 MB og er endnu ikke
  optimeret til indlæsning. De ældre billedsæt bevares som historik.
- Nye malede buske, bakker/græs, bonusglæde og skadereaktion er fortsat
  kommende grafikarbejde. Løb, stolper, jord og superhelte er integreret.
- Spilforløbet er ændret i den lokale øveprototype; eksisterende
  v4-profiler og rekorder bevares. En officiel konkurrence kræver låst
  bane og regelversion, fælles rangliste og serverkontrol.
- Ingen Git-branch, PR eller Render-udgivelse er oprettet. Der er fortsat
  ingen fælles rangliste eller konkurrenceserver.

Tidligere rapport: [jordløb, returhop og flagstolper](reference/GRAFIK-7-TESTRESULTATER.md).
